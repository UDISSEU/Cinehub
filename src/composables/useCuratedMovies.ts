import { onBeforeUnmount, ref, watch } from 'vue'
import type { CatalogItem } from '../types/catalog'
import { getCuratedMovies } from '../services/omdb'

export function useCuratedMovies(pageSize = 10) {
  const items = ref<CatalogItem[]>([])
  const page = ref(1)
  const totalPages = ref(1)
  const isLoading = ref(true)
  const errorMessage = ref('')
  let controller: AbortController | undefined
  let requestId = 0

  async function load(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    const currentRequest = ++requestId
    isLoading.value = true
    errorMessage.value = ''

    try {
      const result = await getCuratedMovies(page.value, pageSize, controller.signal)
      if (currentRequest !== requestId) return
      items.value = result.items
      totalPages.value = result.totalPages
    } catch (error) {
      if (currentRequest !== requestId || (error instanceof DOMException && error.name === 'AbortError')) return
      errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar o catálogo de filmes.'
      items.value = []
    } finally {
      if (currentRequest === requestId) isLoading.value = false
    }
  }

  watch(page, () => void load(), { immediate: true })
  onBeforeUnmount(() => controller?.abort())

  return {
    items,
    page,
    totalPages,
    isLoading,
    errorMessage,
    retry: load,
    setPage(nextPage: number) {
      page.value = Math.max(1, Math.min(nextPage, totalPages.value))
    },
  }
}
