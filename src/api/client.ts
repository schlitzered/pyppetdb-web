import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { apiErrorStore } from '@/stores/apiError'
import { authStore } from '@/stores/auth'
import router from '@/router'

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown,
  params?: Record<string, unknown>,
  silent: boolean = false
): Promise<T> {
  const errorStore = apiErrorStore()
  const auth = authStore()

  const config: AxiosRequestConfig = {
    method: method,
    url: url,
    paramsSerializer: {
      // ponytail: replaced qs with native URLSearchParams for parameter serialization
      serialize: (p) => {
        const search = new URLSearchParams()
        for (const [key, value] of Object.entries(p)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              search.append(key, String(v))
            }
          } else if (value !== undefined && value !== null) {
            search.append(key, String(value))
          }
        }
        return search.toString()
      }
    }
  }

  if (data) {
    config.data = data
  }

  if (params && Object.keys(params).length > 0) {
    config.params = params
  }

  try {
    const response = await axios(config)
    return response.data as T
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      auth.reset()
      router.push({ name: 'LoginError' })
    } else {
      if (!silent) {
        errorStore.set(error)
      }
    }
    throw error
  }
}

export const api = {
  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    silent: boolean = false
  ): Promise<T> {
    return apiRequest<T>('get', url, undefined, params, silent)
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    silent: boolean = false
  ): Promise<T> {
    return apiRequest<T>('post', url, data, params, silent)
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    silent: boolean = false
  ): Promise<T> {
    return apiRequest<T>('put', url, data, params, silent)
  },

  delete<T = unknown>(url: string, silent: boolean = false): Promise<T> {
    return apiRequest<T>('delete', url, undefined, undefined, silent)
  }
}

export default api
