# CineHub

Este modelo ajuda você a começar a desenvolver com Vue 3 no Vite.

## Configuração recomendada do IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Oficial)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (e desative o Vetur).

## Configuração recomendada do navegador

- Navegadores baseados em Chromium (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Ative o Custom Object Formatter no Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Ative o Custom Object Formatter no Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Suporte de tipos para imports `.vue` em TypeScript

O TypeScript não consegue lidar com informações de tipos para imports `.vue` por padrão; por isso, substituímos a CLI `tsc` por `vue-tsc` para checagem de tipos. Nos editores, precisamos do [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) para que o serviço de TypeScript reconheça corretamente os tipos `.vue`.

## Personalizar a configuração

Consulte a [referência de configuração do Vite](https://vite.dev/config/).

## Configuração do projeto

```sh
npm install
```

### Compilar e recarregar em tempo real para desenvolvimento

```sh
npm run dev
```

### Verificar tipos, compilar e minificar para produção

```sh
npm run build
```
