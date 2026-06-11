import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { AriaSort, SortDirection, SortState } from '@/types'
import { usePersistedState } from './usePersistedState'

interface UseTableSortOptions<T> {
  initial?: SortState<T> | null
  /** Ключ localStorage — сортування переживає перезавантаження */
  persistKey?: string
  /** Власні компаратори для колонок, де природне порівняння не пасує (напр., ранг статусу) */
  comparators?: Partial<Record<keyof T, (a: T, b: T) => number>>
}

interface UseTableSortReturn<T> {
  sortState: Ref<SortState<T> | null>
  sortedItems: ComputedRef<T[]>
  toggleSort: (key: keyof T) => void
  sortDirection: (key: keyof T) => SortDirection | null
  ariaSort: (key: keyof T) => AriaSort
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'uk')
}

/**
 * Тристанове сортування колонок (asc → desc → без сортування)
 * для будь-якого типу рядка. Одна реалізація обслуговує і таблицю
 * проектів, і таблицю завдань.
 */
export function useTableSort<T extends object>(
  items: MaybeRefOrGetter<readonly T[]>,
  options: UseTableSortOptions<T> = {},
): UseTableSortReturn<T> {
  const initial = options.initial ?? null
  const sortState = options.persistKey
    ? usePersistedState<SortState<T> | null>(options.persistKey, initial)
    : (ref(initial) as Ref<SortState<T> | null>)

  const sortedItems = computed<T[]>(() => {
    const list = [...toValue(items)]
    const state = sortState.value
    if (!state) return list
    const factor = state.direction === 'asc' ? 1 : -1
    const custom = options.comparators?.[state.key]
    return list.sort(
      (a, b) => factor * (custom ? custom(a, b) : compareValues(a[state.key], b[state.key])),
    )
  })

  function toggleSort(key: keyof T): void {
    const state = sortState.value
    if (!state || state.key !== key) {
      sortState.value = { key, direction: 'asc' }
    } else if (state.direction === 'asc') {
      sortState.value = { key, direction: 'desc' }
    } else {
      sortState.value = null
    }
  }

  function sortDirection(key: keyof T): SortDirection | null {
    return sortState.value?.key === key ? sortState.value.direction : null
  }

  function ariaSort(key: keyof T): AriaSort {
    const direction = sortDirection(key)
    if (direction === 'asc') return 'ascending'
    if (direction === 'desc') return 'descending'
    return 'none'
  }

  return { sortState, sortedItems, toggleSort, sortDirection, ariaSort }
}
