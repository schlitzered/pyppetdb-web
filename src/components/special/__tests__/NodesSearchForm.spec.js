import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import NodesSearchForm from '../NodesSearchForm.vue'

const mockRoute = reactive({
  query: {},
  params: {}
})

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
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
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
      }
    }
  }
)

const mockAuthStore = {
  hasPermission: vi.fn(() => true)
}

vi.mock(
  '@/stores/auth',
  () => {
    return {
      authStore: () => mockAuthStore
    }
  }
)

const customStubs = {
  ResponsiveToolbar: {
    template: '<div><slot name="left" /><slot name="right" /><slot /></div>'
  },
  Accordion: {
    template: '<div><slot /></div>'
  },
  AccordionPanel: {
    template: '<div><slot /></div>'
  },
  AccordionHeader: {
    template: '<div><slot /></div>'
  },
  AccordionContent: {
    template: '<div><slot /></div>'
  },
  InputText: 'input',
  Select: 'select',
  Button: 'button',
  DataTable: {
    template: '<div><slot name="top" /><slot /></div>'
  },
  Column: {
    template: `
      <div>
        <slot name="body" :data="{ id: 'node-1', disabled: true }"></slot>
        <slot name="body" :data="{ id: 'node-2', disabled: false }"></slot>
      </div>
    `
  },
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe(
  'NodesSearchForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        mockAuthStore.hasPermission.mockReturnValue(true)
        mockRoute.query = {}

        vi.mocked(api.get).mockResolvedValue({
          result: [
            { id: 'node-1', environment: 'production', disabled: false }
          ],
          meta: {
            status_unchanged: 10,
            status_changed: 2,
            status_failed: 1,
            status_unreported: 0,
            status_outdated: 5
          },
          total: 1
        })
      }
    )

    it(
      'mounts and performs search successfully',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalled()
        expect(
          wrapper.vm.tableItems[0].id
        ).toBe('node-1')
      }
    )

    it(
      'narrows fact suggestions by earlier rows and the disabled filter',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formSearchBy.disabled = 'false'
        wrapper.vm.formSearchBy.fact = [
          { fact_name: 'os.family', operator: 'eq', type: 'str', value: 'RedHat' },
          { fact_name: '', operator: '', type: '', value: '' }
        ]
        vi.mocked(api.get).mockResolvedValueOnce({ result: ['cpus', 'kernel'] })

        await wrapper.vm.searchFacts({ query: 'cp' }, 1)

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/nodes/_distinct_fact_names',
          { disabled: 'false', fact: ['os.family:eq:str:RedHat'] },
          true
        )
        expect(
          wrapper.vm.factSuggestions
        ).toEqual(['cpus'])
      }
    )

    it(
      'handles pagination and sorting',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.onPage({
          page: 1,
          rows: 25
        })
        await flushPromises()

        wrapper.vm.onSort({
          sortField: 'environment',
          sortOrder: 1
        })
        await flushPromises()

        wrapper.vm.onSort({
          sortField: undefined,
          sortOrder: null
        })
        await flushPromises()
      }
    )

    it(
      'triggers debounced search on input',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formSearchBy.node_id = 'node-a'
        wrapper.vm.debouncedSearch()
        vi.advanceTimersByTime(300)
        await flushPromises()
      }
    )

    it(
      'adds and removes fact filters',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formSearchByFactsAdd()
        await flushPromises()
        expect(
          wrapper.vm.formSearchBy.fact.length
        ).toBe(1)

        const btn = wrapper.find('.bg-rose-600')
        await btn.trigger('click')
        await flushPromises()

        expect(
          wrapper.vm.formSearchBy.fact.length
        ).toBe(0)
      }
    )

    it(
      'toggles status filter and tracks active status',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.isStatusActive('^changed$')
        ).toBe(false)

        wrapper.vm.toggleStatus('^changed$')
        expect(
          wrapper.vm.isStatusActive('^changed$')
        ).toBe(true)

        wrapper.vm.toggleStatus('^changed$')
        expect(
          wrapper.vm.isStatusActive('^changed$')
        ).toBe(false)
      }
    )

    it(
      'validates ISO timestamps correctly',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.validateISOTimestamp('')
        ).toBe(true)

        expect(
          wrapper.vm.validateISOTimestamp('2026-06-26T12:00:00Z')
        ).toBe(true)

        expect(
          wrapper.vm.validateISOTimestamp('invalid-date')
        ).toContain('Invalid ISO timestamp')

        expect(
          wrapper.vm.validateISOTimestamp('2026-99-99T99:99:99Z')
        ).toContain('Invalid date/time')
      }
    )

    it(
      'handles threshold input validation and trigger',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.handleThresholdInput({
          target: {
            value: ''
          }
        })
        expect(
          wrapper.vm.outdatedThresholdError
        ).toBe('')

        wrapper.vm.handleThresholdInput({
          target: {
            value: '2026-06-26T12:00:00Z'
          }
        })
        expect(
          wrapper.vm.outdatedThresholdError
        ).toBe('')

        wrapper.vm.handleThresholdInput({
          target: {
            value: 'invalid-date'
          }
        })
        expect(
          wrapper.vm.outdatedThresholdError
        ).toContain('Invalid ISO')
      }
    )

    it(
      'handles create action',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.handleCreate()
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesCRUD',
          params: { node: '_new' }
        })
      }
    )

    it(
      'toggles all status filters and handles facts boundary conditions',
      async () => {
        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        const buttons = wrapper.findAll('button')
        for (const btn of buttons) {
          await btn.trigger('click')
        }
        await flushPromises()

        expect(
          wrapper.vm.isStatusActive('^outdated$')
        ).toBe(true)

        wrapper.vm.tableExpPan = ['search', 'fact']
        wrapper.vm.formSearchBy.fact = undefined
        wrapper.vm.formSearchByFactsAdd()
        await flushPromises()
        expect(
          wrapper.vm.formSearchBy.fact.length
        ).toBe(1)
      }
    )

    it(
      'handles canCreate without permissions',
      async () => {
        mockAuthStore.hasPermission.mockReturnValue(false)

        const wrapper = mount(
          NodesSearchForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.canCreate
        ).toBe(false)
      }
    )
  }
)
