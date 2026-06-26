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
import NodesGroupsForm from '../NodesGroupsForm.vue'

const mockRoute = reactive({
  params: {
    node_group: '_new'
  }
})

const mockRouter = {
  push: vi.fn()
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

const mockToast = {
  add: vi.fn()
}

const mockConfirm = {
  require: vi.fn()
}

vi.mock(
  'primevue/usetoast',
  () => {
    return {
      useToast: () => mockToast
    }
  }
)

vi.mock(
  'primevue/useconfirm',
  () => {
    return {
      useConfirm: () => mockConfirm
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

vi.mock(
  '@/stores/auth',
  () => {
    return {
      authStore: () => {
        return {
          hasPermission: () => {
            return true
          }
        }
      }
    }
  }
)

const customStubs = {
  ResponsiveToolbar: {
    template: '<div><slot name="left" /><slot name="right" /><slot /></div>'
  },
  Card: 'div',
  Button: 'button',
  InputText: 'input',
  ToggleSwitch: 'div',
  AutoComplete: {
    template: '<div><slot name="content" /><slot /></div>'
  },
  MultiSelect: {
    template: '<div><slot name="content" /><slot /></div>'
  },
  Accordion: 'div',
  AccordionPanel: 'div',
  AccordionHeader: 'div',
  AccordionContent: 'div',
  DataTable: {
    template: '<div><slot name="top" /><slot /></div>'
  },
  Column: {
    template: '<div><slot name="body" :data="{ name: \'mock-node\' }"></slot></div>'
  },
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe(
  'NodesGroupsForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.node_group = '_new'

        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/teams') {
              return Promise.resolve({
                result: [
                  { id: 'team1' },
                  { id: 'team2' }
                ]
              })
            }
            if (url === '/api/v1/nodes') {
              return Promise.resolve({
                result: [
                  { id: 'node1' }
                ]
              })
            }
            if (url === '/api/v1/nodes/node1') {
              return Promise.resolve({
                facts: {
                  env: 'prod',
                  nested: {
                    value: '1'
                  }
                },
                facts_inject: {
                  custom: 'foo'
                }
              })
            }
            return Promise.resolve({ result: [] })
          }
        )
      }
    )

    it(
      'mounts in new mode and loads teams and facts',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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
        ).toHaveBeenCalledWith('/api/v1/teams')
        expect(
          wrapper.vm.teamsChoices
        ).toEqual(['team1', 'team2'])
        expect(
          wrapper.vm.availableFacts
        ).toContain('env')
        expect(
          wrapper.vm.availableFacts
        ).toContain('nested.value')
        expect(
          wrapper.vm.availableFacts
        ).toContain('custom')
      }
    )

    it(
      'mounts in edit mode and loads group data',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/teams') {
              return Promise.resolve({ result: [] })
            }
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.resolve({
                id: 'group-1',
                teams: ['team1'],
                filters: [
                  {
                    part: [
                      { fact: 'env', values: ['prod'] }
                    ]
                  }
                ],
                nodes: ['node1', 'node2']
              })
            }
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: [
                  { value: 'prod' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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
          wrapper.vm.formData.id
        ).toBe('group-1')
        expect(
          wrapper.vm.nodesTableData
        ).toEqual([
          { name: 'node1' },
          { name: 'node2' }
        ])
      }
    )

    it(
      'handles load group data error',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.reject(new Error('Load error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        mount(
          NodesGroupsForm,
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
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load node group data',
          life: 3000
        })
      }
    )

    it(
      'handles fetchFactValuesIfNeeded for non-string values',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: [
                  { value: 123 }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.fetchFactValuesIfNeeded('')
        await wrapper.vm.fetchFactValuesIfNeeded('test-fact')
        expect(
          wrapper.vm.factErrors['test-fact']
        ).toContain('cannot be used')
      }
    )

    it(
      'handles fetchFactValuesIfNeeded with empty/invalid results',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: null
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.fetchFactValuesIfNeeded('empty-fact')
        expect(
          wrapper.vm.factTypesCache['empty-fact'].values
        ).toEqual([])
      }
    )

    it(
      'filters nodes using nodesSearch',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.resolve({
                id: 'group-1',
                nodes: ['alpha', 'beta']
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.nodesSearch = 'alp'
        expect(
          wrapper.vm.filteredNodes
        ).toEqual([{ name: 'alpha' }])
      }
    )

    it(
      'manipulates rules and parts',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.addRuleGroup()
        expect(
          wrapper.vm.formData.filters.length
        ).toBe(1)

        wrapper.vm.addPart(0)
        expect(
          wrapper.vm.formData.filters[0].part.length
        ).toBe(1)

        wrapper.vm.formData.filters[0].part[0].fact = 'env'
        await wrapper.vm.onFactChange(
          0,
          0
        )
        expect(
          wrapper.vm.formData.filters[0].part[0].values
        ).toEqual([])

        wrapper.vm.removePart(
          0,
          0
        )
        expect(
          wrapper.vm.formData.filters[0].part.length
        ).toBe(0)

        wrapper.vm.removeRuleGroup(0)
        expect(
          wrapper.vm.formData.filters.length
        ).toBe(0)
      }
    )

    it(
      'searches teams and facts',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.searchTeams({
          query: 'search-team'
        })
        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/teams',
          {
            team_id: 'search-team'
          }
        )

        wrapper.vm.availableFacts = ['env', 'os']
        wrapper.vm.searchFacts(
          { query: 'e' },
          0,
          0
        )
        expect(
          wrapper.vm.filteredFactSuggestions['0-0']
        ).toEqual(['env'])
      }
    )

    it(
      'performs submit validation',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.addRuleGroup()
        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Each rule group must contain at least one condition.',
          life: 3000
        })

        wrapper.vm.addPart(0)
        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Fact name cannot be empty.',
          life: 3000
        })

        wrapper.vm.formData.filters[0].part[0].fact = 'env'
        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Fact "env" must have at least one value specified.',
          life: 3000
        })

        wrapper.vm.formData.filters[0].part[0].values = ['prod']
        wrapper.vm.factTypesCache['env'] = {
          hasNonString: true,
          values: []
        }
        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fix the errors in the filters before saving.',
          life: 3000
        })
      }
    )

    it(
      'submits new node group successfully',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.formData.id = 'new-group'
        wrapper.vm.addRuleGroup()
        wrapper.vm.addPart(0)
        wrapper.vm.formData.filters[0].part[0].fact = 'env'
        wrapper.vm.formData.filters[0].part[0].values = ['prod']
        delete wrapper.vm.factErrors['env']

        vi.mocked(api.post).mockResolvedValueOnce({})

        await wrapper.vm.formSubmit()
        expect(
          api.post
        ).toHaveBeenCalledWith(
          '/api/v1/nodes_groups/new-group',
          {
            filters: [
              {
                part: [
                  { fact: 'env', values: ['prod'] }
                ]
              }
            ],
            teams: []
          }
        )
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesGroupsSearch'
        })
      }
    )

    it(
      'submits existing node group with put successfully',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.resolve({
                id: 'group-1',
                filters: [
                  {
                    part: [
                      { fact: 'env', values: ['prod'] }
                    ]
                  }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.isModifyMode = true
        vi.mocked(api.put).mockResolvedValueOnce({})

        await wrapper.vm.formSubmit()
        expect(
          api.put
        ).toHaveBeenCalledWith(
          '/api/v1/nodes_groups/group-1',
          {
            filters: [
              {
                part: [
                  { fact: 'env', values: ['prod'] }
                ]
              }
            ],
            teams: []
          }
        )
      }
    )

    it(
      'handles submit errors gracefully',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.formData.id = 'new-group'
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Post error'))

        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save node group',
          life: 3000
        })
      }
    )

    it(
      'handles delete and reset actions',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.resolve({
                id: 'group-1'
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.formReset()
        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/nodes_groups/group-1')

        wrapper.vm.formDelete()
        expect(
          mockConfirm.require
        ).toHaveBeenCalled()

        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        vi.mocked(api.delete).mockResolvedValueOnce({})

        await acceptCallback()
        expect(
          api.delete
        ).toHaveBeenCalledWith('/api/v1/nodes_groups/group-1')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesGroupsSearch'
        })
      }
    )

    it(
      'handles delete failure',
      async () => {
        mockRoute.params.node_group = 'group-1'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes_groups/group-1') {
              return Promise.resolve({
                id: 'group-1'
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.formDelete()
        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        vi.mocked(api.delete).mockRejectedValueOnce(new Error('Delete error'))

        await acceptCallback()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete node group',
          life: 3000
        })
      }
    )

    it(
      'handles back navigation',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.handleBack()
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesGroupsSearch'
        })
      }
    )

    it(
      'handles loadExampleFacts and getTeams errors gracefully',
      async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('API error'))
        const spyError = vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})

        mount(
          NodesGroupsForm,
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
          spyError
        ).toHaveBeenCalled()
      }
    )

    it(
      'adds rule part when rule group filter part is undefined',
      async () => {
        const wrapper = mount(
          NodesGroupsForm,
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

        wrapper.vm.formData.filters = [{}]
        wrapper.vm.addPart(0)
        expect(
          wrapper.vm.formData.filters[0].part.length
        ).toBe(1)
      }
    )

    it(
      'handles searchTeams error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url, params) => {
            if (url === '/api/v1/teams' && params && params.team_id === 'error') {
              return Promise.reject(new Error('Teams search error'))
            }
            return Promise.resolve({ result: [] })
          }
        )
        const spyError = vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})

        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.searchTeams({
          query: 'error'
        })
        expect(
          spyError
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles fetchFactValuesIfNeeded api error',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.reject(new Error('Distinct values error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          NodesGroupsForm,
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

        await wrapper.vm.fetchFactValuesIfNeeded('error-fact')
        expect(
          wrapper.vm.factTypesCache['error-fact'].values
        ).toEqual([])
      }
    )
  }
)
