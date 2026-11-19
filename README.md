# CineHub

Aplicação de busca de filmes e séries com Vue 3, Vite, Vue Router e dados da OMDb.

## Configuração da API

1. Obtenha uma chave da [OMDb API](https://www.omdbapi.com/).
2. Crie `.env.local` na raiz do projeto e configure:

   ```env
   OMDB_API_KEY=
   ```

3. Preencha `OMDB_API_KEY` e execute `npm run dev`. O comando inicia o proxy Node local e o Vite.

O frontend usa `/api/omdb`; o proxy mantém a chave no processo Node. Não configure a chave com prefixo `VITE_`.

Os arquivos `.env`, `.env.local` e `.env.*.local` são ignorados pelo Git. Variáveis com prefixo `VITE_` ficam expostas no navegador; mantenha `OMDB_API_KEY` somente no servidor.

O proxy em `server/omdbProxy.js` encaminha somente requisições GET para o host fixo da OMDb e mantém a chave no processo Node. A OMDb permite busca por título e detalhes, mas não fornece listas de tendências, popularidade, gêneros pesquisáveis, trailers ou títulos similares.

`src/services/omdb.ts` centraliza busca, detalhes por IMDb ID, paginação, cache de respostas e tratamento de erros de conexão, autenticação e limite de requisições.

## Publicar no Render

1. Envie o repositório ao GitHub e crie um Blueprint no [Render](https://render.com/) apontando para ele. O arquivo `render.yaml` configura a compilação e inicia o servidor que entrega o site e encaminha as chamadas à OMDb.
2. Quando solicitado, informe `OMDB_API_KEY` como variável secreta. Também é possível configurá-la em **Environment** no painel do serviço.
3. Faça o deploy. O Render recompila o site e o servidor usa a variável secreta para acessar a OMDb. Quem abrir o endereço publicado não precisa criar `.env.local`.

## Executar

Com as dependências do projeto instaladas e a chave configurada:

```sh
npm run dev
```

Para validar tipos e gerar a versão de produção:

```sh
npm run build
```

Este produto usa dados fornecidos pela OMDb API.
