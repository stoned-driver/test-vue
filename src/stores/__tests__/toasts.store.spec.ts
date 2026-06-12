import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToastsStore } from '@/stores/toasts.store'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toasts store', () => {
  it('додає тост і автоматично прибирає його за часом життя', () => {
    const toasts = useToastsStore()
    toasts.success('Проект створено')
    expect(toasts.toasts).toHaveLength(1)
    expect(toasts.toasts[0]).toMatchObject({ kind: 'success', message: 'Проект створено' })

    vi.advanceTimersByTime(4000)
    expect(toasts.toasts).toHaveLength(0)
  })

  it('закриває тост вручну за id', () => {
    const toasts = useToastsStore()
    toasts.error('Щось пішло не так')
    toasts.info('Підказка')
    expect(toasts.toasts).toHaveLength(2)

    const firstId = toasts.toasts[0]?.id
    expect(firstId).toBeDefined()
    if (firstId !== undefined) toasts.dismiss(firstId)

    expect(toasts.toasts).toHaveLength(1)
    expect(toasts.toasts[0]?.kind).toBe('info')
  })
})
