import { ref, type Ref } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import type { TaskStatus } from '@/types'

/** Структурний мінімум події SortableJS — без залежності від типів бібліотеки */
export interface TaskDragEvent {
  item: HTMLElement
  oldIndex?: number
  newIndex?: number
}

interface UseTaskDragReturn {
  isDragging: Ref<boolean>
  onDragStart: () => void
  onDragEnd: () => void
  onTableReorder: (event: TaskDragEvent) => void
  onBoardDrop: (status: TaskStatus, event: TaskDragEvent) => void
}

/**
 * Єдиний «мозок» drag-and-drop: перекладає DOM-події перетягування
 * (рядки таблиці та картки канбану) у дії стора завдань. Компоненти
 * не знають про стор, стор не знає про DOM — синхронізація двох
 * режимів гарантована тим, що обидва шляхи ведуть в одні й ті самі
 * оптимістичні мутації.
 */
export function useTaskDrag(): UseTaskDragReturn {
  const tasksStore = useTasksStore()
  const isDragging = ref(false)

  function taskIdFromEvent(event: TaskDragEvent): number | null {
    const raw = event.item.dataset.taskId
    const id = raw === undefined ? Number.NaN : Number(raw)
    return Number.isInteger(id) ? id : null
  }

  function onDragStart(): void {
    isDragging.value = true
  }

  function onDragEnd(): void {
    isDragging.value = false
  }

  /** Перетягування рядка таблиці: нова позиція у списку проекту. */
  function onTableReorder(event: TaskDragEvent): void {
    const id = taskIdFromEvent(event)
    if (id === null || event.newIndex === undefined) return
    void tasksStore.moveTaskInTable(id, event.newIndex)
  }

  /** Скидання картки в колонку: новий статус + позиція в колонці. */
  function onBoardDrop(status: TaskStatus, event: TaskDragEvent): void {
    const id = taskIdFromEvent(event)
    if (id === null || event.newIndex === undefined) return
    void tasksStore.moveTaskOnBoard(id, status, event.newIndex)
  }

  return { isDragging, onDragStart, onDragEnd, onTableReorder, onBoardDrop }
}
