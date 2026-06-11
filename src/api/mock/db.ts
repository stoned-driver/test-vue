import type { Project, Task } from '@/types'
import { createSeedData } from './seed'

export interface MockDb {
  projects: Project[]
  tasks: Task[]
  assignees: string[]
  nextProjectId: number
  nextTaskId: number
}

const STORAGE_KEY = 'planer:db:v1'

function isMockDb(value: unknown): value is MockDb {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.assignees) &&
    typeof candidate.nextProjectId === 'number' &&
    typeof candidate.nextTaskId === 'number'
  )
}

/** Читає «базу» з localStorage; за відсутності або пошкодження — пересіює демо-дані. */
export function readDb(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isMockDb(parsed)) return parsed
    } catch {
      // пошкоджений JSON — нижче пересіємо демо-дані
    }
  }
  const seeded = createSeedData()
  writeDb(seeded)
  return seeded
}

export function writeDb(db: MockDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}
