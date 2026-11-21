<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import PageHeading from '../components/PageHeading.vue'
import { useCuratedMovies } from '../composables/useCuratedMovies'

const catalog = useCuratedMovies()
</script>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Catálogo OMDb"
      title="Filmes"
      description="Uma seleção de filmes para explorar. Use a busca para encontrar outros títulos."
    />
    <CatalogSection
      :items="catalog.items.value"
      title="Seleção de filmes"
      empty-message="Nenhum filme da seleção está disponível."
      :is-loading="catalog.isLoading.value"
      :error-message="catalog.errorMessage.value"
      :page="catalog.page.value"
      :page-count="catalog.totalPages.value"
      @retry="catalog.retry"
      @page-change="catalog.setPage"
    />
    <RouterLink :to="{ name: 'search', query: { tipo: 'movie' } }" class="catalog-search-link">
      Buscar outros filmes
    </RouterLink>
  </section>
</template>

<style scoped>
.catalog-search-link {
  display: inline-flex;
  padding: 11px 18px;
  border-radius: 999px;
  background: var(--accent-red);
  color: #fff;
  text-decoration: none;
}

.catalog-search-link:hover {
  color: #fff;
  filter: brightness(1.12);
}
</style>
