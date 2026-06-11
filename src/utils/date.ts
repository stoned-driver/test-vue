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

/** Сьогодні у форматі YYYY-MM-DD (межа для дедлайнів) */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Дедлайн у минулому (порівняння по днях) */
export function isOverdue(isoDate: string): boolean {
  return isoDate < todayIso()
}
