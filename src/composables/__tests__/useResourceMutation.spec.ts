import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { useRouter } from 'vue-router'
import { useCreateResource } from '../useResourceMutation'
import { useUpdateResource } from '../useResourceMutation'
import { useDeleteResource } from '../useResourceMutation'
import api from '@/api/client'

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
      }
    }
  }
)

describe(
  'useResourceMutation',
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
      params: {}
    } as any

    const mockRouter = useRouter()

    beforeEach(
      () => {
        vi.clearAllMocks()
      }
    )

    describe(
      'useCreateResource',
      () => {
        it(
          'initializes with default values',
          () => {
            const { loading, error } = useCreateResource(mockResourceDef)
            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBeNull()
          }
        )

        it(
          'creates resource successfully and redirects',
          async () => {
            const mockData = { name: 'New Resource' }
            vi.mocked(api.post).mockResolvedValueOnce({ success: true })

            const { create, loading } = useCreateResource(mockResourceDef)

            const createPromise = create(
              mockData,
              mockRoute
            )

            expect(
              loading.value
            ).toBe(true)

            await createPromise

            expect(
              loading.value
            ).toBe(false)
            expect(
              api.post
            ).toHaveBeenCalledWith(
              '/api/v1/test',
              mockData
            )
            expect(
              mockRouter.push
            ).toHaveBeenCalledWith({
              name: 'TestSearch'
            })
          }
        )

        it(
          'creates nodes resource with routeParam successfully',
          async () => {
            const nodesResourceDef = {
              name: 'nodes',
              apiBase: '/api/v1/nodes',
              routeParam: 'node_id',
              routeNames: {
                search: 'NodesSearch'
              }
            } as any

            const mockData = { node: 'node123', name: 'Node 123' }
            vi.mocked(api.post).mockResolvedValueOnce({ success: true })

            const { create } = useCreateResource(nodesResourceDef)

            await create(
              mockData,
              mockRoute
            )

            expect(
              api.post
            ).toHaveBeenCalledWith(
              '/api/v1/nodes/node123',
              mockData
            )
          }
        )

        it(
          'handles create errors correctly',
          async () => {
            const mockError = new Error('Create error')
            vi.mocked(api.post).mockRejectedValueOnce(mockError)

            const { create, loading, error } = useCreateResource(mockResourceDef)

            await expect(
              create(
                {},
                mockRoute
              )
            ).rejects.toThrow('Create error')

            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBe(mockError)
          }
        )
      }
    )

    describe(
      'useUpdateResource',
      () => {
        it(
          'initializes with default values',
          () => {
            const { loading, error } = useUpdateResource(mockResourceDef)
            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBeNull()
          }
        )

        it(
          'updates resource successfully',
          async () => {
            const mockData = { name: 'Updated Name' }
            vi.mocked(api.put).mockResolvedValueOnce({ success: true })

            const { update, loading } = useUpdateResource(mockResourceDef)

            const updatePromise = update(
              '123',
              mockData,
              mockRoute
            )

            expect(
              loading.value
            ).toBe(true)

            const result = await updatePromise

            expect(
              loading.value
            ).toBe(false)
            expect(
              result
            ).toEqual({ success: true })
            expect(
              api.put
            ).toHaveBeenCalledWith(
              '/api/v1/test/123',
              mockData
            )
          }
        )

        it(
          'handles update errors correctly',
          async () => {
            const mockError = new Error('Update error')
            vi.mocked(api.put).mockRejectedValueOnce(mockError)

            const { update, loading, error } = useUpdateResource(mockResourceDef)

            await expect(
              update(
                '123',
                {},
                mockRoute
              )
            ).rejects.toThrow('Update error')

            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBe(mockError)
          }
        )
      }
    )

    describe(
      'useDeleteResource',
      () => {
        it(
          'initializes with default values',
          () => {
            const { loading, error } = useDeleteResource(mockResourceDef)
            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBeNull()
          }
        )

        it(
          'deletes resource successfully and redirects',
          async () => {
            vi.mocked(api.delete).mockResolvedValueOnce({ success: true })

            const { remove, loading } = useDeleteResource(mockResourceDef)

            const removePromise = remove(
              '123',
              mockRoute
            )

            expect(
              loading.value
            ).toBe(true)

            await removePromise

            expect(
              loading.value
            ).toBe(false)
            expect(
              api.delete
            ).toHaveBeenCalledWith('/api/v1/test/123')
            expect(
              mockRouter.push
            ).toHaveBeenCalledWith({
              name: 'TestSearch'
            })
          }
        )

        it(
          'handles delete errors correctly',
          async () => {
            const mockError = new Error('Delete error')
            vi.mocked(api.delete).mockRejectedValueOnce(mockError)

            const { remove, loading, error } = useDeleteResource(mockResourceDef)

            await expect(
              remove(
                '123',
                mockRoute
              )
            ).rejects.toThrow('Delete error')

            expect(
              loading.value
            ).toBe(false)
            expect(
              error.value
            ).toBe(mockError)
          }
        )
      }
    )
  }
)
