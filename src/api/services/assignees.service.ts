import { api } from '@/api/client'

export const assigneesService = {
  list(): Promise<string[]> {
    return api.get<string[]>('/assignees')
  },
}
