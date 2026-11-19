<script setup lang="ts">
import PageHeading from '../components/PageHeading.vue'
</script>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Catálogo OMDb"
      title="Séries"
      description="Pesquise séries pelo título ou refine a busca por ano."
    />
    <RouterLink :to="{ name: 'search', query: { tipo: 'series' } }" class="catalog-search-link">
      Buscar séries
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
