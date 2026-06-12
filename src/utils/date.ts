import { TaskStatus, type Task } from '@/types'

const fullDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dayMonthFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
})

function parse(iso: string): Date | null {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** «21 трав. 2026 р.» — для дати створення проекту */
export function formatDate(iso: string): string {
  const date = parse(iso)
  return date ? fullDateFormatter.format(date) : '—'
}

/** «21 трав.» — для дедлайнів завдань */
export function formatDayMonth(iso: string): string {
  const date = parse(iso)
  return date ? dayMonthFormatter.format(date) : '—'
}

/** Дата у форматі YYYY-MM-DD у ЛОКАЛЬНОМУ часовому поясі (toISOString дав би UTC-зсув) */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Сьогодні у форматі YYYY-MM-DD (межа для дедлайнів) */
export function todayIso(): string {
  return toIsoDate(new Date())
}

/** Дедлайн у минулому (порівняння по днях) */
export function isOverdue(isoDate: string): boolean {
  return isoDate < todayIso()
}

/** Прострочене завдання: дедлайн минув і воно ще не виконане */
export function isTaskOverdue(task: Pick<Task, 'status' | 'dueDate'>): boolean {
  return task.status !== TaskStatus.Done && isOverdue(task.dueDate)
}
