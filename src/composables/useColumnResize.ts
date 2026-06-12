import { onBeforeUnmount, ref, type CSSProperties, type Ref } from 'vue'
import { usePersistedState } from './usePersistedState'

interface UseColumnResizeOptions {
  minWidth?: number
  maxWidth?: number
}

interface UseColumnResizeReturn {
  columnWidths: Ref<Record<string, number>>
  isResizing: Ref<boolean>
  startResize: (columnKey: string, event: PointerEvent) => void
  /** Клавіатурна альтернатива перетягуванню ручки (стрілки вліво/вправо) */
  nudgeWidth: (columnKey: string, delta: number) => void
  getWidthStyle: (columnKey: string) => CSSProperties
}

interface ActiveResize {
  key: string
  startX: number
  startWidth: number
}

/**
 * Зміна ширини колонок перетягуванням ручки на межі заголовка.
 * Pointer-події вішаються на document на час перетягування,
 * ширини зберігаються в localStorage.
 */
export function useColumnResize(
  tableId: string,
  defaults: Record<string, number>,
  options: UseColumnResizeOptions = {},
): UseColumnResizeReturn {
  const minWidth = options.minWidth ?? 64
  const maxWidth = options.maxWidth ?? 640

  const columnWidths = usePersistedState<Record<string, number>>(`planer:columns:${tableId}`, {
    ...defaults,
  })
  const isResizing = ref(false)

  let active: ActiveResize | null = null

  function clamp(width: number): number {
    return Math.min(maxWidth, Math.max(minWidth, Math.round(width)))
  }

  function onPointerMove(event: PointerEvent): void {
    if (!active) return
    const width = active.startWidth + event.clientX - active.startX
    columnWidths.value = {
      ...columnWidths.value,
      [active.key]: clamp(width),
    }
  }

  function stopResize(): void {
    active = null
    isResizing.value = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', stopResize)
  }

  function startResize(columnKey: string, event: PointerEvent): void {
    event.preventDefault()
    active = {
      key: columnKey,
      startX: event.clientX,
      startWidth: columnWidths.value[columnKey] ?? defaults[columnKey] ?? minWidth,
    }
    isResizing.value = true
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', stopResize)
  }

  function nudgeWidth(columnKey: string, delta: number): void {
    const current = columnWidths.value[columnKey] ?? defaults[columnKey] ?? minWidth
    columnWidths.value = { ...columnWidths.value, [columnKey]: clamp(current + delta) }
  }

  function getWidthStyle(columnKey: string): CSSProperties {
    const width = columnWidths.value[columnKey]
    return width === undefined ? {} : { width: `${width}px` }
  }

  onBeforeUnmount(stopResize)

  return { columnWidths, isResizing, startResize, nudgeWidth, getWidthStyle }
}
