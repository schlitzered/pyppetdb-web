import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import axios from 'axios'
import { apiRequest } from '../client'
import { api } from '../client'
import { apiErrorStore } from '@/stores/apiError'
import { authStore } from '@/stores/auth'
import router from '@/router'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'

vi.mock('axios', () => {
  const mockAxios = vi.fn()
  ;(mockAxios as any).isAxiosError = (err: any) => err.isAxiosError
  return {
    default: mockAxios
  }
})

describe('api client', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('apiRequest', () => {
    it('success case makes axios request and returns data', async () => {
      vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
      const result = await apiRequest('get', '/test')
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/test'
        })
      )
      expect(result).toBe('success')
    })

    it(
      'passes params with qs serialization config',
      async () => {
        vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
        await apiRequest(
          'get',
          '/test',
          undefined,
          { key: 'val' }
        )
        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            params: { key: 'val' }
          })
        )
        const call = vi.mocked(axios).mock.calls[0][0] as any
        expect(call.paramsSerializer).toBeDefined()
        const serialize = call.paramsSerializer.serialize
        expect(
          serialize({ a: 1 })
        ).toBe('a=1')
        expect(
          serialize({ a: [1, 2] })
        ).toBe('a=1&a=2')
        expect(
          serialize({ a: null, b: undefined, c: 'val' })
        ).toBe('c=val')
      }
    )

    it('handles 401 error by resetting auth and redirecting', async () => {
      const error: any = new Error('Unauthorized')
      error.isAxiosError = true
      error.response = { status: 401 }
      vi.mocked(axios).mockRejectedValueOnce(error)

      const auth = authStore()
      vi.spyOn(auth, 'reset')
      vi.spyOn(router, 'push')

      await expect(apiRequest('get', '/test')).rejects.toThrow('Unauthorized')
      expect(auth.reset).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'LoginError' })
    })

    it('handles non-401 error by calling errorStore if not silent', async () => {
      const error: any = new Error('Server Error')
      error.isAxiosError = true
      error.response = { status: 500 }
      vi.mocked(axios).mockRejectedValueOnce(error)

      const errorStore = apiErrorStore()
      vi.spyOn(errorStore, 'set')

      await expect(apiRequest('get', '/test')).rejects.toThrow('Server Error')
      expect(errorStore.set).toHaveBeenCalledWith(error)
    })

    it('handles non-401 error silently if silent is true', async () => {
      const error: any = new Error('Server Error')
      error.isAxiosError = true
      error.response = { status: 500 }
      vi.mocked(axios).mockRejectedValueOnce(error)

      const errorStore = apiErrorStore()
      vi.spyOn(errorStore, 'set')

      await expect(
        apiRequest('get', '/test', undefined, undefined, true)
      ).rejects.toThrow('Server Error')
      expect(errorStore.set).not.toHaveBeenCalled()
    })
  })

  describe('api convenience methods', () => {
    it('api.get calls apiRequest with get method', async () => {
      vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
      await api.get('/test', { key: 'val' }, false)
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/test',
          params: { key: 'val' }
        })
      )
    })

    it('api.post calls apiRequest with post method', async () => {
      vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
      await api.post('/test', { data: 'val' })
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/test',
          data: { data: 'val' }
        })
      )
    })

    it('api.put calls apiRequest with put method', async () => {
      vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
      await api.put('/test', { data: 'val' })
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/test',
          data: { data: 'val' }
        })
      )
    })

    it('api.delete calls apiRequest with delete method', async () => {
      vi.mocked(axios).mockResolvedValueOnce({ data: 'success' })
      await api.delete('/test')
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'delete', url: '/test' })
      )
    })
  })
})
