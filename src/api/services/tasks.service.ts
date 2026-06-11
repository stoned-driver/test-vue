import { api } from '@/api/client'
import type { CreateTaskDto, Task, UpdateTaskDto } from '@/types'

export const tasksService = {
  list(projectId?: number): Promise<Task[]> {
    return api.get<Task[]>('/tasks', {
      params: projectId === undefined ? undefined : { projectId },
    })
  },
  create(dto: CreateTaskDto): Promise<Task> {
    return api.post<Task>('/tasks', dto)
  },
  update(id: number, dto: UpdateTaskDto): Promise<Task> {
    return api.put<Task>(`/tasks/${id}`, dto)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/tasks/${id}`)
  },
}
