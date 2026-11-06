<script setup lang="ts">
defineProps<{
  navItems: string[]
}>()

const searchTerm = defineModel<string>('searchTerm', { required: true })
</script>

<template>
  <header class="topbar">
    <nav class="navbar navbar-expand-lg navbar-dark p-0" aria-label="Navegação principal">
      <div class="container-fluid p-0">
        <a class="navbar-brand brand-wrap me-0" href="#" aria-label="CineHub - início">
          <span class="brand-mark">C</span>
          <span class="brand-name">CINEHUB</span>
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cinehub-navigation"
          aria-controls="cinehub-navigation"
          aria-expanded="false"
          aria-label="Abrir ou fechar navegação"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="cinehub-navigation" class="collapse navbar-collapse">
          <ul class="navbar-nav mx-lg-auto my-3 my-lg-0">
            <li v-for="(item, index) in navItems" :key="item" class="nav-item">
              <a
                href="#"
                class="nav-link"
                :class="{ active: index === 0 }"
                :aria-current="index === 0 ? 'page' : undefined"
              >
                {{ item }}
              </a>
            </li>
          </ul>

          <div class="header-actions">
            <form class="search-form" role="search" @submit.prevent>
              <label class="visually-hidden" for="movie-search">Buscar filmes</label>
              <input
                id="movie-search"
                v-model="searchTerm"
                class="form-control search-input"
                type="search"
                placeholder="Buscar filmes..."
                autocomplete="off"
              >
              <button class="btn btn-primary search-button" type="submit">Buscar</button>
            </form>
            <button class="btn btn-primary watch-button" type="button">Assista agora</button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.topbar {
  padding-bottom: 18px;
  margin-bottom: 16px;
}

.brand-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-pink), #ff9f43 58%, var(--accent-gold));
  color: #fff;
  font-weight: 800;
  box-shadow: 0 0 22px rgba(255, 79, 154, 0.28);
}

.brand-name {
  color: #fff;
  letter-spacing: 0.2em;
  font-size: 0.78rem;
  font-weight: 700;
}

.navbar-nav {
  gap: clamp(4px, 0.8vw, 14px);
}

.navbar-nav .nav-link {
  position: relative;
  padding: 8px 5px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.navbar-nav .nav-link.active,
.navbar-nav .nav-link:hover {
  color: var(--accent-cyan);
}

.navbar-nav .nav-link::after {
  position: absolute;
  right: 5px;
  bottom: 2px;
  left: 5px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(71, 232, 255, 0.55);
  content: '';
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}

.navbar-nav .nav-link.active::after,
.navbar-nav .nav-link:hover::after {
  transform: scaleX(1);
}

.header-actions,
.search-form {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-input {
  width: clamp(120px, 14vw, 180px);
  border-color: rgba(71, 232, 255, 0.24);
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.52);
}

.search-input:focus {
  border-color: rgba(71, 232, 255, 0.65);
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(71, 232, 255, 0.12);
}

.watch-button,
.search-button {
  white-space: nowrap;
  border-radius: 999px;
}

.search-button {
  border-color: rgba(71, 232, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
}

.search-button:hover {
  border-color: rgba(71, 232, 255, 0.65);
  background: rgba(71, 232, 255, 0.08);
  color: var(--accent-cyan);
}

.watch-button {
  padding-right: 18px;
  padding-left: 18px;
  background: linear-gradient(135deg, var(--accent-pink), #ff8a4c);
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(255, 79, 154, 0.22);
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.25);
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(71, 232, 255, 0.18);
}

@media (max-width: 991.98px) {
  .header-actions,
  .search-form {
    width: 100%;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
    padding: 8px 0 12px;
  }

  .navbar-nav {
    align-items: flex-start;
    gap: 0;
  }

  .search-input {
    min-width: 0;
    width: 100%;
  }

  .search-form {
    width: 100%;
  }
}

@media (max-width: 575.98px) {
  .brand-name {
    letter-spacing: 0.1em;
    font-size: 0.7rem;
  }

  .search-form {
    align-items: stretch;
  }

  .search-button {
    padding-right: 14px;
    padding-left: 14px;
  }
}
</style>
