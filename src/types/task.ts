export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

/** Порядок колонок канбану та логічний ранг для сортування за статусом */
export const TASK_STATUSES = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done] as const

export const TASK_STATUS_RANK: Record<TaskStatus, number> = {
  [TaskStatus.Todo]: 0,
  [TaskStatus.InProgress]: 1,
  [TaskStatus.Done]: 2,
}

export interface Task {
  id: number
  projectId: number
  title: string
  assignee: string | null
  status: TaskStatus
  /** ISO-дата (YYYY-MM-DD) */
  dueDate: string
  /** Позиція в межах проекту, єдине джерело порядку для таблиці та канбану */
  order: number
}
