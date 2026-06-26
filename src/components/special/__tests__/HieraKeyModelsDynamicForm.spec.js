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
import MonacoEditor from '@/components/shared/MonacoEditor.vue'
import HieraKeyModelsDynamicForm from '../HieraKeyModelsDynamicForm.vue'

const mockRoute = reactive({
  params: {
    key_model_id: '_new'
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
        get: vi.fn(),
        post: vi.fn(),
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
  name = 'hiera/key_models/dynamic',
  apiBase = 'hiera/key_models/dynamic',
  permissions = {
    delete: () => {
      return true
    }
  }
} = {}) {
  return {
    name,
    routeParam: 'key_model_id',
    label: 'Key Model',
    labelPlural: 'Key Models',
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
        title: 'Key Models CRUD',
        items: []
      }
    },
    routeNames: {
      search: 'hiera-key-models-search'
    }
  }
}

const customStubs = {
  ...primeVueStubs,
  MonacoEditor: {
    template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'readonly']
  }
}

describe(
  'HieraKeyModelsDynamicForm',
  () => {
    let mockConfirm
    let mockToast
    let mockAuth

    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params = {
          key_model_id: '_new'
        }

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
      }
    )

    it(
      'mounts successfully as new dynamic model and clears fields',
      async () => {
        mockRoute.params = {}
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
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
          wrapper.vm.isNew
        ).toBe(true)
        expect(
          wrapper.vm.title
        ).toBe('New Dynamic Key Model')

        const inputs = wrapper.findAllComponents({
          name: 'InputText'
        })
        await inputs[0].vm.$emit(
          'update:model-value',
          'my-model'
        )
        await inputs[1].vm.$emit(
          'update:model-value',
          'Model description'
        )
        const editor = wrapper.findComponent(MonacoEditor)
        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object"}}}'
        )

        expect(
          wrapper.vm.formData.id
        ).toBe('my-model')
        expect(
          wrapper.vm.formData.description
        ).toBe('Model description')
        expect(
          wrapper.vm.jsonValueStr
        ).toBe('{"properties": {"data": {"type": "object"}}}')
      }
    )

    it(
      'loads data successfully for an existing dynamic model',
      async () => {
        mockRoute.params.key_model_id = 'my-model'
        const mockModel = {
          properties: {
            data: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                }
              }
            }
          }
        }
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'my-model',
          description: 'Model description',
          model: mockModel
        })
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()
        expect(
          api.get
        ).toHaveBeenCalledWith(
          'hiera/key_models/dynamic/my-model'
        )
        expect(
          wrapper.vm.formData.id
        ).toBe('my-model')
        expect(
          wrapper.vm.formData.description
        ).toBe('Model description')
        expect(
          JSON.parse(wrapper.vm.jsonValueStr)
        ).toEqual(mockModel)
      }
    )

    it(
      'handles fetch failure when loading existing key model data',
      async () => {
        mockRoute.params.key_model_id = 'my-model'
        vi.mocked(api.get).mockRejectedValueOnce(
          new Error('Fetch error')
        )
        mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
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
          detail: 'Failed to load key model data',
          life: 3000
        })
      }
    )

    it(
      'behaves correctly as static key model',
      async () => {
        mockRoute.params.key_model_id = 'static-model'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'static-model',
          description: 'Static description',
          model: {}
        })
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef({
                name: 'hiera/key_models/static'
              })
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()
        expect(
          wrapper.vm.isStatic
        ).toBe(true)
        expect(
          wrapper.vm.isNew
        ).toBe(false)
        expect(
          wrapper.vm.title
        ).toBe('Static Key Model static-model')
      }
    )

    it(
      'redirects when clicking back button or cancel button',
      async () => {
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const backBtn = wrapper.find('.pi-arrow-left').wrapperElement.parentElement
        await backBtn.click()
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'hiera-key-models-search'
        })

        const buttons = wrapper.findAllComponents({ name: 'Button' })
        const cancelBtn = buttons.find(b => b.props('label') === 'Cancel')
        await cancelBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'hiera-key-models-search'
        })
      }
    )

    it(
      'validates various JSON schemas correctly through watch on jsonValueStr',
      async () => {
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        const editor = wrapper.findComponent(MonacoEditor)

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object"}}}'
        )
        await flushPromises()

        await editor.vm.$emit(
          'update:model-value',
          ''
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBeNull()

        await editor.vm.$emit(
          'update:model-value',
          'invalid-json'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBe('Invalid JSON format')

        await editor.vm.$emit(
          'update:model-value',
          '123'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Schema must be an object')

        await editor.vm.$emit(
          'update:model-value',
          '[]'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Schema must be an object')

        await editor.vm.$emit(
          'update:model-value',
          '{}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Root schema must have "properties"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"other": {}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Root schema must have exactly one property called "data"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "array"}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Root "data" field cannot be of type "array"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": []}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('properties: Must be an object')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string"}}, "required": "name"}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('required: Must be an array')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["age"]}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Field "age" not found in properties')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string", "enum": "val"}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('enum: Must be an array')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string", "enum": ["val1", "val2"]}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBeNull()

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"age": {"type": "integer", "pattern": "^[0-9]+$"}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Pattern can only be used with type "string"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string", "pattern": "("}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('pattern: Invalid regex pattern')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "string", "pattern": "^[a-z]+$"}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBeNull()

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Missing "type" field')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"name": {"type": "invalid"}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Invalid type "invalid"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"info": {"type": "object", "properties": {"nested": {"type": "string"}}}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBeNull()

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"list": {"type": "array", "items": {"type": "string"}}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toBeNull()

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"list": {"type": "array", "items": {"type": "invalid"}}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('Invalid type "invalid"')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"list": {"type": "array", "uniqueItems": "yes"}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('uniqueItems: Must be a boolean')

        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object", "properties": {"list": {"type": "array", "items": [], "uniqueItems": true}}}}}'
        )
        await flushPromises()
        expect(
          wrapper.vm.validationError
        ).toContain('items: Field schema must be an object')
      }
    )

    it(
      'handles save validation errors before making post request',
      async () => {
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        wrapper.vm.formData.id = ''
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Model ID is required',
          life: 3000
        })

        wrapper.vm.formData.id = 'my-model'
        wrapper.vm.validationError = 'Invalid schema'
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Invalid schema',
          life: 5000
        })

        wrapper.vm.validationError = null
        wrapper.vm.jsonValueStr = 'invalid-json'
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Model schema must be valid JSON',
          life: 3000
        })
      }
    )

    it(
      'saves new dynamic model successfully',
      async () => {
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        vi.mocked(api.post).mockResolvedValueOnce({})
        const inputs = wrapper.findAllComponents({
          name: 'InputText'
        })
        await inputs[0].vm.$emit(
          'update:model-value',
          'my-model'
        )
        await inputs[1].vm.$emit(
          'update:model-value',
          'desc'
        )
        const editor = wrapper.findComponent(MonacoEditor)
        await editor.vm.$emit(
          'update:model-value',
          '{"properties": {"data": {"type": "object"}}}'
        )
        await flushPromises()
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()
        expect(
          api.post
        ).toHaveBeenCalledWith(
          'hiera/key_models/dynamic/my-model',
          {
            description: 'desc',
            model: {
              properties: {
                data: {
                  type: 'object'
                }
              }
            }
          }
        )
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Created',
          detail: 'Dynamic key model created successfully',
          life: 3000
        })
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'hiera-key-models-search'
        })
      }
    )

    it(
      'handles save mutation failures gracefully',
      async () => {
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        vi.mocked(api.post).mockRejectedValueOnce(
          new Error('Save error')
        )
        const inputs = wrapper.findAllComponents({
          name: 'InputText'
        })
        await inputs[0].vm.$emit(
          'update:model-value',
          'my-model'
        )
        await flushPromises()
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save dynamic key model data',
          life: 3000
        })
      }
    )

    it(
      'deletes dynamic key model successfully via confirm accept callback',
      async () => {
        mockRoute.params.key_model_id = 'my-model'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'my-model',
          description: 'desc',
          model: {}
        })
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()
        expect(
          wrapper.vm.canDelete
        ).toBe(true)

        vi.mocked(api.delete).mockResolvedValueOnce({})
        const deleteBtn = wrapper.find('.bg-rose-600')
        await deleteBtn.trigger('click')
        expect(
          mockConfirm.require
        ).toHaveBeenCalled()

        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        await acceptCallback()
        expect(
          api.delete
        ).toHaveBeenCalledWith(
          'hiera/key_models/dynamic/my-model'
        )
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Dynamic key model deleted successfully',
          life: 3000
        })
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'hiera-key-models-search'
        })
      }
    )

    it(
      'handles delete dynamic key model failures gracefully',
      async () => {
        mockRoute.params.key_model_id = 'my-model'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'my-model',
          description: 'desc',
          model: {}
        })
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()
        vi.mocked(api.delete).mockRejectedValueOnce(
          new Error('Delete error')
        )
        const deleteBtn = wrapper.find('.bg-rose-600')
        await deleteBtn.trigger('click')
        const acceptCallback = mockConfirm.require.mock.calls[0][0].accept
        await acceptCallback()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete dynamic key model',
          life: 3000
        })
      }
    )

    it(
      'returns false for canDelete if permissions.delete is false or not defined',
      () => {
        mockRoute.params.key_model_id = 'my-model'
        const wrapper = mount(
          HieraKeyModelsDynamicForm,
          {
            props: {
              resourceDef: getMockResourceDef({
                permissions: {}
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
  }
)
