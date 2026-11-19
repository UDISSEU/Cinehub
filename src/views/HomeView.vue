<script setup lang="ts">
import PageHeading from '../components/PageHeading.vue'
</script>

<template>
  <section class="home-discovery">
    <PageHeading
      eyebrow="CineHub"
      title="Encontre seu próximo filme ou série"
      description="Pesquise por título, filtre por tipo e ano, confira os detalhes e salve seus favoritos."
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
    <p class="catalog-note">
      O catálogo da OMDb é pesquisável por título; ele não oferece listas de tendências ou popularidade.
    </p>
  </section>
</template>

<style scoped>
.home-discovery {
  display: grid;
  min-height: 48vh;
  align-content: center;
  gap: 24px;
  padding: clamp(24px, 6vw, 72px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at 85% 15%, rgba(240, 68, 82, 0.16), transparent 42%),
    rgba(255, 255, 255, 0.025);
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
