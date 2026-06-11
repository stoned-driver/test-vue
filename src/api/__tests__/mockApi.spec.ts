import { beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/api/client'
import { TaskStatus } from '@/types'
import type { Project, Task } from '@/types'

beforeEach(() => {
  localStorage.clear()
})

describe('mock API adapter', () => {
  it('повертає засіяні проекти', async () => {
    const projects = await api.get<Project[]>('/projects')
    expect(projects.length).toBeGreaterThan(0)
    expect(projects[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String) })
  })

  it('створює проект і повертає його у наступному запиті', async () => {
    const created = await api.post<Project>('/projects', {
      name: 'Тестовий проект',
      description: 'Опис',
    })
    expect(created.id).toBeGreaterThan(0)
    const projects = await api.get<Project[]>('/projects')
    expect(projects.some((project) => project.id === created.id)).toBe(true)
  })

  it('відхиляє некоректне імʼя проекту помилкою 400', async () => {
    await expect(api.post<Project>('/projects', { name: 'А' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
    })
  })

  it('відповідає 404 на невідомий маршрут', async () => {
    await expect(api.get<never>('/unknown')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })

  it('переміщення завдання змінює статус і перенумеровує порядок', async () => {
    const all = await api.get<Task[]>('/tasks', { params: { projectId: 1 } })
    const todo = all.filter((task) => task.status === TaskStatus.Todo)
    const moving = todo[0]
    expect(moving).toBeDefined()
    if (!moving) return

    await api.put<Task>(`/tasks/${moving.id}`, { status: TaskStatus.Done, order: 0 })

    const updated = await api.get<Task[]>('/tasks', { params: { projectId: 1 } })
    const moved = updated.find((task) => task.id === moving.id)
    expect(moved?.status).toBe(TaskStatus.Done)

    const orders = updated.sort((a, b) => a.order - b.order).map((task) => task.order)
    expect(orders).toEqual(orders.map((_, index) => index))
  })
})
