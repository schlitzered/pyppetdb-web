import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { reactive } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import ResourceTable from '../ResourceTable.vue'

const mockRoute = reactive({
  params: {}
})

const mockRouter = {
  push: vi.fn(),
  getRoutes: vi.fn(() => {
    return [
      {
        name: 'some-link-route',
        path: '/some/:id/route'
      },
      {
        name: 'custom-link-route',
        path: '/some/:customId/route'
      },
      {
        name: 'param-link-route',
        path: '/nodes/:env/:id'
      }
    ]
  })
}

vi.mock(
  'vue-router',
  () => {
    return {
      useRoute: () => mockRoute,
      useRouter: () => mockRouter
    }
  }
)

vi.mock(
  '@/composables/useResourceListQuery',
  () => {
    return {
      useResourceListQuery: vi.fn()
    }
  }
)

vi.mock(
  'primevue/useconfirm',
  () => {
    return {
      useConfirm: vi.fn()
    }
  }
)

vi.mock(
  'primevue/usetoast',
  () => {
    return {
      useToast: vi.fn()
    }
  }
)

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        delete: vi.fn()
      }
    }
  }
)

vi.mock(
  '@/stores/auth',
  () => {
    return {
      authStore: vi.fn()
    }
  }
)

function getMockResourceDef({
  name = 'nodes',
  searchFilters = [],
  tableColumns = [],
  apiBase = 'nodes',
  permissions = {
    delete: () => {
      return true
    }
  }
} = {}) {
  return {
    name,
    routeParam: 'id',
    label: 'Node',
    labelPlural: 'Nodes',
    searchFilters,
    tableColumns,
    apiBase,
    defaultSort: {
      field: 'id',
      order: 'asc'
    },
    permissions,
    toolbar: {
      crud: {
        title: 'Nodes Toolbar',
        items: []
      }
    },
    routeNames: {
      search: 'nodes-search'
    }
  }
}

const customStubs = {
  ...primeVueStubs,
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe(
  'ResourceTable',
  () => {
    let mockTableItems
    let mockTableLoading
    let mockTablePage
    let mockTableItemsPerPage
    let mockTableItemsPerPageOptions
    let mockTableTotalItems
    let mockTableSortBy
    let mockTableExpPan
    let mockFormSearchBy
    let mockGetSearchData
    let mockGetSearchDataTableEvent
    let mockReload
    let mockConfirm
    let mockToast
    let mockAuth

    beforeEach(
      () => {
        vi.clearAllMocks()
        vi.useRealTimers()
        mockRoute.params = {}
        mockTableItems = ref([])
        mockTableLoading = ref(false)
        mockTablePage = ref(1)
        mockTableItemsPerPage = ref(10)
        mockTableItemsPerPageOptions = ref([10, 20, 50])
        mockTableTotalItems = ref(0)
        mockTableSortBy = ref([])
        mockTableExpPan = ref([])
        mockFormSearchBy = reactive({
          secret_value: '',
          secret_id: ''
        })
        mockGetSearchData = vi.fn()
        mockGetSearchDataTableEvent = vi.fn()
        mockReload = vi.fn()

        vi.mocked(useResourceListQuery).mockReturnValue({
          tableItems: mockTableItems,
          tableLoading: mockTableLoading,
          tablePage: mockTablePage,
          tableItemsPerPage: mockTableItemsPerPage,
          tableItemsPerPageOptions: mockTableItemsPerPageOptions,
          tableTotalItems: mockTableTotalItems,
          tableSortBy: mockTableSortBy,
          tableExpPan: mockTableExpPan,
          formSearchBy: mockFormSearchBy,
          getSearchData: mockGetSearchData,
          getSearchDataTableEvent: mockGetSearchDataTableEvent,
          reload: mockReload
        })

        mockConfirm = {
          require: vi.fn()
        }
        vi.mocked(useConfirm).mockReturnValue(mockConfirm)

        mockToast = {
          add: vi.fn()
        }
        vi.mocked(useToast).mockReturnValue(mockToast)

        mockAuth = {
          hasPermission: vi.fn(() => {
            return true
          })
        }
        vi.mocked(authStore).mockReturnValue(mockAuth)

        vi.spyOn(
          global.crypto.subtle,
          'digest'
        ).mockResolvedValue(
          new Uint8Array([170, 187, 204]).buffer
        )
      }
    )

    it(
      'mounts and shows search filters and rows correctly',
      () => {
        const filters = [
          {
            key: 'name',
            label: 'Search Name',
            type: 'text'
          },
          {
            key: 'status',
            label: 'Search Status',
            type: 'select',
            options: [
              {
                label: 'Active',
                value: 'active'
              }
            ]
          },
          {
            key: 'enabled',
            label: 'Enabled',
            type: 'boolean'
          }
        ]
        const columns = [
          {
            key: 'id',
            label: 'ID',
            sortable: true
          },
          {
            key: 'name',
            label: 'Name',
            linkRoute: 'some-link-route'
          },
          {
            key: 'nested.value',
            label: 'Nested Value'
          },
          {
            key: 'status',
            label: 'Status',
            formatter: (
              val
            ) => {
              return String(val).toUpperCase()
            }
          }
        ]
        mockTableItems.value = [
          {
            id: 1,
            name: 'node-1',
            nested: {
              value: 'nested-val'
            },
            status: 'active'
          }
        ]
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                searchFilters: filters,
                tableColumns: columns
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        expect(
          wrapper.exists()
        ).toBe(true)
        expect(
          mockGetSearchData
        ).toHaveBeenCalled()
      }
    )

    it(
      'triggers search methods for inputs, select, and boolean filters',
      async () => {
        vi.useFakeTimers()
        const filters = [
          {
            key: 'name',
            label: 'Search Name',
            type: 'text'
          },
          {
            key: 'status',
            label: 'Search Status',
            type: 'select',
            options: [
              {
                label: 'Active',
                value: 'active'
              }
            ]
          },
          {
            key: 'enabled',
            label: 'Enabled',
            type: 'boolean'
          }
        ]
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                searchFilters: filters
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const accordion = wrapper.findComponent({
          name: 'Accordion'
        })
        await accordion.vm.$emit(
          'update:value',
          ['filters']
        )

        const inputText = wrapper.findComponent({
          name: 'InputText'
        })
        await inputText.vm.$emit(
          'update:model-value',
          'test'
        )
        await inputText.vm.$emit(
          'input'
        )
        vi.advanceTimersByTime(
          300
        )
        expect(
          mockGetSearchData
        ).toHaveBeenCalled()

        const selectComps = wrapper.findAllComponents({
          name: 'Select'
        })
        const select = selectComps[0]
        await select.vm.$emit(
          'update:model-value',
          'active'
        )
        await select.vm.$emit(
          'change'
        )
        expect(
          mockGetSearchData
        ).toHaveBeenCalled()

        const booleanSelect = selectComps[1]
        await booleanSelect.vm.$emit(
          'update:model-value',
          true
        )
        await booleanSelect.vm.$emit(
          'change'
        )
        expect(
          mockGetSearchData
        ).toHaveBeenCalled()
      }
    )

    it(
      'calculates link params dynamically with simple and custom configurations',
      () => {
        const columns = [
          {
            key: 'id',
            label: 'ID',
            linkRoute: 'some-link-route'
          },
          {
            key: 'name',
            label: 'Name',
            linkRoute: 'custom-link-route',
            linkParam: 'customId'
          },
          {
            key: 'nested.value',
            label: 'Nested Value',
            linkRoute: 'param-link-route',
            linkParams: {
              env: 'environment',
              id: 'id'
            }
          }
        ]
        mockTableItems.value = [
          {
            id: 123,
            name: 'node-123',
            environment: 'production',
            nested: {
              value: 'nested-val'
            }
          }
        ]
        mockRoute.params = {
          env: 'staging'
        }
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                tableColumns: columns
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const linkParams1 = wrapper.vm.getLinkParams(
          columns[0],
          mockTableItems.value[0]
        )
        expect(
          linkParams1
        ).toEqual({
          id: 123
        })

        const linkParams2 = wrapper.vm.getLinkParams(
          columns[1],
          mockTableItems.value[0]
        )
        expect(
          linkParams2
        ).toEqual({
          customId: 'node-123'
        })

        const linkParams3 = wrapper.vm.getLinkParams(
          columns[2],
          mockTableItems.value[0]
        )
        expect(
          linkParams3
        ).toEqual({
          env: 'production',
          id: 123
        })
      }
    )

    it(
      'performs formatting on null/undefined and basic data types',
      () => {
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const formattedNull = wrapper.vm.formatVal(
          null,
          {
            key: 'test',
            label: 'Test'
          },
          {}
        )
        expect(
          formattedNull
        ).toBe('')

        const formattedUndefined = wrapper.vm.formatVal(
          undefined,
          {
            key: 'test',
            label: 'Test'
          },
          {}
        )
        expect(
          formattedUndefined
        ).toBe('')

        const formattedString = wrapper.vm.formatVal(
          'hello',
          {
            key: 'test',
            label: 'Test'
          },
          {}
        )
        expect(
          formattedString
        ).toBe('hello')
      }
    )

    it(
      'watches secret_value and secret_id for redactor resource type',
      async () => {
        mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                name: 'nodes_secrets_redactor'
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        mockFormSearchBy.secret_value = 'some-secret-key'
        await flushPromises()
        expect(
          mockFormSearchBy.secret_id
        ).toBe('aabbcc')

        mockFormSearchBy.secret_value = ''
        await flushPromises()
        expect(
          mockFormSearchBy.secret_id
        ).toBe('')

        mockFormSearchBy.secret_value = 'some-secret-key'
        await flushPromises()
        expect(
          mockFormSearchBy.secret_id
        ).toBe('aabbcc')

        mockFormSearchBy.secret_id = 'different-id'
        await flushPromises()
        expect(
          mockFormSearchBy.secret_value
        ).toBe('')
      }
    )

    it(
      'handles pagination event on DataTable',
      () => {
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        wrapper.vm.onPage({
          page: 2,
          rows: 25
        })
        expect(
          mockGetSearchDataTableEvent
        ).toHaveBeenCalledWith({
          page: 3,
          itemsPerPage: 25,
          sortBy: mockTableSortBy,
          searchBy: []
        })
      }
    )

    it(
      'handles sorting event on DataTable',
      () => {
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        wrapper.vm.onSort({
          sortField: 'name',
          sortOrder: 1
        })
        expect(
          mockGetSearchDataTableEvent
        ).toHaveBeenCalledWith({
          page: 1,
          itemsPerPage: 10,
          sortBy: [
            {
              key: 'name',
              order: 'asc'
            }
          ],
          searchBy: []
        })

        wrapper.vm.onSort({
          sortField: 'name',
          sortOrder: -1
        })
        expect(
          mockGetSearchDataTableEvent
        ).toHaveBeenCalledWith({
          page: 1,
          itemsPerPage: 10,
          sortBy: [
            {
              key: 'name',
              order: 'desc'
            }
          ],
          searchBy: []
        })

        wrapper.vm.onSort({
          sortField: undefined,
          sortOrder: null
        })
        expect(
          mockGetSearchDataTableEvent
        ).toHaveBeenCalledWith({
          page: 1,
          itemsPerPage: 10,
          sortBy: [],
          searchBy: []
        })
      }
    )

    it(
      'deletes resource row successfully via confirm dialog accept callback',
      async () => {
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                apiBase: 'custom-nodes'
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        vi.mocked(api.delete).mockResolvedValueOnce({})
        wrapper.vm.handleDeleteRow({
          id: 456
        })
        expect(
          mockConfirm.require
        ).toHaveBeenCalled()
        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        await acceptCallback()
        expect(
          api.delete
        ).toHaveBeenCalledWith(
          'custom-nodes/456'
        )
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Resource deleted successfully',
          life: 3000
        })
        expect(
          mockReload
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles delete resource row failures via confirm dialog accept callback',
      async () => {
        const apiBaseFn = (
          r
        ) => {
          return `dynamic-base/${r.params.env}`
        }
        mockRoute.params = {
          env: 'prod'
        }
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                apiBase: apiBaseFn
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        vi.mocked(api.delete).mockRejectedValueOnce(
          new Error('delete failed')
        )
        wrapper.vm.handleDeleteRow({
          key: 'row-key'
        })
        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        await acceptCallback()
        expect(
          api.delete
        ).toHaveBeenCalledWith(
          'dynamic-base/prod/row-key'
        )
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete resource',
          life: 3000
        })
      }
    )

    it(
      'hides delete row options if permissions delete is false',
      () => {
        mockAuth.hasPermission.mockReturnValueOnce(
          false
        )
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                permissions: {
                  delete: (
                    hasPerm
                  ) => {
                    return hasPerm('nodes:delete')
                  }
                }
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        expect(
          wrapper.vm.canDelete
        ).toBe(false)
      }
    )

    it(
      'triggers handleDeleteRow on trash button click',
      async () => {
        const columns = [
          {
            key: 'id',
            label: 'ID'
          }
        ]
        mockTableItems.value = [
          {
            id: 123
          }
        ]
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                tableColumns: columns
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const deleteBtn = wrapper.findComponent({
          name: 'Button'
        })
        await deleteBtn.trigger(
          'click'
        )
        expect(
          mockConfirm.require
        ).toHaveBeenCalled()
      }
    )

    it(
      'returns false for canDelete if permissions.delete is not defined',
      () => {
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                permissions: {
                  delete: undefined
                }
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        expect(
          wrapper.vm.canDelete
        ).toBe(false)
      }
    )

    it(
      'logs console error when crypto digest fails',
      async () => {
        const spyError = vi.spyOn(
          console,
          'error'
        ).mockImplementation(
          () => {}
        )
        vi.spyOn(
          global.crypto.subtle,
          'digest'
        ).mockRejectedValueOnce(
          new Error('crypto error')
        )
        mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                name: 'nodes_secrets_redactor'
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        mockFormSearchBy.secret_value = 'fail-secret'
        await flushPromises()
        expect(
          spyError
        ).toHaveBeenCalled()
        spyError.mockRestore()
      }
    )

    it(
      'returns baseParams directly when linkRoute is not found in router',
      () => {
        const columns = [
          {
            key: 'id',
            label: 'ID',
            linkRoute: 'non-existent-route'
          }
        ]
        const wrapper = mount(
          ResourceTable,
          {
            props: {
              resourceDef: getMockResourceDef({
                tableColumns: columns
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const linkParams = wrapper.vm.getLinkParams(
          columns[0],
          {
            id: 789
          }
        )
        expect(
          linkParams
        ).toEqual({
          id: 789
        })
      }
    )
  }
)
