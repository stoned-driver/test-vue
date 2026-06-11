import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { toUserMessage } from '@/api/errors'
import { tasksService } from '@/api/services/tasks.service'
import { TaskStatus } from '@/types'
import type { CreateTaskDto, RequestStatus, Task, UpdateTaskDto } from '@/types'
import { applyTaskInsert, boardIndexToGlobal, projectTasksSorted } from '@/utils/taskOrder'
import { useToastsStore } from './toasts.store'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const status = ref<RequestStatus>('idle')

  const toasts = useToastsStore()

  const isLoading = computed(() => status.value === 'loading')
  const hasError = computed(() => status.value === 'error')

  /** Реактивний лічильник завдань для таблиці проектів. */
  const countByProject = computed<Map<number, number>>(() => {
    const counts = new Map<number, number>()
    for (const task of tasks.value) {
      counts.set(task.projectId, (counts.get(task.projectId) ?? 0) + 1)
    }
    return counts
  })

  /** Розподіл за статусами для діаграми на головній. */
  const statusDistribution = computed<Record<TaskStatus, number>>(() => {
    const distribution: Record<TaskStatus, number> = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    }
    for (const task of tasks.value) distribution[task.status] += 1
    return distribution
  })

  function tasksOfProject(projectId: number): Task[] {
    return projectTasksSorted(tasks.value, projectId)
  }

  function tasksByStatus(projectId: number): Record<TaskStatus, Task[]> {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.Todo]: [],
      [TaskStatus.InProgress]: [],
      [TaskStatus.Done]: [],
    }
    for (const task of tasksOfProject(projectId)) grouped[task.status].push(task)
    return grouped
  }

  /**
   * Завантажує всі завдання (головна сторінка: лічильники, діаграма)
   * або завдання одного проекту (сторінка проекту).
   */
  async function fetchTasks(projectId?: number): Promise<void> {
    status.value = 'loading'
    try {
      const fetched = await tasksService.list(projectId)
      tasks.value =
        projectId === undefined
          ? fetched
          : [...tasks.value.filter((task) => task.projectId !== projectId), ...fetched]
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      toasts.error(toUserMessage(error))
    }
  }

  async function createTask(dto: CreateTaskDto): Promise<Task | null> {
    try {
      const created = await tasksService.create(dto)
      tasks.value.push(created)
      toasts.success('Завдання успішно додано')
      return created
    } catch (error) {
      toasts.error(toUserMessage(error))
      return null
    }
  }

  async function updateTask(id: number, dto: UpdateTaskDto): Promise<boolean> {
    try {
      const updated = await tasksService.update(id, dto)
      tasks.value = tasks.value.map((task) => (task.id === id ? updated : task))
      toasts.success('Зміни збережено')
      return true
    } catch (error) {
      toasts.error(toUserMessage(error))
      return false
    }
  }

  /** Оптимістичне видалення зі снапшотом для відкату. */
  async function removeTask(id: number): Promise<boolean> {
    const snapshot = tasks.value
    tasks.value = tasks.value.filter((task) => task.id !== id)
    try {
      await tasksService.remove(id)
      toasts.success('Завдання видалено')
      return true
    } catch (error) {
      tasks.value = snapshot
      toasts.error(toUserMessage(error))
      return false
    }
  }

  /**
   * Спільне ядро DnD: оптимістично переставляє завдання локально
   * (та сама утиліта, що й у мок-бекенда), а в разі помилки сервера
   * відкочує стан зі снапшота.
   */
  async function moveTask(id: number, toStatus: TaskStatus, toGlobalIndex: number): Promise<void> {
    const snapshot = tasks.value
    tasks.value = applyTaskInsert(tasks.value, id, toStatus, toGlobalIndex)
    try {
      await tasksService.update(id, { status: toStatus, order: toGlobalIndex })
    } catch (error) {
      tasks.value = snapshot
      toasts.error(toUserMessage(error))
    }
  }

  /** Перетягування рядка таблиці: статус не змінюється, лише позиція. */
  function moveTaskInTable(id: number, toRowIndex: number): Promise<void> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return Promise.resolve()
    return moveTask(id, task.status, toRowIndex)
  }

  /** Перетягування картки канбану: позиція в колонці → глобальний індекс. */
  function moveTaskOnBoard(id: number, toStatus: TaskStatus, columnIndex: number): Promise<void> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return Promise.resolve()
    const globalIndex = boardIndexToGlobal(tasks.value, task.projectId, id, toStatus, columnIndex)
    return moveTask(id, toStatus, globalIndex)
  }

  /** Локальне прибирання завдань видаленого проекту (каскад робить мок). */
  function dropProjectTasks(projectId: number): void {
    tasks.value = tasks.value.filter((task) => task.projectId !== projectId)
  }

  return {
    tasks,
    status,
    isLoading,
    hasError,
    countByProject,
    statusDistribution,
    tasksOfProject,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    removeTask,
    moveTask,
    moveTaskInTable,
    moveTaskOnBoard,
    dropProjectTasks,
  }
})
