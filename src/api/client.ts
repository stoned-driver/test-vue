import axios, { type AxiosRequestConfig } from 'axios'
import { toApiError } from './errors'
import { mockAdapter } from './mock/adapter'

/**
 * Єдиний HTTP-клієнт застосунку. Зараз запити обслуговує мок-адаптер
 * (localStorage + затримка 150–300 мс); щоб перейти на реальний бекенд,
 * достатньо прибрати рядок `adapter: mockAdapter`.
 */
export const httpClient = axios.create({
  baseURL: '/api',
  adapter: mockAdapter,
})

httpClient.interceptors.response.use(undefined, (error: unknown) =>
  Promise.reject(toApiError(error)),
)

/** Тонкий generic-фасад: api.get<Project[]>('/projects') повертає одразу дані. */
export const api = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.get<T>(url, config).then((response) => response.data)
  },
  post<T>(url: string, body: unknown): Promise<T> {
    return httpClient.post<T>(url, body).then((response) => response.data)
  },
  put<T>(url: string, body: unknown): Promise<T> {
    return httpClient.put<T>(url, body).then((response) => response.data)
  },
  delete(url: string): Promise<void> {
    return httpClient.delete(url).then(() => undefined)
  },
}
