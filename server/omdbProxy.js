import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envFilePath = resolve(projectRoot, '.env.local')
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || process.env.OMDB_PROXY_PORT || 4175)
const host = isProduction ? '0.0.0.0' : '127.0.0.1'
const distPath = resolve(projectRoot, 'dist')
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}
let envFileHasWhitespace = false

if (existsSync(envFilePath)) {
  console.info('Arquivo .env.local encontrado.')
  try {
    const keyLine = readFileSync(envFilePath, 'utf8')
      .split(/\r?\n/)
      .find((line) => /^\s*OMDB_API_KEY\s*=/.test(line))
    if (keyLine) {
      const rawValue = keyLine.slice(keyLine.indexOf('=') + 1)
      const value = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2')
      envFileHasWhitespace = rawValue !== rawValue.trim() || /\s/.test(value)
    }
    process.loadEnvFile(envFilePath)
  } catch {
    console.error('Não foi possível carregar .env.local. Verifique a sintaxe do arquivo.')
  }
} else {
  console.warn('Arquivo .env.local não encontrado na raiz do projeto.')
}

const configuredApiKey = process.env.OMDB_API_KEY
const hasWhitespace = envFileHasWhitespace ||
  (typeof configuredApiKey === 'string' && /\s/.test(configuredApiKey))
const apiKey = configuredApiKey && configuredApiKey.trim() && !hasWhitespace
  ? configuredApiKey.trim()
  : undefined

if (apiKey) {
  console.info('Variável OMDB_API_KEY carregada.')
} else if (hasWhitespace) {
  console.error(isProduction
    ? 'OMDB_API_KEY contém espaços ou quebras de linha; revise a variável secreta sem compartilhar a credencial.'
    : 'OMDB_API_KEY contém espaços ou quebras de linha; revise .env.local sem compartilhar a credencial.')
} else {
  console.warn(isProduction
    ? 'OMDB_API_KEY não configurada. Adicione-a às variáveis de ambiente do serviço de produção.'
    : 'OMDB_API_KEY não configurada. Adicione a chave da OMDb em .env.local.')
}

async function serveFrontend(pathname, response) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    response.writeHead(400).end()
    return
  }

  let filePath = resolve(distPath, `.${decodedPath}`)
  if (filePath !== distPath && !filePath.startsWith(`${distPath}${sep}`)) {
    response.writeHead(404).end()
    return
  }

  let fileInfo
  try {
    fileInfo = await stat(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
      console.error('Falha ao localizar arquivo da aplicação.')
      response.writeHead(500).end()
      return
    }
  }

  if (fileInfo?.isDirectory()) {
    filePath = resolve(filePath, 'index.html')
    try {
      fileInfo = await stat(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
        console.error('Falha ao localizar arquivo da aplicação.')
        response.writeHead(500).end()
        return
      }
      fileInfo = undefined
    }
  }

  if (!fileInfo?.isFile()) {
    if (extname(decodedPath)) {
      response.writeHead(404).end()
      return
    }
    filePath = resolve(distPath, 'index.html')
  }

  try {
    const body = await readFile(filePath)
    const isHashedAsset = filePath.startsWith(`${resolve(distPath, 'assets')}${sep}`)
    response.writeHead(200, {
      'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Length': body.length,
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(body)
  } catch {
    console.error('Falha ao ler a aplicação compilada. Verifique se o build foi concluído.')
    response.writeHead(503).end()
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end()
    return
  }

  if (requestUrl.pathname !== '/api/omdb') {
    if (requestUrl.pathname.startsWith('/api/omdb')) {
      response.writeHead(404).end()
    } else if (isProduction) {
      await serveFrontend(requestUrl.pathname, response)
    } else {
      response.writeHead(404).end()
    }
    return
  }

  if (!apiKey) {
    response.writeHead(503, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    })
    response.end(JSON.stringify({
      source: 'cinehub-proxy',
      status_message: isProduction
        ? hasWhitespace
          ? 'OMDB_API_KEY contém espaços ou quebras de linha. Corrija a variável secreta nas configurações do serviço e faça um novo deploy.'
          : 'OMDB_API_KEY não está configurada. Adicione a chave da OMDb às variáveis de ambiente do serviço e faça um novo deploy.'
        : hasWhitespace
          ? 'OMDB_API_KEY contém espaços ou quebras de linha. Corrija .env.local e reinicie npm run dev.'
          : 'OMDB_API_KEY não está configurada. Adicione a chave da OMDb em .env.local e reinicie npm run dev.',
    }))
    return
  }

  const targetUrl = new URL('https://www.omdbapi.com/')
  targetUrl.search = requestUrl.search
  targetUrl.searchParams.set('apikey', apiKey)
  targetUrl.searchParams.set('r', 'json')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const apiResponse = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    const body = Buffer.from(await apiResponse.arrayBuffer())
    response.writeHead(apiResponse.status, {
      'Cache-Control': 'no-store',
      'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json',
    })
    response.end(body)
  } catch {
    console.error('Falha ao encaminhar requisição à OMDb.')
    if (!response.destroyed && !response.headersSent) {
      response.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify({ status_message: 'O serviço OMDb está temporariamente indisponível.' }))
    } else if (!response.destroyed) {
      response.destroy()
    }
  } finally {
    clearTimeout(timeout)
  }
})

server.listen(port, host, () => {
  console.info(`Servidor CineHub ativo em http://${host}:${port}`)
})

server.on('error', () => {
  console.error(`Não foi possível iniciar o proxy OMDb na porta ${port}. Verifique se a porta já está em uso.`)
  process.exit(1)
})
