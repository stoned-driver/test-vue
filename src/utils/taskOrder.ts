import type { Task } from '@/types'
import type { TaskStatus } from '@/types'

const byOrder = (a: Task, b: Task): number => a.order - b.order

/** Завдання проекту, відсортовані за полем order. */
export function projectTasksSorted(tasks: readonly Task[], projectId: number): Task[] {
  return tasks.filter((task) => task.projectId === projectId).sort(byOrder)
}

/**
 * Переміщує завдання на нову глобальну позицію в межах проекту,
 * за потреби змінюючи статус, і перенумеровує order без прогалин.
 * Єдина логіка для таблиці, канбану та мок-бекенду.
 */
export function applyTaskInsert(
  tasks: readonly Task[],
  taskId: number,
  toStatus: TaskStatus,
  toGlobalIndex: number,
): Task[] {
  const moving = tasks.find((task) => task.id === taskId)
  if (!moving) return [...tasks]

  const others = tasks.filter((task) => task.id !== taskId)
  const projectList = projectTasksSorted(others, moving.projectId)
  const insertAt = Math.max(0, Math.min(toGlobalIndex, projectList.length))
  projectList.splice(insertAt, 0, { ...moving, status: toStatus })

  const orderById = new Map<number, number>(projectList.map((task, index) => [task.id, index]))

  return [...others, { ...moving, status: toStatus }].map((task) => {
    const order = orderById.get(task.id)
    return order === undefined ? task : { ...task, order }
  })
}

/**
 * Перетворює позицію в колонці канбану на глобальний індекс проекту.
 * Завдання, що переміщується, виключається з розрахунку.
 */
export function boardIndexToGlobal(
  tasks: readonly Task[],
  projectId: number,
  movingTaskId: number,
  toStatus: TaskStatus,
  columnIndex: number,
): number {
  const projectList = projectTasksSorted(
    tasks.filter((task) => task.id !== movingTaskId),
    projectId,
  )
  const column = projectList.filter((task) => task.status === toStatus)
  if (columnIndex >= column.length) {
    const last = column[column.length - 1]
    return last ? projectList.indexOf(last) + 1 : projectList.length
  }
  const anchor = column[columnIndex]
  return anchor ? projectList.indexOf(anchor) : projectList.length
}

/** Перенумеровує order завдань проекту після видалення. */
export function renumberProjectTasks(tasks: readonly Task[], projectId: number): Task[] {
  const orderById = new Map<number, number>(
    projectTasksSorted(tasks, projectId).map((task, index) => [task.id, index]),
  )
  return tasks.map((task) => {
    const order = orderById.get(task.id)
    return order === undefined ? task : { ...task, order }
  })
}
