<script setup lang="ts">
import { computed } from 'vue'
import CatalogSection from '../components/CatalogSection.vue'
import FeaturedHero from '../components/FeaturedHero.vue'
import PageHeading from '../components/PageHeading.vue'
import { useCuratedMovies } from '../composables/useCuratedMovies'

const catalog = useCuratedMovies(6)
const featured = computed(() => catalog.items.value[0])
const moreMovies = computed(() => catalog.items.value.slice(1))
</script>

<template>
  <div class="home-discovery">
    <FeaturedHero v-if="featured" :item="featured" />
    <PageHeading
      eyebrow="CineHub"
      title="Encontre seu próximo filme ou série"
      description="Pesquise por título, filtre por tipo e ano, confira os detalhes e salve seus favoritos."
    />
    <CatalogSection
      :items="moreMovies"
      title="Filmes para descobrir"
      empty-message="Nenhum filme da seleção está disponível."
      :is-loading="catalog.isLoading.value"
      :error-message="catalog.errorMessage.value"
      @retry="catalog.retry"
    />
    <div class="discovery-actions">
      <RouterLink :to="{ name: 'search' }" class="btn discovery-primary">
        Buscar um título
      </RouterLink>
      <RouterLink :to="{ name: 'movies' }" class="btn discovery-secondary">
        Explorar filmes
      </RouterLink>
      <RouterLink :to="{ name: 'series' }" class="btn discovery-secondary">
        Explorar séries
      </RouterLink>
    </div>
    <p class="catalog-note">O catálogo local fica disponível sem configuração de API.</p>
  </div>
</template>

<style scoped>
.home-discovery {
  display: grid;
  gap: 36px;
}

.discovery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.discovery-primary,
.discovery-secondary {
  padding: 11px 18px;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.discovery-primary {
  background: var(--accent-red);
}

.discovery-secondary {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
}

.discovery-primary:hover,
.discovery-secondary:hover {
  color: #fff;
  filter: brightness(1.12);
}

.catalog-note {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

</style>
