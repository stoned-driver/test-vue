import { z } from 'zod'

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
