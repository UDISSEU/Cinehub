<script setup lang="ts">
import { computed, ref } from 'vue'
import Cabecalho from './components/Cabecalho.vue'
import DestaquePrincipal from './components/DestaquePrincipal.vue'
import ContinuarAssistindo from './components/ContinuarAssistindo.vue'
import Recomendacoes from './components/Recomendacoes.vue'

const navItems = ['Início', 'Séries', 'Filmes', 'Novidades', 'Minha lista']
const searchTerm = ref('')

const continueWatching = [
  { title: 'A Espiã', genre: 'Ação', progress: 68, gradient: 'linear-gradient(135deg, #ff7a18, #af1a2d)', poster: '/espia.jpeg' },
  { title: 'Névoa Negra', genre: 'Thriller', progress: 42, gradient: 'linear-gradient(135deg, #6044d9, #1d224f)', poster: '/nevoa.jpeg' },
  { title: 'Dunas da Noite', genre: 'Ficção', progress: 85, gradient: 'linear-gradient(135deg, #1b9aaa, #190b50)', poster: '/dunas.jpeg' },
]

const trending = [
  { title: 'O Último Trovão', caption: 'Ação • 96 min', accent: '#ffe56a', poster: '/raio.jpeg' },
  { title: 'Vento em Fúria', caption: 'Drama • 124 min', accent: '#8ab4ff', poster: '/vento.jpeg' },
  { title: 'Muralha 3', caption: 'Fantasia • 118 min', accent: '#ff6b6b', poster: '/muralha.jpeg' },
  { title: 'Nuvens do Amanhã', caption: 'Sci-Fi • 101 min', accent: '#5eead4', poster: '/nuvem.jpeg' },
]

const filteredTrending = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase('pt-BR')
  if (!query) return trending

  return trending.filter((item) =>
    `${item.title} ${item.caption}`.toLocaleLowerCase('pt-BR').includes(query),
  )
})
</script>

<template>
  <div class="page-shell container py-4 px-3 px-md-4 my-3 rounded-4 shadow">
    <Cabecalho v-model:search-term="searchTerm" :nav-items="navItems" />

    <main class="content container-fluid px-0">
      <DestaquePrincipal />
      <ContinuarAssistindo :items="continueWatching" />
      <Recomendacoes :items="filteredTrending" />
    </main>

    <footer class="site-footer text-center mt-5 pt-4">
      <p class="mb-1">CINEHUB · Sua próxima sessão começa aqui.</p>
      <small>&copy; {{ new Date().getFullYear() }} CineHub</small>
    </footer>
  </div>
</template>

<style scoped>
.page-shell {
  max-width: 1440px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(20, 20, 24, 0.98), rgba(12, 12, 15, 0.98));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(10px);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 42px;
}

.site-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.site-footer small {
  color: rgba(255, 255, 255, 0.48);
}
</style>
