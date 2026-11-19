import type {
  CatalogItem,
  CatalogItemType,
  CatalogPage,
  SearchFilters,
} from '../types/catalog'

const apiBaseUrl = '/api/omdb'
const placeholderPoster = '/poster-placeholder.svg'
const cacheDurationMs = 5 * 60 * 1000
const maxRetries = 2
const responseCache = new Map<string, { expiresAt: number; value: unknown }>()
const inFlightRequests = new Map<string, {
  controller: AbortController
  consumers: number
  promise: Promise<unknown>
}>()

interface OmdbSearchResult {
  Title?: string
  Year?: string
  imdbID?: string
  Type?: string
  Poster?: string
}

interface OmdbResponse {
  Response?: 'True' | 'False'
  Error?: string
  Search?: OmdbSearchResult[]
  totalResults?: string
  Title?: string
  Year?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Actors?: string
  Plot?: string
  Language?: string
  Poster?: string
  imdbRating?: string
  imdbID?: string
  Type?: string
  totalSeasons?: string
}

export class OmdbApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly statusMessage?: string,
    readonly responseBody?: string,
  ) {
    super(message)
    this.name = 'OmdbApiError'
  }
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError()
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(abortError())

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    const onAbort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      reject(abortError())
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

async function fetchWithRetry(url: string, signal: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal,
      })
      if (![500, 502, 503, 504].includes(response.status) || attempt >= maxRetries) {
        return response
      }

      await response.body?.cancel()
      await wait(300 * (2 ** attempt), signal)
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        throw abortError()
      }
      if (attempt >= maxRetries) {
        throw new OmdbApiError(
          'Não foi possível conectar à OMDb após novas tentativas. Verifique a conexão e tente novamente.',
        )
      }
      await wait(300 * (2 ** attempt), signal)
    }
  }
}

async function parseResponse<T extends OmdbResponse>(response: Response): Promise<T> {
  const responseBody = await response.text()
  let data: OmdbResponse
  try {
    data = JSON.parse(responseBody) as OmdbResponse
  } catch {
    throw new OmdbApiError(
      'A OMDb retornou uma resposta inválida.',
      response.status,
      undefined,
      responseBody,
    )
  }

  if (!response.ok || data.Response === 'False') {
    const statusMessage = data.Error
    const normalizedMessage = statusMessage?.toLowerCase() ?? ''
    const message = normalizedMessage.includes('invalid api key')
      ? 'A OMDb recusou a chave. Confira OMDB_API_KEY nas variáveis do servidor.'
      : normalizedMessage.includes('request limit')
        ? 'O limite de requisições da OMDb foi atingido. Aguarde antes de tentar novamente.'
        : statusMessage
          ? `A OMDb não conseguiu concluir a solicitação: ${statusMessage}`
          : `A OMDb respondeu com HTTP ${response.status}.`
    throw new OmdbApiError(message, response.status, statusMessage, responseBody)
  }

  return data as T
}

async function omdbGet<T extends OmdbResponse>(
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const search = new URLSearchParams({ r: 'json' })
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).trim()) search.set(key, String(value))
  }

  const url = `${apiBaseUrl}?${search.toString()}`
  throwIfAborted(signal)
  const cached = responseCache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T
  if (cached) responseCache.delete(url)

  let request = inFlightRequests.get(url)
  if (!request) {
    const controller = new AbortController()
    const promise = (async () => {
      const response = await fetchWithRetry(url, controller.signal)
      const data = await parseResponse<T>(response)
      responseCache.set(url, { expiresAt: Date.now() + cacheDurationMs, value: data })
      return data
    })()
    request = { controller, consumers: 0, promise }
    inFlightRequests.set(url, request)
    const currentRequest = request
    void promise.then(
      () => {
        if (inFlightRequests.get(url) === currentRequest) inFlightRequests.delete(url)
      },
      () => {
        if (inFlightRequests.get(url) === currentRequest) inFlightRequests.delete(url)
      },
    )
  }

  const activeRequest = request
  activeRequest.consumers += 1

  return new Promise<T>((resolve, reject) => {
    let released = false
    const release = () => {
      if (released) return
      released = true
      signal?.removeEventListener('abort', onAbort)
      activeRequest.consumers -= 1
      if (activeRequest.consumers === 0 && inFlightRequests.get(url) === activeRequest) {
        inFlightRequests.delete(url)
        activeRequest.controller.abort()
      }
    }
    const onAbort = () => {
      release()
      reject(abortError())
    }

    signal?.addEventListener('abort', onAbort, { once: true })
    activeRequest.promise.then(
      (data) => {
        if (released) return
        release()
        resolve(data as T)
      },
      (error: unknown) => {
        if (released) return
        release()
        reject(error)
      },
    )
  })
}

function emptyPage(page: number): CatalogPage {
  return { items: [], page, totalPages: 1, totalResults: 0 }
}

function isNotFound(error: unknown): boolean {
  return error instanceof OmdbApiError &&
    /not found|no title/i.test(error.statusMessage ?? '')
}

function mapSearchResult(result: OmdbSearchResult): CatalogItem | undefined {
  const type = result.Type === 'movie' ? 'movie' : result.Type === 'series' ? 'series' : undefined
  if (!type || !result.imdbID) return undefined
  return mapResult(result, type)
}

function mapResult(result: OmdbSearchResult & Partial<OmdbResponse>, type: CatalogItemType): CatalogItem {
  const title = result.Title ?? ''
  const yearMatch = result.Year?.match(/^\d{4}/)
  const year = yearMatch ? Number(yearMatch[0]) : undefined
  const genres = result.Genre && result.Genre !== 'N/A'
    ? result.Genre.split(',').map((genre) => genre.trim()).filter(Boolean)
    : []
  const poster = result.Poster && result.Poster !== 'N/A' && /^https?:\/\//i.test(result.Poster)
    ? result.Poster
    : placeholderPoster
  const duration = result.Runtime?.match(/\d+/)?.[0]
  const rating = result.imdbRating && result.imdbRating !== 'N/A'
    ? Number(result.imdbRating)
    : undefined
  const seasons = result.totalSeasons && result.totalSeasons !== 'N/A'
    ? Number(result.totalSeasons)
    : undefined
  const imdbId = result.imdbID ?? ''

  return {
    id: `${type}:${imdbId}`,
    imdbId,
    title,
    originalTitle: title,
    caption: [genres.join(' • '), type === 'series' ? 'Série' : undefined, year]
      .filter(Boolean)
      .join(' • '),
    poster,
    backdrop: poster,
    type,
    description: result.Plot && result.Plot !== 'N/A' ? result.Plot : '',
    rating: Number.isFinite(rating) ? rating : undefined,
    releaseYear: year,
    releaseDate: result.Released && result.Released !== 'N/A' ? result.Released : undefined,
    genres,
    durationMinutes: duration ? Number(duration) : undefined,
    cast: result.Actors && result.Actors !== 'N/A'
      ? result.Actors.split(',').map((actor) => actor.trim()).filter(Boolean)
      : [],
    director: result.Director && result.Director !== 'N/A' ? result.Director : undefined,
    status: undefined,
    tagline: undefined,
    originalLanguage: result.Language && result.Language !== 'N/A' ? result.Language : undefined,
    seasons: Number.isFinite(seasons) ? seasons : undefined,
    relatedItems: [],
  }
}

async function getSearchResults(
  query: string,
  type: CatalogItemType | '',
  year: string,
  page: number,
  signal?: AbortSignal,
): Promise<OmdbResponse> {
  try {
    return await omdbGet<OmdbResponse>({
      s: query,
      type: type || undefined,
      y: year || undefined,
      page,
    }, signal)
  } catch (error) {
    if (isNotFound(error)) return { Response: 'True', Search: [], totalResults: '0' }
    throw error
  }
}

export async function searchSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<CatalogItem[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const result = await getSearchResults(normalizedQuery, '', '', 1, signal)
  return (result.Search ?? [])
    .flatMap((entry) => {
      const item = mapSearchResult(entry)
      return item ? [item] : []
    })
    .slice(0, 6)
}

export async function searchCatalog(
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const query = filters.query.trim()
  if (!query) return emptyPage(filters.page)

  const pageNumber = Math.min(100, Math.max(1, filters.page))
  const result = await getSearchResults(query, filters.type, filters.year, pageNumber, signal)
  const totalResults = Number(result.totalResults) || 0

  return {
    items: (result.Search ?? [])
      .flatMap((entry) => {
        const item = mapSearchResult(entry)
        return item ? [item] : []
      }),
    page: pageNumber,
    totalPages: Math.min(100, Math.max(1, Math.ceil(totalResults / 10))),
    totalResults,
  }
}

export async function getCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  const imdbId = String(id)
  if (!/^tt\d+$/i.test(imdbId)) return undefined

  try {
    const result = await omdbGet<OmdbResponse>({ i: imdbId, plot: 'full' }, signal)
    if (result.Type !== type) return undefined
    return mapResult(result, type)
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}
