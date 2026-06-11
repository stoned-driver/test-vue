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
  getWidthStyle: (columnKey: string) => CSSProperties
  resetWidths: () => void
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

  const columnWidths = usePersistedState<Record<string, number>>(`columns:${tableId}`, {
    ...defaults,
  })
  const isResizing = ref(false)

  let active: ActiveResize | null = null

  function onPointerMove(event: PointerEvent): void {
    if (!active) return
    const width = active.startWidth + event.clientX - active.startX
    columnWidths.value = {
      ...columnWidths.value,
      [active.key]: Math.min(maxWidth, Math.max(minWidth, Math.round(width))),
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

  function getWidthStyle(columnKey: string): CSSProperties {
    const width = columnWidths.value[columnKey]
    return width === undefined ? {} : { width: `${width}px` }
  }

  function resetWidths(): void {
    columnWidths.value = { ...defaults }
  }

  onBeforeUnmount(stopResize)

  return { columnWidths, isResizing, startResize, getWidthStyle, resetWidths }
}
