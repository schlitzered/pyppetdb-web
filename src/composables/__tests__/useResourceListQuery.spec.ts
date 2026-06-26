import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { reactive } from 'vue'
import { nextTick } from 'vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useResourceListQuery } from '../useResourceListQuery'
import api from '@/api/client'

vi.mock(
  'vue',
  async () => {
    const original = await vi.importActual<typeof import('vue')>('vue')
    return {
      ...original,
      watch: vi.fn(original.watch)
    }
  }
)

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

vi.mock(
  'vue-router',
  () => {
    return {
      useRoute: vi.fn(),
      useRouter: vi.fn(),
      createRouter: vi.fn(),
      createWebHistory: vi.fn()
    }
  }
)

describe(
  'useResourceListQuery',
  () => {
    const mockResourceDef = {
      name: 'test-resource',
      apiBase: '/api/v1/test',
      defaultSort: {
        field: 'name',
        order: 'asc'
      },
      searchFilters: [
        { key: 'query', type: 'text', default: '' },
        { key: 'tags', type: 'array', default: [] }
      ],
      routeNames: {
        search: 'TestSearch'
      },
      apiFields: ['id', 'name'],
      dataTransformers: {
        name: (val: any) => String(val).toUpperCase()
      }
    } as any

    const mockRouteInstance = reactive({
      path: '/test-route',
      query: {} as Record<string, any>
    })

    const mockRouterInstance = {
      replace: vi.fn()
    }

    function setRouteQuery(q: Record<string, string>) {
      for (const key of Object.keys(mockRouteInstance.query)) {
        delete mockRouteInstance.query[key]
      }
      Object.assign(mockRouteInstance.query, q)
    }

    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRouteInstance.path = '/test-route'
        setRouteQuery({})
        vi.mocked(useRoute).mockReturnValue(mockRouteInstance as any)
        vi.mocked(useRouter).mockReturnValue(mockRouterInstance as any)
      }
    )

    it(
      'initializes with default state values',
      () => {
        const {
          tableItems,
          tableLoading,
          tablePage,
          tableItemsPerPage,
          tableSortBy,
          formSearchBy
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        expect(
          tableItems.value
        ).toEqual([])
        expect(
          tableLoading.value
        ).toBe(true)
        expect(
          tablePage.value
        ).toBe(1)
        expect(
          tableItemsPerPage.value
        ).toBe(10)
        expect(
          tableSortBy
        ).toEqual([
          { key: 'name', order: 'asc' }
        ])
        expect(
          formSearchBy
        ).toEqual({
          query: '',
          tags: []
        })
      }
    )

    it(
      'initializes based on route query parameters',
      () => {
        setRouteQuery({
          page: '3',
          limit: '25',
          sort: 'created_at',
          sort_order: 'descending',
          query: 'hello'
        })

        const {
          tablePage,
          tableItemsPerPage,
          tableSortBy,
          formSearchBy
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        expect(
          tablePage.value
        ).toBe(3)
        expect(
          tableItemsPerPage.value
        ).toBe(25)
        expect(
          tableSortBy
        ).toEqual([
          { key: 'created_at', order: 'desc' }
        ])
        expect(
          formSearchBy.query
        ).toBe('hello')
      }
    )

    it(
      'fetches data successfully for server dataTableType',
      async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          result: [
            { id: 1, name: 'resource-a' },
            { id: 2, name: 'resource-b' }
          ],
          meta: {
            result_size: 15
          }
        })

        const {
          tableItems,
          tableTotalItems,
          tableLoading,
          getSearchData
        } = useResourceListQuery({
          resourceDef: mockResourceDef,
          dataTableType: 'server',
          defaultItemsPerPage: 10
        })

        getSearchData()

        await vi.waitFor(
          () => {
            expect(
              tableLoading.value
            ).toBe(false)
          }
        )

        expect(
          tableTotalItems.value
        ).toBe(15)
        expect(
          tableItems.value
        ).toEqual([
          { id: 1, name: 'RESOURCE-A' },
          { id: 2, name: 'RESOURCE-B' }
        ])
        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/test',
          {
            sort: 'name',
            sort_order: 'ascending',
            fields: ['id', 'name']
          }
        )
      }
    )

    it(
      'fetches data successfully for client dataTableType',
      async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          result: [
            { id: 1, name: 'resource-c' }
          ]
        })

        const {
          tableItems,
          tableTotalItems,
          tableLoading,
          getSearchData
        } = useResourceListQuery({
          resourceDef: mockResourceDef,
          dataTableType: 'client'
        })

        getSearchData()

        await vi.waitFor(
          () => {
            expect(
              tableLoading.value
            ).toBe(false)
          }
        )

        expect(
          tableTotalItems.value
        ).toBe(0)
        expect(
          tableItems.value
        ).toEqual([
          { id: 1, name: 'RESOURCE-C' }
        ])
        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/test',
          {}
        )
      }
    )

    it(
      'handles API get fetch rejection gracefully',
      async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Fetch failed'))

        const {
          tableItems,
          tableTotalItems,
          tableLoading,
          getSearchData
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        getSearchData()

        await vi.waitFor(
          () => {
            expect(
              tableLoading.value
            ).toBe(false)
          }
        )

        expect(
          tableItems.value
        ).toEqual([])
        expect(
          tableTotalItems.value
        ).toBe(0)
      }
    )

    it(
      'handles getSearchDataTableEvent and updates state',
      async () => {
        vi.mocked(api.get).mockResolvedValue({
          result: []
        })

        const {
          getSearchDataTableEvent,
          tableSortBy
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        getSearchDataTableEvent({
          page: 2,
          itemsPerPage: 25,
          sortBy: [{ key: 'id', order: 'desc' }],
          searchBy: []
        })

        await nextTick()

        expect(
          tableSortBy
        ).toEqual([
          { key: 'id', order: 'desc' }
        ])
      }
    )

    it(
      'handles getSearchDataExpPanelEvent and triggers search',
      async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          result: []
        })

        const {
          getSearchDataExpPanelEvent,
          tableExpPan
        } = useResourceListQuery({
          resourceDef: mockResourceDef,
          tableExpPanName: 'test-panel'
        })

        tableExpPan.value = ['panel-1']
        getSearchDataExpPanelEvent()

        expect(
          mockRouterInstance.replace
        ).toHaveBeenCalledWith({
          name: 'TestSearch',
          query: {
            sort: 'name',
            sort_order: 'ascending',
            'exp_pan_test-panel': 'panel-1'
          }
        })
      }
    )

    it(
      'handles reload call cleanly',
      async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          result: []
        })

        const {
          reload
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        reload()

        expect(
          api.get
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles empty API response cleanly',
      async () => {
        vi.mocked(api.get).mockResolvedValueOnce(null as any)

        const {
          tableItems,
          tableTotalItems,
          tableLoading,
          getSearchData
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        getSearchData()

        await vi.waitFor(
          () => {
            expect(
              tableLoading.value
            ).toBe(false)
          }
        )

        expect(
          tableItems.value
        ).toEqual([])
        expect(
          tableTotalItems.value
        ).toBe(0)
      }
    )

    it(
      'watches route path and re-initializes parameters',
      () => {
        vi.mocked(api.get).mockResolvedValue({
          result: []
        })

        const {
          tablePage,
          tableItemsPerPage
        } = useResourceListQuery({
          resourceDef: mockResourceDef
        })

        const watchMock = vi.mocked(watch)
        expect(
          watchMock
        ).toHaveBeenCalled()

        const pathWatchCall = watchMock.mock.calls.find(
          (call) => {
            const getter = call[0]
            try {
              return typeof getter === 'function' && getter() === mockRouteInstance.path
            } catch {
              return false
            }
          }
        )

        expect(
          pathWatchCall
        ).toBeDefined()
        const watchCallback = pathWatchCall![1] as () => void

        mockRouteInstance.path = '/new-path'
        mockRouteInstance.query.page = '5'
        mockRouteInstance.query.limit = '50'

        watchCallback()

        expect(
          tablePage.value
        ).toBe(1)
        expect(
          tableItemsPerPage.value
        ).toBe(50)
      }
    )
  }
)
