import { isAxiosError } from 'axios'

export type ApiErrorCode = 'bad_request' | 'not_found' | 'server' | 'network' | 'unknown'

/** Єдиний типізований формат помилки, який бачать стори та UI. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 404) return 'not_found'
  if (status >= 500) return 'server'
  if (status >= 400) return 'bad_request'
  return 'unknown'
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return fallback
}

/** Нормалізує будь-яку помилку (AxiosError, Error, unknown) до ApiError. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error
  if (isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response
      return new ApiError(extractMessage(data, error.message), status, statusToCode(status))
    }
    return new ApiError('Немає зʼєднання із сервером', 0, 'network')
  }
  if (error instanceof Error) return new ApiError(error.message, 0, 'unknown')
  return new ApiError('Невідома помилка', 0, 'unknown')
}

/** Текст для користувача (тости, інлайн-повідомлення). */
export function toUserMessage(error: unknown): string {
  const apiError = toApiError(error)
  switch (apiError.code) {
    case 'not_found':
      return 'Запис не знайдено. Можливо, його вже видалено.'
    case 'bad_request':
      return apiError.message
    case 'network':
      return 'Немає зʼєднання. Перевірте інтернет і спробуйте ще раз.'
    default:
      return 'Щось пішло не так. Спробуйте ще раз.'
  }
}
