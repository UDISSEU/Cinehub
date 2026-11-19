import type {
  CatalogItem,
  CatalogItemType,
} from '../types/catalog'
import { getCatalogItem as loadOmdbItem } from './omdb'

export function getCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  return loadOmdbItem(id, type, signal)
}

export async function loadCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  return loadOmdbItem(id, type, signal)
}

export function getRelatedCatalogItems(item: CatalogItem): CatalogItem[] {
  return item.relatedItems
}
