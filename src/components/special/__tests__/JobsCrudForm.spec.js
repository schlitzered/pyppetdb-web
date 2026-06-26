import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import JobsCrudForm from '../JobsCrudForm.vue'

const mockRoute = reactive({
  params: {
    job_id: '_new'
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

vi.mock(
  'primevue/usetoast',
  () => {
    return {
      useToast: () => mockToast
    }
  }
)

const mockConfirm = {
  require: vi.fn((options) => {
    options.accept()
  })
}

vi.mock(
  'primevue/useconfirm',
  () => {
    return {
      useConfirm: () => mockConfirm
    }
  }
)

const mockAuthStore = {
  hasPermission: vi.fn(() => true),
  getPermissionMatches: vi.fn(() => [])
}

vi.mock(
  '@/stores/auth',
  () => {
    return {
      authStore: () => mockAuthStore
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

const standardStubs = {
  Card: true,
  Select: true,
  InputText: true,
  ToggleSwitch: true,
  Button: true,
  DataTable: true,
  Column: true,
  Tag: true,
  ProgressSpinner: true,
  ResponsiveToolbar: true
}

const slotStubs = {
  Card: {
    template: '<div><slot name="title"></slot><slot name="content"></slot><slot></slot></div>'
  },
  Select: {
    template: '<div><slot></slot></div>'
  },
  InputText: {
    template: '<div><slot></slot></div>'
  },
  ToggleSwitch: {
    template: '<div><slot></slot></div>'
  },
  Button: true,
  DataTable: {
    template: '<div><slot></slot></div>'
  },
  Column: {
    template: '<span><slot name="body" :data="{ id: \'node-1\', remote_agent: { connected: true }, state: \'original_only\', node_job_id: \'nj-1\', status: \'success\' }"></slot></span>'
  },
  Tag: {
    template: '<span><slot></slot></span>'
  },
  RouterLink: true,
  ProgressSpinner: true,
  ResponsiveToolbar: true
}

describe(
  'JobsCrudForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})

        mockRoute.params.job_id = '_new'

        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/definitions') {
              return Promise.resolve({
                result: [
                  { id: 'def-1' },
                  { id: 'def-2' }
                ]
              })
            }
            if (url === '/api/v1/nodes') {
              return Promise.resolve({
                result: [
                  { id: 'node-1', remote_agent: { connected: true } }
                ]
              })
            }
            if (url.startsWith('/api/v1/jobs/definitions/')) {
              return Promise.resolve({
                params: {
                  param1: { type: 'str' },
                  param2: { type: 'bool' },
                  param3: { type: 'int' }
                },
                environment_variables: {
                  env1: { type: 'float' },
                  env2: { type: 'bool' }
                }
              })
            }
            return Promise.resolve({ result: [] })
          }
        )
      }
    )

    afterEach(
      () => {
        vi.useRealTimers()
      }
    )

    it(
      'mounts in creation mode and fetches definitions with global permission',
      async () => {
        mockAuthStore.hasPermission.mockReturnValue(true)

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/jobs/definitions',
          {
            limit: 1000
          }
        )
        expect(
          wrapper.vm.definitionChoices
        ).toEqual(['def-1', 'def-2'])
      }
    )

    it(
      'mounts in creation mode and fetches definitions with specific permission',
      async () => {
        mockAuthStore.hasPermission.mockReturnValue(false)
        mockAuthStore.getPermissionMatches.mockReturnValue(['def-spec'])

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.definitionChoices
        ).toEqual(['def-spec'])
      }
    )

    it(
      'handles fetch definitions error gracefully',
      async () => {
        mockAuthStore.hasPermission.mockReturnValue(true)
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/definitions') {
              return Promise.reject(new Error('Fetch error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles definition change and populates fields',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formData.definition_id = 'def-1'
        await wrapper.vm.handleDefinitionChange()

        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/jobs/definitions/def-1')
        expect(
          wrapper.vm.formData.parameters
        ).toEqual({
          param1: '',
          param2: false,
          param3: 0
        })
        expect(
          wrapper.vm.formData.env_vars
        ).toEqual({
          env1: 0,
          env2: false
        })
      }
    )

    it(
      'handles definition change error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url.startsWith('/api/v1/jobs/definitions/')) {
              return Promise.reject(new Error('Def details error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formData.definition_id = 'def-1'
        await wrapper.vm.handleDefinitionChange()

        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'manipulates node filter blocks and parts',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.nodeFilterBlocks.length
        ).toBe(1)

        wrapper.vm.addFilterBlock()
        expect(
          wrapper.vm.nodeFilterBlocks.length
        ).toBe(2)

        wrapper.vm.addPart(1)
        expect(
          wrapper.vm.nodeFilterBlocks[1].length
        ).toBe(2)

        wrapper.vm.removePart(
          1,
          0
        )
        expect(
          wrapper.vm.nodeFilterBlocks[1].length
        ).toBe(1)

        wrapper.vm.removeFilterBlock(1)
        expect(
          wrapper.vm.nodeFilterBlocks.length
        ).toBe(1)
      }
    )

    it(
      'updates matching nodes via handleFilterUpdate with debounce',
      async () => {
        vi.useFakeTimers()
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.nodeFilterBlocks[0][0] = {
          fact: 'osfamily',
          operator: 'eq',
          type: 'str',
          value: 'RedHat'
        }

        wrapper.vm.handleFilterUpdate()

        expect(
          api.get
        ).not.toHaveBeenCalledWith(
          '/api/v1/nodes',
          expect.anything()
        )

        vi.advanceTimersByTime(500)
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/nodes',
          {
            fact: ['osfamily:eq:str:RedHat'],
            limit: 1000
          }
        )
        expect(
          wrapper.vm.currentlyMatchingNodes.length
        ).toBe(1)
      }
    )

    it(
      'returns empty matching nodes if filter list is empty',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.currentlyMatchingNodes = [{ id: 'old-node' }]
        wrapper.vm.nodeFilterBlocks = [[]]

        await wrapper.vm.updateMatchingNodes()

        expect(
          wrapper.vm.currentlyMatchingNodes
        ).toEqual([])
      }
    )

    it(
      'handles updateMatchingNodes error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes') {
              return Promise.reject(new Error('Nodes error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.nodeFilterBlocks[0][0] = {
          fact: 'os',
          operator: 'eq',
          type: 'str',
          value: 'Linux'
        }

        await wrapper.vm.updateMatchingNodes()

        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'computes combinedNodes correctly',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formData.nodes = ['node-1', 'node-2']
        wrapper.vm.currentlyMatchingNodes = [
          { id: 'node-1' },
          { id: 'node-3' }
        ]
        wrapper.vm.nodeJobStatuses = {
          'node-1': { id: 'nj-1', status: 'success' },
          'node-2': { id: 'nj-2', status: 'failed' }
        }

        const nodes = wrapper.vm.combinedNodes
        expect(
          nodes
        ).toEqual([
          {
            id: 'node-1',
            state: 'both',
            node_job_id: 'nj-1',
            status: 'success'
          },
          {
            id: 'node-3',
            state: 'current_only',
            node_job_id: undefined,
            status: undefined
          },
          {
            id: 'node-2',
            remote_agent: { connected: false },
            state: 'original_only',
            node_job_id: 'nj-2',
            status: 'failed'
          }
        ])
      }
    )

    it(
      'creates job successfully and redirects',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({
          id: 'new-job-123'
        })

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.formData.definition_id = 'def-1'
        wrapper.vm.currentlyMatchingNodes = [{ id: 'node-1' }]
        wrapper.vm.formData.parameters = { param1: 'val', param2: '123' }
        wrapper.vm.jobParams = { param1: { type: 'str' }, param2: { type: 'int' } }

        await wrapper.vm.handleSave()

        expect(
          api.post
        ).toHaveBeenCalledWith(
          '/api/v1/jobs/jobs',
          {
            definition_id: 'def-1',
            parameters: { param1: 'val', param2: 123 },
            env_vars: {},
            node_filter: []
          }
        )
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Created',
          detail: 'Job created successfully',
          life: 3000
        })
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'JobsCRUD',
          params: { job_id: 'new-job-123' }
        })
      }
    )

    it(
      'handles create job failure gracefully',
      async () => {
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Save failed'))

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.handleSave()

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create job',
          life: 3000
        })
      }
    )

    it(
      'mounts in view mode and loads existing job data',
      async () => {
        mockRoute.params.job_id = 'existing-job-id'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/definitions') {
              return Promise.resolve({ result: [] })
            }
            if (url === `/api/v1/jobs/jobs/existing-job-id`) {
              return Promise.resolve({
                id: 'existing-job-id',
                definition_id: 'def-1',
                node_filter: ['os:eq:str:Linux'],
                status: 'running'
              })
            }
            if (url === '/api/v1/jobs/definitions/def-1') {
              return Promise.resolve({
                params: {},
                environment_variables: {}
              })
            }
            if (url === '/api/v1/nodes') {
              return Promise.resolve({
                result: [{ id: 'node-1' }]
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs') {
              return Promise.resolve({
                result: [{ node_id: 'node-1', id: 'nj-1', status: 'running' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.formDataReadOnly
        ).toBe(true)
        expect(
          wrapper.vm.formData.id
        ).toBe('existing-job-id')
        expect(
          wrapper.vm.nodeJobStatuses
        ).toEqual({
          'node-1': { id: 'nj-1', status: 'running' }
        })
      }
    )

    it(
      'handles loading existing job data failure',
      async () => {
        mockRoute.params.job_id = 'existing-job-id'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === `/api/v1/jobs/jobs/existing-job-id`) {
              return Promise.reject(new Error('Load error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'cancels running job successfully',
      async () => {
        mockRoute.params.job_id = 'existing-job-id'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === `/api/v1/jobs/jobs/existing-job-id`) {
              return Promise.resolve({
                id: 'existing-job-id',
                definition_id: 'def-1',
                node_filter: [],
                status: 'running'
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.handleCancelJob()
        await flushPromises()

        expect(
          api.post
        ).toHaveBeenCalledWith('/api/v1/jobs/jobs/existing-job-id/cancel')
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Cancelled',
          detail: 'Job cancelled successfully',
          life: 3000
        })
      }
    )

    it(
      'handles cancel running job failure',
      async () => {
        mockRoute.params.job_id = 'existing-job-id'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === `/api/v1/jobs/jobs/existing-job-id`) {
              return Promise.resolve({
                id: 'existing-job-id',
                definition_id: 'def-1',
                node_filter: [],
                status: 'running'
              })
            }
            return Promise.resolve({ result: [] })
          }
        )
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Cancel failed'))

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.handleCancelJob()
        await flushPromises()

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to cancel job',
          life: 3000
        })
      }
    )

    it(
      'redirects on handleCancel',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.handleCancel()
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'JobsSearch'
        })
      }
    )

    it(
      'watches route params job_id changes',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        vi.mocked(api.get).mockClear()

        mockRoute.params.job_id = 'changed-job-id'
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/jobs/jobs/changed-job-id')
      }
    )

    it(
      'returns severity correctly for getStatusSeverity',
      async () => {
        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.getStatusSeverity('success')
        ).toBe('success')
        expect(
          wrapper.vm.getStatusSeverity('failed')
        ).toBe('danger')
        expect(
          wrapper.vm.getStatusSeverity('running')
        ).toBe('info')
        expect(
          wrapper.vm.getStatusSeverity('unknown')
        ).toBe('secondary')
      }
    )

    it(
      'handles edge cases for canSubmit, handleFilterUpdate, and fetchNodeJobStatuses error',
      async () => {
        mockRoute.params.job_id = '_new'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs') {
              return Promise.reject(new Error('Nodes jobs error'))
            }
            if (url === '/api/v1/nodes') {
              return Promise.resolve({
                result: [{ id: 'node-1', remote_agent: { connected: true } }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: standardStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.canSubmit
        ).toBeFalsy()

        wrapper.vm.formDataReadOnly = true
        wrapper.vm.handleFilterUpdate()

        mockAuthStore.hasPermission.mockReturnValue(false)
        wrapper.vm.formDataReadOnly = false
        wrapper.vm.formData.definition_id = 'def-1'
        wrapper.vm.nodeFilterBlocks = [
          [
            {
              fact: 'os',
              operator: 'eq',
              type: 'str',
              value: 'Linux'
            }
          ]
        ]
        await wrapper.vm.updateMatchingNodes()

        expect(
          wrapper.vm.canSubmit
        ).toBe(false)

        mockAuthStore.hasPermission.mockReturnValue(true)
        wrapper.vm.formData.definition_id = 'def-2'
        expect(
          wrapper.vm.canSubmit
        ).toBe(true)

        mockAuthStore.hasPermission.mockImplementation(
          (perm) => {
            if (perm === 'JOBS:JOB::CREATE') {
              return false
            }
            return true
          }
        )
        wrapper.vm.formData.definition_id = 'def-3'
        expect(
          wrapper.vm.canSubmit
        ).toBe(true)

        await wrapper.vm.fetchNodeJobStatuses('job-123')
        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'renders slots statically for full coverage without updates',
      async () => {
        mockRoute.params.job_id = 'existing-job-id'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/definitions') {
              return Promise.resolve({ result: [] })
            }
            if (url === `/api/v1/jobs/jobs/existing-job-id`) {
              return Promise.resolve({
                id: 'existing-job-id',
                definition_id: 'def-1',
                node_filter: ['os:eq:str:Linux'],
                nodes: ['node-1'],
                status: 'running'
              })
            }
            if (url === '/api/v1/jobs/definitions/def-1') {
              return Promise.resolve({
                params: {
                  param1: { type: 'bool' }
                },
                environment_variables: {
                  env1: { type: 'bool' }
                }
              })
            }
            if (url === '/api/v1/nodes') {
              return Promise.resolve({
                result: [{ id: 'node-1', remote_agent: { connected: true } }]
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs') {
              return Promise.resolve({
                result: [{ node_id: 'node-1', id: 'nj-1', status: 'running' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: slotStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.exists()
        ).toBe(true)
      }
    )
  }
)
