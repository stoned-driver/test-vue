import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

const TOAST_LIFETIME_MS = 4000

let nextToastId = 1

export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(kind: ToastKind, message: string): void {
    const id = nextToastId
    nextToastId += 1
    toasts.value.push({ id, kind, message })
    setTimeout(() => dismiss(id), TOAST_LIFETIME_MS)
  }

  return {
    toasts,
    dismiss,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }
})
