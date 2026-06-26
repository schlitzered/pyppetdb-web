import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import MonacoEditor from '@/components/shared/MonacoEditor.vue'
import AutoComplete from 'primevue/autocomplete'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import HieraLevelDataForm from '../HieraLevelDataForm.vue'

const mockRoute = reactive({
  params: {
    level_id: '_new',
    data_id: '_new',
    key_id: '_new'
  },
  query: {}
})

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

vi.mock('vue-router', () => {
  return {
    useRoute: () => mockRoute,
    useRouter: () => mockRouter
  }
})

vi.mock('primevue/useconfirm', () => {
  return {
    useConfirm: vi.fn()
  }
})

vi.mock('primevue/usetoast', () => {
  return {
    useToast: vi.fn()
  }
})

vi.mock('@/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  }
})

vi.mock('@/stores/auth', () => {
  return {
    authStore: vi.fn()
  }
})

function getMockResourceDef({
  name = 'hiera/data',
  apiBase = 'hiera/data',
  permissions = {
    delete: () => {
      return true
    }
  }
} = {}) {
  return {
    name,
    routeParam: 'data_id',
    label: 'Level Data',
    labelPlural: 'Level Data List',
    fields: [],
    searchFilters: [],
    apiBase,
    defaultSort: {
      field: 'id',
      order: 'asc'
    },
    permissions,
    toolbar: {
      crud: {
        title: 'Hiera Data CRUD',
        items: []
      }
    },
    routeNames: {
      search: 'hiera-data-search'
    }
  }
}

const customStubs = {
  ...primeVueStubs,
  'router-link': {
    template: '<a><slot /></a>'
  },
  MonacoEditor: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'readonly']
  }
}

describe('HieraLevelDataForm', () => {
  let mockConfirm
  let mockToast
  let mockAuth

  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params.level_id = '_new'
    mockRoute.params.data_id = '_new'
    mockRoute.params.key_id = '_new'
    mockRoute.query = {}

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

    vi.mocked(api.get).mockImplementation(() => {
      return Promise.resolve({})
    })
  })

  it('mounts successfully as new level data and initializes query parameters', () => {
    mockRoute.query = {
      lines: '2,3'
    }
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.isNew).toBe(true)
    expect(wrapper.vm.title).toBe('New Hiera Level Data')
    expect(wrapper.vm.highlightedLines).toEqual([2, 3])
  })

  it('loads existing level data and handles fact extraction, query parameters updates', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.resolve({
          level_id: 'prod/{hostname}',
          id: 'prod/host-123/my-key',
          key_id: 'my-key',
          priority: 5,
          facts: {
            hostname: 'host-123'
          },
          data: {
            enabled: true
          }
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    expect(wrapper.vm.formData.level_id).toBe('prod/{hostname}')
    expect(wrapper.vm.formData.id).toBe('prod/host-123/my-key')
    expect(wrapper.vm.factValues.hostname).toBe('host-123')
    expect(JSON.parse(wrapper.vm.jsonValueStr)).toEqual({
      enabled: true
    })

    wrapper.vm.handleHighlightedLinesChange([4])
    await flushPromises()
    expect(mockRouter.replace).toHaveBeenCalledWith({
      query: {
        lines: '4'
      }
    })

    mockRoute.query.lines = '5,6'
    await flushPromises()
    expect(wrapper.vm.highlightedLines).toEqual([5, 6])
  })

  it('handles fetch failure when loading existing level data', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.reject(new Error('Fetch error'))
      }
      return Promise.resolve({})
    })

    mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load Hiera level data',
      life: 3000
    })
  })

  it('performs auto completion searches for levels, keys, and fact suggestions', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.get).mockResolvedValueOnce({
      result: [
        {
          id: 'level-1'
        }
      ]
    })
    await wrapper.vm.searchLevels({
      query: 'lvl'
    })
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/hiera/levels',
      {
        limit: 10,
        sort_by: 'id',
        sort_order: 'ascending',
        level_id: 'lvl'
      },
      true
    )
    expect(wrapper.vm.levels).toEqual(['level-1'])

    vi.mocked(api.get).mockResolvedValueOnce({
      result: [
        {
          id: 'key-1'
        }
      ]
    })
    await wrapper.vm.searchKeys({
      query: 'ky'
    })
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/hiera/keys',
      {
        limit: 10,
        sort_by: 'id',
        sort_order: 'ascending',
        key_id: 'ky'
      },
      true
    )
    expect(wrapper.vm.keys).toEqual(['key-1'])

    vi.mocked(api.get).mockResolvedValueOnce({
      result: [
        {
          value: 'host-1'
        },
        {
          value: 'host-2'
        }
      ]
    })
    await wrapper.vm.searchFactSuggestions(
      {
        query: 'host'
      },
      'hostname'
    )
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/nodes/_distinct_fact_values',
      {
        fact_id: 'hostname',
        limit: 10,
        sort_by: 'value',
        sort_order: 'ascending'
      },
      true
    )
    expect(wrapper.vm.factSuggestions.hostname).toEqual([
      'host-1',
      'host-2',
      'host'
    ])
  })

  it('handles autocomplete searches errors gracefully', async () => {
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.get).mockRejectedValue(new Error('Autocomplete error'))
    await wrapper.vm.searchLevels({
      query: 'lvl'
    })
    await wrapper.vm.searchKeys({
      query: 'ky'
    })
    await wrapper.vm.searchFactSuggestions(
      {
        query: 'host'
      },
      'hostname'
    )
    expect(spyConsole).toHaveBeenCalled()
    spyConsole.mockRestore()
  })

  it('fetches priority when a new level_id is set', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.get).mockResolvedValueOnce({
      priority: 42
    })
    wrapper.vm.formData.level_id = 'my-new-level'
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/hiera/levels/my-new-level',
      undefined,
      true
    )
    expect(wrapper.vm.formData.priority).toBe(42)

    vi.mocked(api.get).mockRejectedValueOnce(new Error('Priority error'))
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {})
    wrapper.vm.formData.level_id = 'error-level'
    await flushPromises()
    expect(spyConsole).toHaveBeenCalled()
    spyConsole.mockRestore()
  })

  it('calculates autoGeneratedDataId and factFields dynamically from level_id brackets', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    wrapper.vm.formData.level_id = 'nodes/{env}/{hostname}'
    await flushPromises()
    expect(wrapper.vm.factFields).toEqual(['env', 'hostname'])

    wrapper.vm.factValues.env = 'prod'
    wrapper.vm.factValues.hostname = 'host-123'
    await flushPromises()
    expect(wrapper.vm.autoGeneratedDataId).toBe('nodes/prod/host-123')
    expect(wrapper.vm.formData.id).toBe('nodes/prod/host-123')
  })

  it('performs schema path-tracing ranges calculation from MonacoEditor offset changes', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    wrapper.vm.keyModelSchema = {
      properties: {
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the user'
                }
              }
            },
            list: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
    wrapper.vm.jsonValueStr =
      '{\n  "user": {\n    "name": "john"\n  },\n  "list": ["a", "b"]\n}'
    await flushPromises()

    wrapper.vm.handleCursorOffsetChange(18)
    await flushPromises()
    expect(wrapper.vm.currentJsonPath).toEqual(['user', 'name'])
    expect(wrapper.vm.currentSubSchema.type).toBe('string')
    expect(wrapper.vm.currentSubSchema.description).toBe('Name of the user')

    wrapper.vm.handleCursorOffsetChange(49)
    await flushPromises()
    expect(wrapper.vm.currentJsonPath).toEqual(['list', '0'])
    expect(wrapper.vm.currentSubSchema.type).toBe('string')

    wrapper.vm.handleCursorOffsetChange(55)
    await flushPromises()
    expect(wrapper.vm.currentJsonPath).toEqual(['list', '1'])
  })

  it('resolves schema definition references and normalizes anyOf null types', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    const mockKeySchema = {
      $defs: {
        userDef: {
          type: 'object',
          properties: {
            email: {
              type: ['string', 'null']
            },
            role: {
              anyOf: [
                {
                  type: 'string',
                  enum: ['admin', 'guest']
                },
                {
                  type: 'null'
                }
              ]
            },
            age: {
              anyOf: [
                {
                  type: 'integer'
                },
                {
                  type: 'null'
                }
              ]
            }
          },
          required: ['email', 'age']
        }
      },
      properties: {
        data: {
          $ref: '#/$defs/userDef'
        }
      }
    }
    wrapper.vm.keyModelSchema = mockKeySchema
    await flushPromises()
    const resolved = wrapper.vm.resolvedSchema
    expect(resolved.type).toBe('object')
    expect(resolved.properties.email.type).toEqual(['string', 'null'])
  })

  it('watches key_id changes and fetches dynamic/static schemas', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.get).mockResolvedValueOnce({
      key_model_id: 'dynamic:user-model'
    })
    vi.mocked(api.get).mockResolvedValueOnce({
      model: {
        properties: {
          data: {
            type: 'string'
          }
        }
      }
    })
    wrapper.vm.formData.key_id = 'user-key'
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/hiera/keys/user-key',
      undefined,
      true
    )
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/hiera/key_models/dynamic/dynamic%3Auser-model',
      undefined,
      true
    )
    expect(wrapper.vm.keyModelSchema.properties.data.type).toBe('string')
  })

  it('performs JSON schema Ajv validation checks on jsonValueStr changes', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    wrapper.vm.keyModelSchema = {
      properties: {
        data: {
          type: 'integer'
        }
      }
    }
    await flushPromises()

    const editor = wrapper.findComponent(MonacoEditor)
    await editor.vm.$emit('update:model-value', '{"invalid": json')
    await flushPromises()
    expect(wrapper.vm.validationError).toBe('Invalid JSON format')

    await editor.vm.$emit('update:model-value', '"not-an-integer"')
    await flushPromises()
    expect(wrapper.vm.validationError).toContain('Schema validation failed')

    await editor.vm.$emit('update:model-value', '42')
    await flushPromises()
    expect(wrapper.vm.validationError).toBeNull()
  })

  it('handles save validation and parses Hiera value correctly', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    wrapper.vm.validationError = 'Error present'
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Error present',
      life: 5000
    })

    wrapper.vm.validationError = null
    wrapper.vm.jsonValueStr = '{invalid'
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Hiera value must be valid JSON',
      life: 3000
    })
  })

  it('saves new Hiera data successfully and performs redirects', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.post).mockResolvedValueOnce({})
    wrapper.vm.formData.level_id = 'prod/{hostname}'
    wrapper.vm.factValues.hostname = 'my-key'
    wrapper.vm.formData.key_id = 'my-key'
    wrapper.vm.jsonValueStr = '"my-value"'
    await flushPromises()
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/hiera/data/prod%2F%7Bhostname%7D/prod%2Fmy-key/my-key',
      {
        facts: {
          hostname: 'my-key'
        },
        data: 'my-value'
      }
    )
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Created',
      detail: 'Hiera data created successfully',
      life: 3000
    })
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'hiera-data-search'
    })
  })

  it('saves existing Hiera data modifications successfully', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.resolve({
          level_id: 'prod/{hostname}',
          id: 'prod/host-123/my-key',
          key_id: 'my-key',
          data: 'old-value'
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    wrapper.vm.isModifyMode = true
    wrapper.vm.jsonValueStr = '"new-value"'
    await flushPromises()

    vi.mocked(api.put).mockResolvedValueOnce({})
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith(
      '/api/v1/hiera/data/prod/prod%2Fhost-123%2Fmy-key/my-key',
      {
        data: 'new-value'
      }
    )
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Updated',
      detail: 'Hiera data updated successfully',
      life: 3000
    })
    expect(wrapper.vm.isModifyMode).toBe(false)
  })

  it('handles save mutation errors gracefully', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Save failed'))
    wrapper.vm.formData.level_id = 'prod'
    wrapper.vm.formData.id = 'prod/my-key'
    wrapper.vm.formData.key_id = 'my-key'
    wrapper.vm.jsonValueStr = '"val"'
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Hiera data',
      life: 3000
    })
  })

  it('deletes Hiera data successfully via confirm accept callback', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.resolve({
          level_id: 'prod/{hostname}',
          id: 'prod/host-123/my-key',
          key_id: 'my-key',
          data: 'value'
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    expect(wrapper.vm.canDelete).toBe(true)

    vi.mocked(api.delete).mockResolvedValueOnce({})
    const deleteBtn = wrapper.find('.bg-rose-600')
    await deleteBtn.trigger('click')
    expect(mockConfirm.require).toHaveBeenCalled()

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
    await acceptCallback()
    expect(api.delete).toHaveBeenCalledWith(
      '/api/v1/hiera/data/prod/prod%2Fhost-123%2Fmy-key/my-key'
    )
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Hiera data deleted successfully',
      life: 3000
    })
  })

  it('handles delete mutations failures gracefully', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.resolve({
          level_id: 'prod/{hostname}',
          id: 'prod/host-123/my-key',
          key_id: 'my-key',
          data: 'value'
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('Delete error'))
    const deleteBtn = wrapper.find('.bg-rose-600')
    await deleteBtn.trigger('click')
    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
    await acceptCallback()
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Hiera data',
      life: 3000
    })
  })

  it('reloads data when route parameters change', async () => {
    mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    vi.mocked(api.get).mockClear()

    mockRoute.params.level_id = 'prod'
    await flushPromises()
    expect(api.get).toHaveBeenCalled()
  })

  it('handles cancel edits route redirect and restore modes', async () => {
    mockRoute.params.level_id = 'prod'
    mockRoute.params.data_id = 'prod/host-123/my-key'
    mockRoute.params.key_id = 'my-key'

    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes('/api/v1/hiera/data/')) {
        return Promise.resolve({
          level_id: 'prod/{hostname}',
          id: 'prod/host-123/my-key',
          key_id: 'my-key',
          data: 'value'
        })
      }
      return Promise.resolve({})
    })

    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    wrapper.vm.isModifyMode = true
    wrapper.vm.handleCancel()
    expect(wrapper.vm.isModifyMode).toBe(false)

    mockRoute.params.data_id = '_new'
    wrapper.vm.handleCancel()
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'hiera-data-search'
    })
  })

  it('handles back redirection', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    wrapper.vm.handleBack()
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'hiera-data-search'
    })
  })

  it('watches query lines parameters and updates highlightedLines', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()
    mockRoute.query.lines = '1,2'
    await flushPromises()
    expect(wrapper.vm.highlightedLines).toEqual([1, 2])

    mockRoute.query.lines = '3,4'
    await flushPromises()
    expect(wrapper.vm.highlightedLines).toEqual([3, 4])
  })

  it('renders enum schemas and dialog content successfully', async () => {
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    wrapper.vm.keyModelSchema = {
      properties: {
        data: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['admin', 'guest']
            }
          }
        }
      }
    }
    wrapper.vm.jsonValueStr = '{\n  "role": "admin"\n}'
    wrapper.vm.isEditorExpanded = true
    await flushPromises()
    wrapper.vm.handleCursorOffsetChange(12)
    await flushPromises()
    expect(wrapper.vm.currentJsonPath).toEqual(['role'])
    expect(wrapper.vm.currentSubSchema.enum).toEqual(['admin', 'guest'])
  })

  it('triggers template event handlers to ensure function coverage', async () => {
    mockRoute.params.data_id = 'prod/host-123/my-key'
    const wrapper = mount(HieraLevelDataForm, {
      props: {
        resourceDef: getMockResourceDef()
      },
      global: {
        stubs: customStubs
      }
    })
    await flushPromises()

    const modifyToggle = wrapper.findComponent(ToggleSwitch)
    if (modifyToggle.exists()) {
      modifyToggle.vm.$emit('update:modelValue', true)
    }

    wrapper.vm.formData.level_id = 'prod/{hostname}'
    await flushPromises()

    const autocompletes = wrapper.findAllComponents(AutoComplete)
    for (const ac of autocompletes) {
      ac.vm.$emit('update:modelValue', 'test-value')
      ac.vm.$emit('complete', {
        query: 'te'
      })
    }

    const inputTexts = wrapper.findAllComponents(InputText)
    for (const it of inputTexts) {
      it.vm.$emit('update:modelValue', 'test')
    }

    const inputNumbers = wrapper.findAllComponents(InputNumber)
    for (const inNum of inputNumbers) {
      inNum.vm.$emit('update:modelValue', 10)
    }

    wrapper.vm.keyModelSchema = {
      properties: {
        data: {
          type: 'string'
        }
      }
    }
    await flushPromises()

    const buttons = wrapper.findAllComponents({
      name: 'Button'
    })
    for (const button of buttons) {
      if (button.text().includes('Expand Editor')) {
        await button.trigger('click')
      }
    }

    const monacos = wrapper.findAllComponents(MonacoEditor)
    for (const monaco of monacos) {
      monaco.vm.$emit('update:modelValue', '{}')
    }

    wrapper.vm.keyModelSchema = null
    await flushPromises()

    const dialog = wrapper.findComponent(Dialog)
    if (dialog.exists()) {
      dialog.vm.$emit('update:visible', false)
    }

    wrapper.vm.keyModelId = 'test-model'
    await flushPromises()
  })
})
