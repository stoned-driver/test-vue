import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import { usePersistedState } from './usePersistedState'

type FilterPredicates<T, F> = {
  [K in keyof F]: (item: T, value: F[K]) => boolean
}

interface UseFiltersConfig<T, F> {
  initial: F
  predicates: FilterPredicates<T, F>
  /** Ключ localStorage — фільтри переживають перезавантаження */
  persistKey?: string
}

interface UseFiltersReturn<T, F> {
  filters: Ref<F>
  filteredItems: ComputedRef<T[]>
  isFiltered: ComputedRef<boolean>
  resetFilters: () => void
}

/**
 * Декларативна фільтрація: набір предикатів на кожне поле фільтра.
 * Компонент лише звʼязує інпути з filters — логіка живе тут.
 */
export function useFilters<T, F extends object>(
  items: MaybeRefOrGetter<readonly T[]>,
  config: UseFiltersConfig<T, F>,
): UseFiltersReturn<T, F> {
  const filters = config.persistKey
    ? usePersistedState<F>(config.persistKey, config.initial)
    : (ref(structuredClone(config.initial)) as Ref<F>)

  const predicateKeys = Object.keys(config.predicates) as (keyof F)[]

  const filteredItems = computed<T[]>(() =>
    toValue(items).filter((item) =>
      predicateKeys.every((key) => config.predicates[key](item, filters.value[key])),
    ),
  )

  const isFiltered = computed(
    () => JSON.stringify(filters.value) !== JSON.stringify(config.initial),
  )

  function resetFilters(): void {
    filters.value = structuredClone(config.initial)
  }

  return { filters, filteredItems, isFiltered, resetFilters }
}
