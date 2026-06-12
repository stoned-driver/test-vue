import { z } from 'zod'
import { TaskStatus } from './task'

export const projectFormSchema = z.object({
  name: z
    .string({ required_error: 'Поле обовʼязкове' })
    .trim()
    .min(1, 'Поле обовʼязкове')
    .min(2, 'Від 2 до 100 символів')
    .max(100, 'Від 2 до 100 символів'),
  description: z.string().trim().max(500, 'До 500 символів').default(''),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

/**
 * Схема форми завдання. minDueDate — нижня межа дедлайну:
 * при створенні це «сьогодні», при редагуванні — мінімум із
 * початкової дати завдання і «сьогодні», інакше просрочене
 * завдання неможливо було б зберегти, не зсунувши дедлайн.
 */
export function createTaskFormSchema(minDueDate: string) {
  return z.object({
    title: z
      .string({ required_error: 'Поле обовʼязкове' })
      .trim()
      .min(1, 'Поле обовʼязкове')
      .min(3, 'Від 3 до 120 символів')
      .max(120, 'Від 3 до 120 символів'),
    projectId: z.string({ required_error: 'Оберіть проект' }).min(1, 'Оберіть проект'),
    status: z.nativeEnum(TaskStatus, { errorMap: () => ({ message: 'Оберіть статус' }) }),
    dueDate: z
      .string({ required_error: 'Поле обовʼязкове' })
      .min(1, 'Поле обовʼязкове')
      .refine((value) => value >= minDueDate, 'Дата не може бути в минулому'),
    assignee: z.string().default(''),
  })
}

export type TaskFormValues = z.infer<ReturnType<typeof createTaskFormSchema>>
