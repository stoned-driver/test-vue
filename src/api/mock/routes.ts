import { ProjectStatus, TaskStatus } from '@/types'
import type { Project, Task } from '@/types'
import { applyTaskInsert, projectTasksSorted, renumberProjectTasks } from '@/utils/taskOrder'
import { readDb, writeDb } from './db'

export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'MockHttpError'
  }
}

export interface MockRequest {
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
}

export interface MockReply {
  status: number
  data: unknown
}

export interface MockRoute {
  method: 'get' | 'post' | 'put' | 'delete'
  pattern: RegExp
  handle: (request: MockRequest) => MockReply
}

// ── Валідація тіла запиту: «бекенд» теж не довіряє клієнту ──

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new MockHttpError(400, 'Некоректне тіло запиту')
  }
  return value as Record<string, unknown>
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new MockHttpError(400, `Поле «${key}» має містити від ${min} до ${max} символів`)
  }
  return value.trim()
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : undefined
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (Object.values(TaskStatus) as string[]).includes(value)
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (Object.values(ProjectStatus) as string[]).includes(value)
}

function requireId(params: Record<string, string>): number {
  const id = Number(params.id)
  if (!Number.isInteger(id)) throw new MockHttpError(400, 'Некоректний ідентифікатор')
  return id
}

// ── Маршрути ──

export const mockRoutes: MockRoute[] = [
  {
    method: 'get',
    pattern: /^\/projects$/,
    handle: () => ({ status: 200, data: readDb().projects }),
  },
  {
    method: 'post',
    pattern: /^\/projects$/,
    handle: ({ body }) => {
      const record = asRecord(body)
      const db = readDb()
      const project: Project = {
        id: db.nextProjectId,
        name: requireString(record, 'name', 2, 100),
        description: optionalString(record, 'description') ?? '',
        status: ProjectStatus.Active,
        createdAt: new Date().toISOString(),
      }
      db.projects.push(project)
      db.nextProjectId += 1
      writeDb(db)
      return { status: 201, data: project }
    },
  },
  {
    method: 'put',
    pattern: /^\/projects\/(?<id>\d+)$/,
    handle: ({ params, body }) => {
      const record = asRecord(body)
      const db = readDb()
      const project = db.projects.find((item) => item.id === requireId(params))
      if (!project) throw new MockHttpError(404, 'Проект не знайдено')
      if (record.name !== undefined) project.name = requireString(record, 'name', 2, 100)
      if (record.description !== undefined) {
        project.description = optionalString(record, 'description') ?? ''
      }
      if (record.status !== undefined) {
        if (!isProjectStatus(record.status))
          throw new MockHttpError(400, 'Невідомий статус проекту')
        project.status = record.status
      }
      writeDb(db)
      return { status: 200, data: project }
    },
  },
  {
    method: 'delete',
    pattern: /^\/projects\/(?<id>\d+)$/,
    handle: ({ params }) => {
      const id = requireId(params)
      const db = readDb()
      if (!db.projects.some((project) => project.id === id)) {
        throw new MockHttpError(404, 'Проект не знайдено')
      }
      db.projects = db.projects.filter((project) => project.id !== id)
      db.tasks = db.tasks.filter((task) => task.projectId !== id)
      writeDb(db)
      return { status: 204, data: null }
    },
  },
  {
    method: 'get',
    pattern: /^\/tasks$/,
    handle: ({ query }) => {
      const db = readDb()
      const projectIdRaw = query.get('projectId')
      if (projectIdRaw === null) return { status: 200, data: db.tasks }
      const projectId = Number(projectIdRaw)
      return { status: 200, data: db.tasks.filter((task) => task.projectId === projectId) }
    },
  },
  {
    method: 'post',
    pattern: /^\/tasks$/,
    handle: ({ body }) => {
      const record = asRecord(body)
      const db = readDb()
      const projectId = Number(record.projectId)
      if (!db.projects.some((project) => project.id === projectId)) {
        throw new MockHttpError(404, 'Проект не знайдено')
      }
      if (!isTaskStatus(record.status)) throw new MockHttpError(400, 'Невідомий статус завдання')
      const assignee = record.assignee
      const task: Task = {
        id: db.nextTaskId,
        projectId,
        title: requireString(record, 'title', 3, 120),
        assignee: typeof assignee === 'string' && assignee.length > 0 ? assignee : null,
        status: record.status,
        dueDate: requireString(record, 'dueDate', 10, 10),
        order: projectTasksSorted(db.tasks, projectId).length,
      }
      db.tasks.push(task)
      db.nextTaskId += 1
      writeDb(db)
      return { status: 201, data: task }
    },
  },
  {
    method: 'put',
    pattern: /^\/tasks\/(?<id>\d+)$/,
    handle: ({ params, body }) => {
      const record = asRecord(body)
      const db = readDb()
      const id = requireId(params)
      const task = db.tasks.find((item) => item.id === id)
      if (!task) throw new MockHttpError(404, 'Завдання не знайдено')

      if (record.title !== undefined) task.title = requireString(record, 'title', 3, 120)
      if (record.dueDate !== undefined) task.dueDate = requireString(record, 'dueDate', 10, 10)
      if (record.assignee !== undefined) {
        task.assignee =
          typeof record.assignee === 'string' && record.assignee.length > 0 ? record.assignee : null
      }

      const wantsStatus = record.status !== undefined
      if (wantsStatus && !isTaskStatus(record.status)) {
        throw new MockHttpError(400, 'Невідомий статус завдання')
      }
      const newStatus = wantsStatus && isTaskStatus(record.status) ? record.status : task.status
      // Переставляємо лише за явним order або РЕАЛЬНОЮ зміною статусу,
      // інакше редагування назви/виконавця зсувало б завдання в кінець
      if (typeof record.order === 'number' || newStatus !== task.status) {
        const fallbackIndex = projectTasksSorted(db.tasks, task.projectId).length
        const toIndex = typeof record.order === 'number' ? record.order : fallbackIndex
        db.tasks = applyTaskInsert(db.tasks, id, newStatus, toIndex)
      }

      writeDb(db)
      const updated = db.tasks.find((item) => item.id === id)
      return { status: 200, data: updated ?? task }
    },
  },
  {
    method: 'delete',
    pattern: /^\/tasks\/(?<id>\d+)$/,
    handle: ({ params }) => {
      const id = requireId(params)
      const db = readDb()
      const task = db.tasks.find((item) => item.id === id)
      if (!task) throw new MockHttpError(404, 'Завдання не знайдено')
      db.tasks = renumberProjectTasks(
        db.tasks.filter((item) => item.id !== id),
        task.projectId,
      )
      writeDb(db)
      return { status: 204, data: null }
    },
  },
  {
    method: 'get',
    pattern: /^\/assignees$/,
    handle: () => ({ status: 200, data: readDb().assignees }),
  },
]
