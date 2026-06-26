import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { useResourceQuery } from '../useResourceQuery'
import api from '@/api/client'

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn()
      }
    }
  }
)

describe(
  'useResourceQuery',
  () => {
    const mockResourceDef = {
      name: 'test',
      apiBase: '/api/v1/test',
      routeNames: {
        search: 'TestSearch',
        create: 'TestCreate',
        edit: 'TestEdit'
      }
    } as any

    const mockRoute = {
      params: {
        id: '123'
      }
    } as any

    beforeEach(
      () => {
        vi.clearAllMocks()
      }
    )

    it(
      'initializes with default values',
      () => {
        const { data, loading, error } = useResourceQuery(mockResourceDef)
        expect(
          data.value
        ).toBeNull()
        expect(
          loading.value
        ).toBe(false)
        expect(
          error.value
        ).toBeNull()
      }
    )

    it(
      'fetches data successfully with static apiBase',
      async () => {
        const mockData = { id: '123', name: 'Test Resource' }
        vi.mocked(api.get).mockResolvedValueOnce(mockData)

        const { data, loading, error, fetch } = useResourceQuery(mockResourceDef)

        const fetchPromise = fetch(
          '123',
          mockRoute
        )

        expect(
          loading.value
        ).toBe(true)

        const result = await fetchPromise

        expect(
          loading.value
        ).toBe(false)
        expect(
          error.value
        ).toBeNull()
        expect(
          data.value
        ).toEqual(mockData)
        expect(
          result
        ).toEqual(mockData)
        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/test/123')
      }
    )

    it(
      'fetches data successfully with function apiBase',
      async () => {
        const dynamicResourceDef = {
          name: 'test',
          apiBase: (r: any) => `/api/v1/dynamic/${r.params.id}`,
          routeNames: {
            search: 'TestSearch',
            create: 'TestCreate',
            edit: 'TestEdit'
          }
        } as any

        vi.mocked(api.get).mockResolvedValueOnce({ success: true })

        const { fetch } = useResourceQuery(dynamicResourceDef)

        await fetch(
          '456',
          mockRoute
        )

        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/dynamic/123/456')
      }
    )

    it(
      'handles fetch errors correctly',
      async () => {
        const mockError = new Error('Network error')
        vi.mocked(api.get).mockRejectedValueOnce(mockError)

        const { data, loading, error, fetch } = useResourceQuery(mockResourceDef)

        await expect(
          fetch(
            '123',
            mockRoute
          )
        ).rejects.toThrow('Network error')

        expect(
          loading.value
        ).toBe(false)
        expect(
          error.value
        ).toBe(mockError)
        expect(
          data.value
        ).toBeNull()
      }
    )

    it(
      'resets data, loading and error state',
      () => {
        const { data, loading, error, reset } = useResourceQuery(mockResourceDef)

        data.value = { id: '123' }
        loading.value = true
        error.value = new Error('Some error')

        reset()

        expect(
          data.value
        ).toBeNull()
        expect(
          loading.value
        ).toBe(false)
        expect(
          error.value
        ).toBeNull()
      }
    )
  }
)
