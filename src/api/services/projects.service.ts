import { api } from '@/api/client'
import type { CreateProjectDto, Project, UpdateProjectDto } from '@/types'

export const projectsService = {
  list(): Promise<Project[]> {
    return api.get<Project[]>('/projects')
  },
  create(dto: CreateProjectDto): Promise<Project> {
    return api.post<Project>('/projects', dto)
  },
  update(id: number, dto: UpdateProjectDto): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, dto)
  },
  remove(id: number): Promise<void> {
    return api.delete(`/projects/${id}`)
  },
}
