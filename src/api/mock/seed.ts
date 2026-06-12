import { ProjectStatus, TaskStatus, type Project, type Task } from '@/types'
import { toIsoDate } from '@/utils/date'
import type { MockDb } from './db'

const DAY_MS = 86_400_000

const isoDateInDays = (days: number): string => toIsoDate(new Date(Date.now() + days * DAY_MS))

const isoDaysAgo = (days: number): string => new Date(Date.now() - days * DAY_MS).toISOString()

export const SEED_ASSIGNEES: string[] = [
  'Дмитро Косянчук',
  'Олена Савчук',
  'Максим Вернигора',
  'Ірина Полтавець',
  'Андрій Гайдук',
]

const projects: Project[] = [
  {
    id: 1,
    name: 'Редизайн вебсайту',
    description: 'Оновлення дизайн-системи та публічних сторінок продукту',
    status: ProjectStatus.Active,
    createdAt: isoDaysAgo(21),
  },
  {
    id: 2,
    name: 'Мобільний застосунок',
    description: 'MVP застосунку для iOS та Android',
    status: ProjectStatus.Active,
    createdAt: isoDaysAgo(14),
  },
  {
    id: 3,
    name: 'Маркетинговий лендінг',
    description: 'Лендінг для запуску літньої кампанії',
    status: ProjectStatus.Active,
    createdAt: isoDaysAgo(8),
  },
  {
    id: 4,
    name: 'Внутрішня CRM',
    description: 'Легасі-система, переведена в архів після міграції',
    status: ProjectStatus.Archived,
    createdAt: isoDaysAgo(60),
  },
]

interface SeedTask {
  projectId: number
  title: string
  assignee: string | null
  status: TaskStatus
  dueInDays: number
}

const seedTasks: SeedTask[] = [
  {
    projectId: 1,
    title: 'Зібрати референси та мудборд',
    assignee: 'Олена Савчук',
    status: TaskStatus.Done,
    dueInDays: -5,
  },
  {
    projectId: 1,
    title: 'Оновити дизайн-токени',
    assignee: 'Дмитро Косянчук',
    status: TaskStatus.Done,
    dueInDays: -2,
  },
  {
    projectId: 1,
    title: 'Зверстати головну сторінку',
    assignee: 'Дмитро Косянчук',
    status: TaskStatus.InProgress,
    dueInDays: 2,
  },
  {
    projectId: 1,
    title: 'Адаптив для планшетів',
    assignee: 'Максим Вернигора',
    status: TaskStatus.InProgress,
    dueInDays: 4,
  },
  {
    projectId: 1,
    title: 'Сторінка тарифів',
    assignee: 'Олена Савчук',
    status: TaskStatus.Todo,
    dueInDays: 6,
  },
  { projectId: 1, title: 'Темна тема', assignee: null, status: TaskStatus.Todo, dueInDays: 9 },
  {
    projectId: 1,
    title: 'A/B-тест нового хедера',
    assignee: 'Ірина Полтавець',
    status: TaskStatus.Todo,
    dueInDays: 12,
  },
  {
    projectId: 1,
    title: 'Аудит доступності (WCAG)',
    assignee: null,
    status: TaskStatus.Todo,
    dueInDays: 15,
  },
  {
    projectId: 2,
    title: 'Прототип онбордингу',
    assignee: 'Ірина Полтавець',
    status: TaskStatus.Done,
    dueInDays: -3,
  },
  {
    projectId: 2,
    title: 'Екран авторизації',
    assignee: 'Андрій Гайдук',
    status: TaskStatus.InProgress,
    dueInDays: 1,
  },
  {
    projectId: 2,
    title: 'Пуш-сповіщення',
    assignee: 'Андрій Гайдук',
    status: TaskStatus.Todo,
    dueInDays: 7,
  },
  { projectId: 2, title: 'Офлайн-режим', assignee: null, status: TaskStatus.Todo, dueInDays: 14 },
  {
    projectId: 2,
    title: 'Збірка в TestFlight',
    assignee: 'Максим Вернигора',
    status: TaskStatus.Todo,
    dueInDays: 18,
  },
  {
    projectId: 3,
    title: 'Текст і структура сторінки',
    assignee: 'Ірина Полтавець',
    status: TaskStatus.InProgress,
    dueInDays: 3,
  },
  {
    projectId: 3,
    title: 'Ілюстрації для секцій',
    assignee: 'Олена Савчук',
    status: TaskStatus.Todo,
    dueInDays: 5,
  },
  {
    projectId: 3,
    title: 'Інтеграція з аналітикою',
    assignee: null,
    status: TaskStatus.Todo,
    dueInDays: 10,
  },
  {
    projectId: 4,
    title: 'Експорт історичних даних',
    assignee: 'Максим Вернигора',
    status: TaskStatus.Done,
    dueInDays: -30,
  },
  {
    projectId: 4,
    title: 'Закрити доступи користувачам',
    assignee: 'Дмитро Косянчук',
    status: TaskStatus.Done,
    dueInDays: -25,
  },
]

export function createSeedData(): MockDb {
  const orderCounters = new Map<number, number>()
  const tasks: Task[] = seedTasks.map((seedTask, index) => {
    const order = orderCounters.get(seedTask.projectId) ?? 0
    orderCounters.set(seedTask.projectId, order + 1)
    return {
      id: index + 1,
      projectId: seedTask.projectId,
      title: seedTask.title,
      assignee: seedTask.assignee,
      status: seedTask.status,
      dueDate: isoDateInDays(seedTask.dueInDays),
      order,
    }
  })

  return {
    projects,
    tasks,
    assignees: SEED_ASSIGNEES,
    nextProjectId: projects.length + 1,
    nextTaskId: tasks.length + 1,
  }
}
