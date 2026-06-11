import { ref, watch, type Ref } from 'vue'

/**
 * Ref<T> ⇄ localStorage: читає збережене значення при створенні
 * та синхронізує кожну зміну. Фундамент для збереження фільтрів,
 * сортування, ширини колонок і режиму перегляду між перезавантаженнями.
 */
export function usePersistedState<T>(key: string, defaultValue: T): Ref<T> {
  let initial = defaultValue
  const stored = localStorage.getItem(key)
  if (stored !== null) {
    try {
      initial = JSON.parse(stored) as T
    } catch {
      // пошкоджене значення — лишаємо дефолт
    }
  }

  const state = ref(initial) as Ref<T>

  watch(
    state,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true },
  )

  return state
}
