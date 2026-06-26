import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useResourceQuery } from '@/composables/useResourceQuery'
import { useCreateResource } from '@/composables/useResourceMutation'
import { useUpdateResource } from '@/composables/useResourceMutation'
import { useDeleteResource } from '@/composables/useResourceMutation'
import api from '@/api/client'
import { primeVueStubs } from '@/__test_utils__/helpers'
import ResourceForm from '../ResourceForm.vue'

const mockRoute = reactive({
  params: {
    id: '_new'
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
  '@/composables/useResourceQuery',
  () => {
    return {
      useResourceQuery: vi.fn(() => {
        return {
          fetch: vi.fn()
        }
      })
    }
  }
)

vi.mock(
  '@/composables/useResourceMutation',
  () => {
    return {
      useCreateResource: vi.fn(() => {
        return {
          create: vi.fn()
        }
      }),
      useUpdateResource: vi.fn(() => {
        return {
          update: vi.fn()
        }
      }),
      useDeleteResource: vi.fn(() => {
        return {
          remove: vi.fn()
        }
      })
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
  'primevue/useconfirm',
  () => {
    return {
      useConfirm: vi.fn(() => {
        return {
          require: vi.fn()
        }
      })
    }
  }
)

vi.mock(
  'primevue/usetoast',
  () => {
    return {
      useToast: vi.fn(() => {
        return {
          add: vi.fn()
        }
      })
    }
  }
)

vi.mock(
  '@/stores/auth',
  () => {
    return {
      authStore: () => {
        return {
          getUserDataIsAdmin: true,
          isLoaded: false,
          hasPermission: () => {
            return true
          },
          hasPermissionPattern: () => {
            return true
          },
          getPermissionMatches: () => {
            return []
          },
          resetTimestamp: vi.fn(),
          resetUserData: vi.fn(),
          resetIsLoaded: vi.fn(),
          reset: vi.fn(),
          fetchUserData: vi.fn(),
          setUserData: vi.fn()
        }
      }
    }
  }
)

vi.mock(
  '@/stores/apiError',
  () => {
    return {
      apiErrorStore: () => {
        return {
          setRedirect: vi.fn()
        }
      }
    }
  }
)

const minimalFields = [
  { key: 'id', label: 'ID', type: 'readonly', readonly: true },
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'active', label: 'Active', type: 'switch', defaultValue: true }
]

function getMockResource({ name = 'resources', fields = minimalFields } = {}) {
  return {
    routeParam: 'id',
    label: 'Resource',
    labelPlural: 'Resources',
    name,
    fields,
    searchFilters: [],
    apiBase: 'resources',
    defaultSort: {
      field: 'id',
      order: 'asc'
    },
    permissions: {
      create: () => true,
      delete: () => true
    },
    toolbar: {
      crud: {
        title: 'Resource CRUD',
        items: []
      }
    },
    routeNames: {
      search: 'resources-search'
    }
  }
}

const mockWriteText = vi.fn()

describe(
  'ResourceForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.id = '_new'
        vi.mocked(api.get).mockResolvedValue({
          result: ['admin', 'user', 'guest', 'read', 'write']
        })
        Object.defineProperty(
          navigator,
          'clipboard',
          {
            value: {
              writeText: mockWriteText
            },
            configurable: true
          }
        )
      }
    )

    it(
      'mounts and sets initial data for new resource',
      () => {
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        expect(
          wrapper.exists()
        ).toBe(true)
        expect(
          wrapper.vm.formData.active
        ).toBe(true)
        expect(
          wrapper.vm.formData.name
        ).toBe('')
      }
    )

    it(
      'loads data for existing resource',
      async () => {
        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'Existing Resource',
          active: false
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          mockFetch
        ).toHaveBeenCalledWith(
          '123',
          mockRoute
        )
        expect(
          wrapper.vm.formData.name
        ).toBe('Existing Resource')
        expect(
          wrapper.vm.formData.active
        ).toBe(false)
      }
    )

    it(
      'loads existing data and maps permissions successfully',
      async () => {
        mockRoute.params.id = '123'
        const permissionFields = [
          ...minimalFields,
          { key: 'permissions', label: 'Permissions', type: 'permission-grid', autocomplete: { endpoint: 'permissions' } }
        ]
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'Existing Resource',
          active: false,
          permissions: ['read', 'invalid_perm']
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })
        vi.mocked(api.get).mockResolvedValue({
          result: ['read', 'write']
        })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: permissionFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          wrapper.vm.formData.permissions
        ).toEqual(['read'])
      }
    )

    it(
      'handles fetch failure when loading existing data',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)
        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockRejectedValue(new Error('Load Error'))
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load resource data',
          life: 3000
        })
      }
    )

    it(
      'copies values to clipboard and logs on error',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        wrapper.vm.showSecretDialog = true
        wrapper.vm.createdSecret = 'mysecret'
        wrapper.vm.createdSecretId = 'myid'
        await wrapper.vm.$nextTick()

        const copyButtons = wrapper.findAllComponents({ name: 'Button' }).filter(b => b.props('icon') === 'pi pi-copy')
        await copyButtons[0].trigger('click')
        await copyButtons[1].trigger('click')

        expect(
          mockWriteText
        ).toHaveBeenCalledWith('myid')
        expect(
          mockWriteText
        ).toHaveBeenCalledWith('mysecret')
        expect(
          mockToast.add
        ).toHaveBeenCalled()

        mockWriteText.mockRejectedValueOnce(new Error('Clip Error'))
        const spyError = vi.spyOn(console, 'error').mockImplementation(() => {})
        await wrapper.vm.copyToClipboard('fail')
        expect(
          spyError
        ).toHaveBeenCalled()
        spyError.mockRestore()
      }
    )

    it(
      'handles toggling permissions and filtering query',
      async () => {
        const permissionFields = [
          ...minimalFields,
          { key: 'permissions', label: 'Permissions', type: 'permission-grid', autocomplete: { endpoint: 'permissions' } }
        ]
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: permissionFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await vi.dynamicImportSettled()

        const toggle = wrapper.findComponent({ name: 'DataTable' }).findComponent({ name: 'ToggleSwitch' })
        await toggle.vm.$emit('update:model-value', true)
        expect(
          wrapper.vm.formData.permissions
        ).toContain('admin')

        await toggle.vm.$emit('update:model-value', false)
        expect(
          wrapper.vm.formData.permissions
        ).not.toContain('admin')

        const permSearchInput = wrapper.findAllComponents({ name: 'InputText' }).find(c => c.attributes('placeholder') === 'Search permissions...')
        await permSearchInput.vm.$emit('update:model-value', 'admin')

        expect(
          wrapper.vm.filteredPermissions
        ).toEqual([{ name: 'admin' }])
      }
    )

    it(
      'disables fields properly based on state',
      async () => {
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        const idField = minimalFields.find(f => f.key === 'id')
        const nameField = minimalFields.find(f => f.key === 'name')

        expect(
          wrapper.vm.isFieldDisabled(idField)
        ).toBe(true)
        expect(
          wrapper.vm.isFieldDisabled(nameField)
        ).toBe(false)

        mockRoute.params.id = '123'
        await wrapper.vm.$nextTick()

        wrapper.vm.isModifyMode = false
        expect(
          wrapper.vm.isFieldDisabled(nameField)
        ).toBe(true)

        const modifyToggle = wrapper.findComponent({ name: 'ToggleSwitch' })
        await modifyToggle.vm.$emit('update:model-value', true)

        expect(
          wrapper.vm.isFieldDisabled(nameField)
        ).toBe(false)
      }
    )

    it(
      'searches suggestions successfully using autocomplete config',
      async () => {
        const autocompleteFields = [
          ...minimalFields,
          { key: 'owner', label: 'Owner', type: 'autocomplete', autocomplete: { endpoint: 'owners', field: 'name' } }
        ]
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        vi.mocked(api.get).mockResolvedValue({
          result: [{ name: 'Owner1' }, { name: 'Owner2' }]
        })

        const autocomplete = wrapper.findComponent({ name: 'AutoComplete' })
        await autocomplete.vm.$emit('complete', { query: 'Own' })

        expect(
          wrapper.vm.suggestions.owner
        ).toEqual(['Owner1', 'Owner2'])
        expect(
          api.get
        ).toHaveBeenCalledWith(
          'owners',
          { name: 'Own' }
        )
      }
    )

    it(
      'searches suggestions using autocomplete function endpoints',
      async () => {
        const spyError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const autocompleteFields = [
          ...minimalFields,
          {
            key: 'owner',
            label: 'Owner',
            type: 'autocomplete',
            autocomplete: {
              endpoint: (data, query) => `dynamic-endpoint/${query}`,
              field: 'name'
            }
          }
        ]
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        const ownerField = autocompleteFields.find(f => f.key === 'owner')
        vi.mocked(api.get).mockResolvedValue({
          result: ['DirectOwner1', 'DirectOwner2']
        })

        await wrapper.vm.searchSuggestions(
          { query: 'foo' },
          ownerField
        )

        expect(
          wrapper.vm.suggestions.owner
        ).toEqual(['DirectOwner1', 'DirectOwner2'])
        expect(
          api.get
        ).toHaveBeenCalledWith(
          'dynamic-endpoint/foo',
          { name: 'foo' }
        )

        vi.mocked(api.get).mockRejectedValueOnce(new Error('Search Error'))
        await wrapper.vm.searchSuggestions(
          { query: 'foo' },
          ownerField
        )
        expect(
          spyError
        ).toHaveBeenCalled()
        spyError.mockRestore()
      }
    )

    it(
      'handles autocomplete endpoint returning promise or array',
      async () => {
        const autocompleteFields = [
          ...minimalFields,
          {
            key: 'owner',
            label: 'Owner',
            type: 'autocomplete',
            autocomplete: {
              endpoint: () => Promise.resolve(['ResolvedOwner1']),
              field: 'name'
            }
          },
          {
            key: 'group',
            label: 'Group',
            type: 'autocomplete',
            autocomplete: {
              endpoint: () => ['SyncOwner1'],
              field: 'name'
            }
          }
        ]
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        const ownerField = autocompleteFields.find(f => f.key === 'owner')
        const groupField = autocompleteFields.find(f => f.key === 'group')

        await wrapper.vm.searchSuggestions(
          { query: '' },
          ownerField
        )
        await wrapper.vm.searchSuggestions(
          { query: '' },
          groupField
        )

        expect(
          wrapper.vm.suggestions.owner
        ).toEqual(['ResolvedOwner1'])
        expect(
          wrapper.vm.suggestions.group
        ).toEqual(['SyncOwner1'])
      }
    )

    it(
      'handles multiple autocomplete synchronous array endpoints on mount',
      async () => {
        const autocompleteFields = [
          ...minimalFields,
          {
            key: 'groups',
            label: 'Groups',
            type: 'autocomplete',
            autocomplete: {
              multiple: true,
              endpoint: () => ['SyncGroup1', 'SyncGroup2'],
              field: 'name'
            }
          },
          {
            key: 'groups_promise',
            label: 'Groups Promise',
            type: 'autocomplete',
            autocomplete: {
              multiple: true,
              endpoint: () => Promise.resolve(['PromiseGroup1', 'PromiseGroup2']),
              field: 'name'
            }
          },
          {
            key: 'groups_no_endpoint',
            label: 'Groups No Endpoint',
            type: 'autocomplete'
          },
          {
            key: 'perms_no_auto',
            label: 'Permissions No Autocomplete',
            type: 'permission-grid'
          },
          {
            key: 'groups_obj_endpoint',
            label: 'Groups Obj',
            type: 'autocomplete',
            autocomplete: {
              multiple: true,
              endpoint: () => [{ label: 'Obj1' }, { label: 'Obj2' }],
              field: 'label'
            }
          }
        ]

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          wrapper.vm.suggestions.groups
        ).toEqual(['SyncGroup1', 'SyncGroup2'])
        expect(
          wrapper.vm.suggestions.groups_promise
        ).toEqual(['PromiseGroup1', 'PromiseGroup2'])
        expect(
          wrapper.vm.suggestions.groups_obj_endpoint
        ).toEqual(['Obj1', 'Obj2'])
      }
    )

    it(
      'maps autocomplete suggestions with different response field types',
      async () => {
        const autocompleteFields = [
          ...minimalFields,
          {
            key: 'item1',
            label: 'Item 1',
            type: 'autocomplete',
            autocomplete: {
              endpoint: 'items',
              field: 'name',
              responseField: 'customKey'
            }
          },
          {
            key: 'item2',
            label: 'Item 2',
            type: 'autocomplete',
            autocomplete: {
              endpoint: 'items',
              field: 'name'
            }
          }
        ]

        vi.mocked(api.get).mockResolvedValueOnce({
          result: [
            { customKey: 'val1' },
            { customKey: 'val2' }
          ]
        })

        vi.mocked(api.get).mockResolvedValueOnce({
          result: [
            { id: 'id1' },
            { name: 'name2' },
            { other: 'value3' }
          ]
        })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        const f1 = autocompleteFields[3]
        const f2 = autocompleteFields[4]

        await wrapper.vm.searchSuggestions(
          { query: '' },
          f1
        )
        await wrapper.vm.searchSuggestions(
          { query: '' },
          f2
        )

        expect(
          wrapper.vm.suggestions.item1
        ).toEqual(['val1', 'val2'])
        expect(
          wrapper.vm.suggestions.item2
        ).toEqual(['id1', 'name2', ''])
      }
    )

    it(
      'logs console errors on autocomplete mount failure',
      async () => {
        const spyError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const autocompleteFields = [
          ...minimalFields,
          {
            key: 'groups',
            label: 'Groups',
            type: 'autocomplete',
            autocomplete: {
              multiple: true,
              endpoint: 'failing-endpoint',
              field: 'name'
            }
          }
        ]

        vi.mocked(api.get).mockRejectedValueOnce(new Error('Mount Options Fail'))

        mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: autocompleteFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          spyError
        ).toHaveBeenCalled()
        spyError.mockRestore()
      }
    )

    it(
      'handles write-only resource correctly without fetching details',
      async () => {
        mockRoute.params.id = '123'
        const mockFetch = vi.fn()
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const writeOnlyDef = {
          ...getMockResource(),
          writeOnly: true
        }

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: writeOnlyDef
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        expect(
          mockFetch
        ).not.toHaveBeenCalled()
        expect(
          wrapper.vm.formData.id
        ).toBe('123')
      }
    )

    it(
      'saves new resource successfully',
      async () => {
        const mockCreate = vi.fn().mockResolvedValue({ id: 'new-id' })
        vi.mocked(useCreateResource).mockReturnValue({ create: mockCreate })
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = 'New Item'

        await wrapper.find('form').trigger('submit')

        expect(
          mockCreate
        ).toHaveBeenCalled()
        expect(
          mockToast.add
        ).toHaveBeenCalled()
      }
    )

    it(
      'triggers and covers compiled v-model update functions for all field types',
      async () => {
        const allFieldDefs = [
          { key: 'text_f', label: 'Text Field', type: 'text' },
          { key: 'textarea_f', label: 'Textarea Field', type: 'textarea' },
          { key: 'password_f', label: 'Password Field', type: 'password' },
          { key: 'select_f', label: 'Select Field', type: 'select', options: [{ label: 'L', value: 'V' }] },
          { key: 'switch_f', label: 'Switch Field', type: 'switch' },
          { key: 'pass_f', label: 'Pass', type: 'double-password' },
          { key: 'auto_f', label: 'Auto', type: 'autocomplete', autocomplete: { multiple: true, endpoint: 'groups' } },
          { key: 'auto_single_f', label: 'Auto Single', type: 'autocomplete', autocomplete: { endpoint: 'owners' } },
          { key: 'number_f', label: 'Number Field', type: 'number' }
        ]

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: allFieldDefs })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        const inputtext = wrapper.findComponent({ name: 'InputText' })
        await inputtext.vm.$emit('update:model-value', 'mytext')

        const textarea = wrapper.findComponent({ name: 'Textarea' })
        await textarea.vm.$emit('update:model-value', 'myarea')

        const passwordComps = wrapper.findAllComponents({ name: 'Password' })
        await passwordComps[0].vm.$emit('update:model-value', 'pass1')
        await passwordComps[1].vm.$emit('update:model-value', 'pass1')
        await passwordComps[2].vm.$emit('update:model-value', 'pass2')

        const select = wrapper.findComponent({ name: 'Select' })
        await select.vm.$emit('update:model-value', 'V')

        const toggleswitch = wrapper.findComponent({ name: 'ToggleSwitch' })
        await toggleswitch.vm.$emit('update:model-value', true)

        const multiselect = wrapper.findComponent({ name: 'MultiSelect' })
        await multiselect.vm.$emit('update:model-value', ['g1'])

        const autocomplete = wrapper.findComponent({ name: 'AutoComplete' })
        await autocomplete.vm.$emit('update:model-value', 'owner1')

        const inputnumber = wrapper.findComponent({ name: 'InputNumber' })
        await inputnumber.vm.$emit('update:model-value', 42)

        expect(
          wrapper.vm.formData.text_f
        ).toBe('mytext')
        expect(
          wrapper.vm.formData.textarea_f
        ).toBe('myarea')
        expect(
          wrapper.vm.formData.password_f
        ).toBe('pass1')
        expect(
          wrapper.vm.formData.select_f
        ).toBe('V')
        expect(
          wrapper.vm.formData.switch_f
        ).toBe(true)
        expect(
          wrapper.vm.formData.pass_f
        ).toBe('pass1')
        expect(
          wrapper.vm.confirmPassword.pass_f
        ).toBe('pass2')
        expect(
          wrapper.vm.formData.auto_f
        ).toEqual(['g1'])
        expect(
          wrapper.vm.formData.auto_single_f
        ).toBe('owner1')
        expect(
          wrapper.vm.formData.number_f
        ).toBe(42)
      }
    )

    it(
      'deletes hidden fields from payload on save',
      async () => {
        const mockCreate = vi.fn().mockResolvedValue({ id: 'new-id' })
        vi.mocked(useCreateResource).mockReturnValue({ create: mockCreate })

        const hiddenFields = [
          ...minimalFields,
          { key: 'secret_key', label: 'Secret Key', type: 'text', hiddenOnCreate: true, hiddenOnEdit: true },
          { key: 'univ_hidden', label: 'Univ Hidden', type: 'text', hidden: true }
        ]

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: hiddenFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = 'New Item'
        wrapper.vm.formData.secret_key = 'some-secret'
        wrapper.vm.formData.univ_hidden = 'univ-val'

        await wrapper.find('form').trigger('submit')

        expect(
          mockCreate
        ).toHaveBeenCalledWith(
          expect.not.objectContaining({
            secret_key: expect.anything(),
            univ_hidden: expect.anything()
          }),
          mockRoute
        )

        const mockUpdate = vi.fn().mockResolvedValue({})
        vi.mocked(useUpdateResource).mockReturnValue({ update: mockUpdate })

        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'Existing Resource',
          active: false,
          secret_key: 'some-secret'
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const wrapperEdit = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: hiddenFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        wrapperEdit.vm.isModifyMode = true
        await wrapperEdit.find('form').trigger('submit')

        expect(
          mockUpdate
        ).toHaveBeenCalledWith(
          '123',
          expect.not.objectContaining({
            secret_key: expect.anything()
          }),
          mockRoute
        )
      }
    )

    it(
      'fails save on required field validation',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = ''

        await wrapper.find('form').trigger('submit')

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Name is required',
          life: 3000
        })
      }
    )

    it(
      'fails save on double-password mismatch validation',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)

        const passwordFields = [
          ...minimalFields,
          { key: 'passports', label: 'Passports', type: 'double-password' }
        ]

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource({ fields: passwordFields })
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = 'Test'
        wrapper.vm.formData.passports = 'pass1'
        wrapper.vm.confirmPassword.passports = 'pass2'

        await wrapper.find('form').trigger('submit')

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Passwords do not match',
          life: 3000
        })
      }
    )

    it(
      'shows secret dialog when secret is returned from create',
      async () => {
        const mockCreate = vi.fn().mockResolvedValue({ id: 'key-id', secret: 'secret-token' })
        vi.mocked(useCreateResource).mockReturnValue({ create: mockCreate })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = 'New Item'

        await wrapper.find('form').trigger('submit')
        await vi.dynamicImportSettled()

        expect(
          wrapper.vm.showSecretDialog
        ).toBe(true)
        expect(
          wrapper.vm.createdSecret
        ).toBe('secret-token')
        expect(
          wrapper.vm.createdSecretId
        ).toBe('key-id')

        const dialog = wrapper.findComponent({ name: 'Dialog' })
        await dialog.vm.$emit('update:visible', false)

        wrapper.vm.handleCloseSecretDialog()

        expect(
          wrapper.vm.showSecretDialog
        ).toBe(false)
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'resources-search'
        })
      }
    )

    it(
      'saves existing resource successfully',
      async () => {
        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'Existing Resource',
          active: false
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const mockUpdate = vi.fn().mockResolvedValue({})
        vi.mocked(useUpdateResource).mockReturnValue({ update: mockUpdate })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        wrapper.vm.isModifyMode = true
        wrapper.vm.formData.name = 'Updated Name'

        await wrapper.find('form').trigger('submit')

        expect(
          mockUpdate
        ).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({ name: 'Updated Name' }),
          mockRoute
        )
        expect(
          wrapper.vm.isModifyMode
        ).toBe(false)
      }
    )

    it(
      'handles user resource special validation and save logic without passwords',
      async () => {
        const mockUpdate = vi.fn().mockResolvedValue({})
        vi.mocked(useUpdateResource).mockReturnValue({ update: mockUpdate })

        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'john',
          backend: 'internal'
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const userFields = [
          ...minimalFields,
          { key: 'backend', label: 'Backend', type: 'select', options: [{ label: 'Internal', value: 'internal' }] },
          { key: 'password_change', label: 'Password Change', type: 'text' }
        ]
        const userDef = getMockResource({
          name: 'users',
          fields: userFields
        })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: userDef
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        wrapper.vm.isModifyMode = true
        wrapper.vm.formData.name = 'john'

        await wrapper.find('form').trigger('submit')

        expect(
          mockUpdate
        ).toHaveBeenCalledWith(
          '123',
          expect.not.objectContaining({
            password: expect.anything()
          }),
          mockRoute
        )
      }
    )

    it(
      'handles user resource save with password_change',
      async () => {
        const mockCreate = vi.fn().mockResolvedValue({})
        vi.mocked(useCreateResource).mockReturnValue({ create: mockCreate })

        const userFields = [
          ...minimalFields,
          { key: 'backend', label: 'Backend', type: 'select', options: [{ label: 'Internal', value: 'internal' }] },
          { key: 'password_change', label: 'Password Change', type: 'text' }
        ]
        const userDef = getMockResource({
          name: 'users',
          fields: userFields
        })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: userDef
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        wrapper.vm.formData.name = 'john'
        wrapper.vm.formData.backend = 'internal'
        wrapper.vm.formData.password_change = 'newpass'

        await wrapper.find('form').trigger('submit')

        expect(
          mockCreate
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            password: 'newpass'
          }),
          mockRoute
        )
      }
    )

    it(
      'filters user password change when backend is not internal',
      async () => {
        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'ldap_user',
          backend: 'ldap',
          password_change: 'some-pass'
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const userFields = [
          ...minimalFields,
          { key: 'backend', label: 'Backend', type: 'select', options: [{ label: 'LDAP', value: 'ldap' }] },
          { key: 'password_change', label: 'Password Change', type: 'text' }
        ]
        const userDef = getMockResource({
          name: 'users',
          fields: userFields
        })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: userDef
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        wrapper.vm.isModifyMode = true
        await wrapper.vm.$nextTick()

        const changeField = wrapper.vm.fields.find(f => f.key === 'password_change')
        expect(
          changeField
        ).toBeUndefined()
      }
    )

    it(
      'handles save mutations failures',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)
        const mockCreate = vi.fn().mockRejectedValue(new Error('Save Failed'))
        vi.mocked(useCreateResource).mockReturnValue({ create: mockCreate })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        wrapper.vm.formData.name = 'New Item'

        await wrapper.find('form').trigger('submit')

        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save resource data',
          life: 3000
        })
      }
    )

    it(
      'deletes resource successfully',
      async () => {
        mockRoute.params.id = '123'
        const mockRemove = vi.fn().mockResolvedValue({})
        vi.mocked(useDeleteResource).mockReturnValue({ remove: mockRemove })

        const mockConfirm = {
          require: vi.fn((options) => {
            options.accept()
          })
        }
        vi.mocked(useConfirm).mockReturnValue(mockConfirm)

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        const deleteBtn = wrapper.findAllComponents({ name: 'Button' }).find(b => b.props('label') === 'Delete')
        await deleteBtn.trigger('click')

        expect(
          mockConfirm.require
        ).toHaveBeenCalled()
        expect(
          mockRemove
        ).toHaveBeenCalledWith(
          '123',
          mockRoute
        )
      }
    )

    it(
      'handles deletion failures',
      async () => {
        const mockToast = { add: vi.fn() }
        vi.mocked(useToast).mockReturnValue(mockToast)

        mockRoute.params.id = '123'
        const mockRemove = vi.fn().mockRejectedValue(new Error('Delete Failed'))
        vi.mocked(useDeleteResource).mockReturnValue({ remove: mockRemove })

        const mockConfirm = {
          require: vi.fn((options) => {
            options.accept()
          })
        }
        vi.mocked(useConfirm).mockReturnValue(mockConfirm)

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        const deleteBtn = wrapper.findAllComponents({ name: 'Button' }).find(b => b.props('label') === 'Delete')
        await deleteBtn.trigger('click')

        await vi.dynamicImportSettled()

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
      'cancels creation by redirecting to search',
      async () => {
        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        const cancelBtn = wrapper.findAllComponents({ name: 'Button' }).find(b => b.props('label') === 'Cancel')
        await cancelBtn.trigger('click')

        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'resources-search'
        })
      }
    )

    it(
      'cancels edits by resetting modify mode',
      async () => {
        mockRoute.params.id = '123'
        const mockFetch = vi.fn().mockResolvedValue({
          id: '123',
          name: 'Existing Resource',
          active: false
        })
        vi.mocked(useResourceQuery).mockReturnValue({ fetch: mockFetch })

        const wrapper = mount(
          ResourceForm,
          {
            props: {
              resourceDef: getMockResource()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )

        await vi.dynamicImportSettled()

        wrapper.vm.isModifyMode = true
        const cancelBtn = wrapper.findAllComponents({ name: 'Button' }).find(b => b.props('label') === 'Cancel')
        await cancelBtn.trigger('click')

        expect(
          wrapper.vm.isModifyMode
        ).toBe(false)
      }
    )
  }
)
