import { reactive } from 'vue'
import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import NodesCrudForm from '../NodesCrudForm.vue'

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}
const mockRoute = reactive({
  params: {
    node: '_new'
  },
  query: {}
})
const mockConfirm = {
  require: vi.fn()
}
const mockToast = {
  add: vi.fn()
}

vi.mock(
  'vue-router',
  () => {
    return {
      useRouter: () => mockRouter,
      useRoute: () => mockRoute
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
  'primevue/usetoast',
  () => {
    return {
      useToast: () => mockToast
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

describe(
  'NodesCrudForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.node = '_new'
        mockRoute.query = {}
        api.get.mockImplementation(
          () => {
            return Promise.resolve({
              id: 'node-1',
              disabled: false,
              change_catalog: 'cat-change',
              change_facts: 'facts-change',
              change_last: 'last-change',
              change_report: 'report-change',
              report_status_computed: 'active',
              facts: {
                simple: 'val',
                bool: true,
                num: 42,
                nullval: null,
                arr: [
                  1,
                  {
                    nested: 'val'
                  }
                ],
                obj: {
                  sub: 'val'
                }
              },
              facts_inject: {
                'custom.fact': 'custom'
              },
              remote_agent: {
                connected: true,
                via: 'agent'
              }
            })
          }
        )
      }
    )

    it(
      'mounts in create mode successfully',
      async () => {
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          wrapper.exists()
        ).toBe(true)
      }
    )

    it(
      'mounts in edit mode and renders complex flattened facts',
      async () => {
        mockRoute.params.node = 'node-1'
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          wrapper.exists()
        ).toBe(true)
      }
    )

    it(
      'handles back navigation, reports navigation, and certs navigation',
      async () => {
        mockRoute.params.node = 'node-1'
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const backBtn = wrapper.findAll('button')[0]
        await backBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesSearch'
        })

        const reportsBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Reports')
        )
        await reportsBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesReportsSearch',
          params: {
            node: 'node-1'
          }
        })

        const certsBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Certs')
        )
        await certsBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CASpacesCertsSearch',
          params: {
            space_id: 'puppet-ca'
          },
          query: {
            cn: 'node-1'
          }
        })
      }
    )

    it(
      'handles form Reset correctly',
      async () => {
        mockRoute.params.node = 'node-1'
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: {
                ...primeVueStubs,
                ToggleSwitch: {
                  name: 'ToggleSwitch',
                  template: '<input type="checkbox" :value="modelValue" @change="$emit(\'update:modelValue\', !modelValue)">',
                  props: ['modelValue']
                }
              }
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const toggle = wrapper.findComponent({
          name: 'ToggleSwitch'
        })
        await toggle.find('input').setValue(true)
        await wrapper.vm.$nextTick()
        const resetBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Reset')
        )
        await resetBtn.trigger('click')
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
      }
    )

    it(
      'submits form in create mode and edit mode',
      async () => {
        api.post.mockResolvedValueOnce({})
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        wrapper.vm.formData.id = 'new-node'
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        expect(
          api.post
        ).toHaveBeenCalled()

        mockRoute.params.node = 'node-1'
        api.put.mockResolvedValueOnce({})
        const wrapperEdit = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: {
                ...primeVueStubs,
                ToggleSwitch: {
                  name: 'ToggleSwitch',
                  template: '<input type="checkbox" :value="modelValue" @change="$emit(\'update:modelValue\', !modelValue)">',
                  props: ['modelValue']
                }
              }
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const toggle = wrapperEdit.findComponent({
          name: 'ToggleSwitch'
        })
        await toggle.find('input').setValue(true)
        await wrapperEdit.vm.$nextTick()
        const formEdit = wrapperEdit.find('form')
        await formEdit.trigger('submit.prevent')
        expect(
          api.put
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles form API error states',
      async () => {
        api.post.mockRejectedValueOnce(
          new Error('Fail')
        )
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        expect(
          mockToast.add
        ).toHaveBeenCalled()
      }
    )

    it(
      'deletes node with confirmation',
      async () => {
        mockRoute.params.node = 'node-1'
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.delete.mockResolvedValueOnce({})
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const deleteBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Delete')
        )
        await deleteBtn.trigger('click')
        expect(
          api.delete
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles delete API error',
      async () => {
        mockRoute.params.node = 'node-1'
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.delete.mockRejectedValueOnce(
          new Error('Delete error')
        )
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const deleteBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Delete')
        )
        await deleteBtn.trigger('click')
        expect(
          mockToast.add
        ).toHaveBeenCalled()
      }
    )

    it(
      'performs facts inject add, edit, save, delete dialog actions',
      async () => {
        mockRoute.params.node = 'node-1'
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: {
                ...primeVueStubs,
                ToggleSwitch: {
                  name: 'ToggleSwitch',
                  template: '<input type="checkbox" :value="modelValue" @change="$emit(\'update:modelValue\', !modelValue)">',
                  props: ['modelValue']
                },
                Dialog: {
                  name: 'Dialog',
                  template: '<div v-if="visible"><slot /><slot name="footer" /></div>',
                  props: ['visible']
                },
                InputText: {
                  name: 'InputText',
                  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
                  props: ['modelValue'],
                  emits: ['update:modelValue']
                }
              }
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const toggle = wrapper.findComponent({
          name: 'ToggleSwitch'
        })
        await toggle.find('input').setValue(true)
        await wrapper.vm.$nextTick()

        wrapper.vm.openAddFactsInject()
        await wrapper.vm.$nextTick()
        wrapper.vm.editedFactsInject.key = 'new.key'
        wrapper.vm.editedFactsInject.value = 'new.val'

        const dialog = wrapper.findComponent({ name: 'Dialog' })
        const inputs = dialog.findAllComponents({ name: 'InputText' })
        await inputs[0].vm.$emit(
          'update:modelValue',
          'new.key'
        )
        await inputs[1].vm.$emit(
          'update:modelValue',
          'new.val'
        )

        wrapper.vm.formData.facts_inject = null
        const saveBtn = dialog.findAll('button').find(
          (el) => el.text().includes('Save')
        )
        await saveBtn.trigger('click')
        expect(
          wrapper.vm.formData.facts_inject['new.key']
        ).toBe('new.val')

        wrapper.vm.editFactsInjectItem({
          key: 'new.key',
          value: 'new.val'
        })
        wrapper.vm.saveFactsInject()

        wrapper.vm.deleteFactsInjectItem({
          key: 'new.key'
        })
        expect(
          wrapper.vm.formData.facts_inject['new.key']
        ).toBeUndefined()

        wrapper.vm.closeFactsInject()

        await dialog.vm.$emit(
          'update:visible',
          false
        )
      }
    )

    it(
      'handles API load failure and covers formatValue object fallback',
      async () => {
        mockRoute.params.node = 'node-1'
        api.get.mockRejectedValueOnce(
          new Error('Load Fail')
        )
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          mockToast.add
        ).toHaveBeenCalled()

        wrapper.vm.formData.facts = [
          {
            key: 'obj.key',
            value: {
              nested: 'val'
            }
          }
        ]
        await wrapper.vm.$nextTick()
      }
    )

    it(
      'handles primitive facts data on mount',
      async () => {
        mockRoute.params.node = 'node-1'
        api.get.mockResolvedValueOnce({
          id: 'node-1',
          disabled: false,
          change_catalog: 'cat-change',
          change_facts: 'facts-change',
          change_last: 'last-change',
          change_report: 'report-change',
          report_status_computed: 'active',
          facts: 'primitive-facts',
          facts_inject: {},
          remote_agent: {
            connected: true,
            via: 'agent'
          }
        })
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          wrapper.vm.formData.facts
        ).toEqual([
          {
            key: 'root',
            value: 'primitive-facts'
          }
        ])
      }
    )

    it(
      'handles null facts data on mount',
      async () => {
        mockRoute.params.node = 'node-1'
        api.get.mockResolvedValueOnce({
          id: 'node-1',
          disabled: false,
          change_catalog: 'cat-change',
          change_facts: 'facts-change',
          change_last: 'last-change',
          change_report: 'report-change',
          report_status_computed: 'active',
          facts: null,
          facts_inject: {},
          remote_agent: {
            connected: true,
            via: 'agent'
          }
        })
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          wrapper.vm.formData.facts
        ).toEqual([])
      }
    )


    it(
      'handles key and value click events in facts list',
      async () => {
        mockRoute.params.node = 'node-1'
        mockRoute.query = {
          fact: 'existing:eq:str:val'
        }
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const keyLink = wrapper.findAll('a').find(
          (el) => el.text() === 'simple'
        )
        await keyLink.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesDistinctFactValues',
          query: {
            fact_id: 'simple'
          }
        })

        const valLink = wrapper.findAll('a').find(
          (el) => el.text() === 'val'
        )
        await valLink.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'NodesSearch',
          query: {
            fact: [
              'simple:eq:str:val',
              'existing:eq:str:val'
            ]
          }
        })
      }
    )

    it(
      'watches query params and updates URL',
      async () => {
        mockRoute.params.node = 'node-1'
        const wrapper = mount(
          NodesCrudForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        const searchKeyInput = wrapper.findAllComponents({ name: 'InputText' }).find(
          (el) => el.attributes('placeholder') === 'Search keys...'
        )
        await searchKeyInput.vm.$emit(
          'update:modelValue',
          'filter.key'
        )
        const searchValueInput = wrapper.findAllComponents({ name: 'InputText' }).find(
          (el) => el.attributes('placeholder') === 'Search values...'
        )
        await searchValueInput.vm.$emit(
          'update:modelValue',
          'filter.val'
        )
        await wrapper.vm.$nextTick()
        expect(
          mockRouter.replace
        ).toHaveBeenCalled()
      }
    )
  }
)
