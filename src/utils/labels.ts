import { ProjectStatus, TaskStatus } from '@/types'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Активний',
  [ProjectStatus.Archived]: 'Архівний',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
}

/** Українська плюралізація: pluralizeUk(3, ['проект', 'проекти', 'проектів']) */
export function pluralizeUk(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}
