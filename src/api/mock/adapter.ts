import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { MockHttpError, mockRoutes } from './routes'

const MIN_LATENCY_MS = 150
const MAX_LATENCY_MS = 300

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function buildResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return {
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  }
}

function buildHttpError(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
): AxiosError {
  return new AxiosError(
    message,
    String(status),
    config,
    undefined,
    buildResponse(config, status, { message }),
  )
}

function parseBody(config: InternalAxiosRequestConfig): unknown {
  if (typeof config.data !== 'string' || config.data.length === 0) return config.data
  try {
    return JSON.parse(config.data) as unknown
  } catch {
    return config.data
  }
}

function mergeQuery(rawQuery: string, params: unknown): URLSearchParams {
  const query = new URLSearchParams(rawQuery)
  if (typeof params === 'object' && params !== null) {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null) query.set(key, String(value))
    }
  }
  return query
}

/**
 * Кастомний адаптер Axios — «бекенд» застосунку.
 * Перехоплює запити до того, як вони підуть у мережу, читає/пише localStorage
 * і відповідає з реалістичною затримкою 150–300 мс. Помилки повертає
 * справжніми AxiosError, тож увесь конвеєр обробки помилок працює як зі
 * справжнім сервером. Щоб перейти на реальний бекенд, достатньо прибрати
 * `adapter: mockAdapter` у client.ts.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  await sleep(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS))

  const method = (config.method ?? 'get').toLowerCase()
  const [path = '', rawQuery = ''] = (config.url ?? '').split('?')

  const route = mockRoutes.find(
    (candidate) => candidate.method === method && candidate.pattern.test(path),
  )
  if (!route) {
    throw buildHttpError(config, 404, `Маршрут не знайдено: ${method.toUpperCase()} ${path}`)
  }

  const match = route.pattern.exec(path)
  try {
    const reply = route.handle({
      params: match?.groups ?? {},
      query: mergeQuery(rawQuery, config.params),
      body: parseBody(config),
    })
    return buildResponse(config, reply.status, reply.data)
  } catch (error) {
    if (error instanceof MockHttpError) {
      throw buildHttpError(config, error.status, error.message)
    }
    throw error
  }
}
