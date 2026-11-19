export type CatalogItemType = 'movie' | 'series'

export interface CatalogItem {
  id: string
  imdbId: string
  title: string
  originalTitle: string
  caption: string
  poster: string
  backdrop: string
  type: CatalogItemType
  description: string
  rating?: number
  releaseYear?: number
  releaseDate?: string
  genres: string[]
  durationMinutes?: number
  cast: string[]
  director?: string
  trailerUrl?: string
  status?: string
  tagline?: string
  originalLanguage?: string
  seasons?: number
  episodes?: number
  relatedItems: CatalogItem[]
}

export interface CatalogPage {
  items: CatalogItem[]
  page: number
  totalPages: number
  totalResults: number
}

export interface SearchFilters {
  query: string
  type: CatalogItemType | ''
  year: string
  page: number
}
