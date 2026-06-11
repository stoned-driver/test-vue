import type { ProjectStatus } from './project'
import type { TaskStatus } from './task'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface CreateProjectDto {
  name: string
  description: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  status?: ProjectStatus
}

export interface CreateTaskDto {
  projectId: number
  title: string
  assignee: string | null
  status: TaskStatus
  dueDate: string
}

export interface UpdateTaskDto {
  title?: string
  assignee?: string | null
  status?: TaskStatus
  dueDate?: string
  /** Нова глобальна позиція в межах проекту (для DnD) */
  order?: number
}
