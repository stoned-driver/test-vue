import { describe, expect, it } from 'vitest'
import { TaskStatus, type Task } from '@/types'
import {
  applyTaskInsert,
  boardIndexToGlobal,
  projectTasksSorted,
  renumberProjectTasks,
} from '@/utils/taskOrder'

function makeTask(id: number, status: TaskStatus, order: number, projectId = 1): Task {
  return {
    id,
    projectId,
    title: `Завдання ${id}`,
    assignee: null,
    status,
    dueDate: '2026-07-01',
    order,
  }
}

// Проект: todo [1, 2], in_progress [3], done [4]
const tasks: Task[] = [
  makeTask(1, TaskStatus.Todo, 0),
  makeTask(2, TaskStatus.Todo, 1),
  makeTask(3, TaskStatus.InProgress, 2),
  makeTask(4, TaskStatus.Done, 3),
  makeTask(99, TaskStatus.Todo, 0, 7),
]

const orderOf = (list: Task[], id: number): number => {
  const task = list.find((item) => item.id === id)
  if (!task) throw new Error(`Завдання ${id} не знайдено`)
  return task.order
}

describe('applyTaskInsert', () => {
  it('переміщує завдання на нову позицію в межах проекту', () => {
    const result = applyTaskInsert(tasks, 1, TaskStatus.Todo, 1)
    expect(orderOf(result, 2)).toBe(0)
    expect(orderOf(result, 1)).toBe(1)
    expect(orderOf(result, 3)).toBe(2)
  })

  it('змінює статус і перенумеровує порядок без прогалин', () => {
    const result = applyTaskInsert(tasks, 1, TaskStatus.Done, 3)
    const moved = result.find((task) => task.id === 1)
    expect(moved?.status).toBe(TaskStatus.Done)

    const orders = projectTasksSorted(result, 1).map((task) => task.order)
    expect(orders).toEqual([0, 1, 2, 3])
  })

  it('не чіпає завдання інших проектів', () => {
    const result = applyTaskInsert(tasks, 1, TaskStatus.Done, 0)
    expect(orderOf(result, 99)).toBe(0)
  })

  it('обрізає індекс за межами списку', () => {
    const result = applyTaskInsert(tasks, 1, TaskStatus.Todo, 100)
    expect(orderOf(result, 1)).toBe(3)
  })
})

describe('boardIndexToGlobal', () => {
  it('перекладає позицію в колонці на глобальний індекс', () => {
    // кинути картку 1 на початок колонки Done → перед завданням 4
    const index = boardIndexToGlobal(tasks, 1, 1, TaskStatus.Done, 0)
    expect(index).toBe(2)
  })

  it('кінець колонки → після останньої картки колонки', () => {
    const index = boardIndexToGlobal(tasks, 1, 4, TaskStatus.Todo, 2)
    expect(index).toBe(2)
  })

  it('порожня колонка → кінець списку проекту (без урахування завдання, що рухається)', () => {
    const noDone = tasks.filter((task) => task.status !== TaskStatus.Done)
    const index = boardIndexToGlobal(noDone, 1, 1, TaskStatus.Done, 0)
    expect(index).toBe(2)

    const result = applyTaskInsert(noDone, 1, TaskStatus.Done, index)
    const orders = projectTasksSorted(result, 1).map((task) => [task.id, task.order])
    expect(orders).toEqual([
      [2, 0],
      [3, 1],
      [1, 2],
    ])
  })
})

describe('renumberProjectTasks', () => {
  it('закриває прогалини після видалення', () => {
    const withoutSecond = tasks.filter((task) => task.id !== 2)
    const result = renumberProjectTasks(withoutSecond, 1)
    const orders = projectTasksSorted(result, 1).map((task) => task.order)
    expect(orders).toEqual([0, 1, 2])
  })
})
