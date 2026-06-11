export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
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
