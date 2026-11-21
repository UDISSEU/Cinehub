# CineHub

Aplicação de descoberta de filmes e séries com Vue 3, Vite e Vue Router. O catálogo local funciona sem configuração de API.

`src/services/localCatalog.ts` contém filmes e séries, sinopses curtas e IDs para abrir os detalhes. Busca, páginas de catálogo e detalhes desses títulos não fazem chamadas externas. Para adicionar títulos, edite a lista `entries` nesse arquivo.

O proxy OMDb é opcional e não é necessário para executar o catálogo. A busca cobre os títulos locais; para consultar títulos fora da lista, seria preciso configurar uma fonte de dados externa.

## Publicar no Render

1. Envie o repositório ao GitHub e crie um Blueprint no [Render](https://render.com/) apontando para ele. O arquivo `render.yaml` configura a compilação e inicia o servidor que entrega o site.
2. Faça o deploy. O catálogo funciona sem variável secreta e sem arquivo `.env.local`.

## Executar

Com Node.js e as dependências do projeto instaladas:

```sh
npm run dev
```

Para validar tipos e gerar a versão de produção:

```sh
npm run build
```
