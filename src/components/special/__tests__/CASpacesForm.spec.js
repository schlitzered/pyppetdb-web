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
import CASpacesForm from '../CASpacesForm.vue'

const mockRouter = {
  push: vi.fn()
}
const mockRoute = reactive({
  params: {
    space_id: '_new'
  }
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
  'CASpacesForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.space_id = '_new'
        api.get.mockImplementation(
          (url) => {
            if (url.includes('/api/v1/ca/authorities')) {
              return Promise.resolve({
                result: [
                  {
                    id: 'ca-1'
                  }
                ]
              })
            }
            return Promise.resolve({
              id: 'space-1',
              ca_id: 'ca-1',
              description: 'Space 1',
              ca_id_history: ['old-ca'],
              validation_config: {}
            })
          }
        )
      }
    )

    it(
      'mounts in create mode successfully',
      async () => {
        const wrapper = mount(
          CASpacesForm,
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
      'mounts in edit mode and loads data',
      async () => {
        mockRoute.params.space_id = 'space-1'
        const wrapper = mount(
          CASpacesForm,
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
      'handles back navigation and certificates navigation',
      async () => {
        mockRoute.params.space_id = 'space-1'
        const wrapper = mount(
          CASpacesForm,
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
          name: 'CASpacesSearch'
        })

        const certsBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Certificates')
        )
        await certsBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CASpacesCertsSearch',
          params: {
            space_id: 'space-1'
          }
        })
      }
    )

    it(
      'resets form correctly',
      async () => {
        mockRoute.params.space_id = 'space-1'
        const wrapper = mount(
          CASpacesForm,
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
      'submits form in create mode and navigates',
      async () => {
        api.post.mockResolvedValueOnce({})
        const wrapper = mount(
          CASpacesForm,
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
        wrapper.vm.formData.id = 'new-space'
        wrapper.vm.formData.ca_id = 'ca-1'
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        expect(
          api.post
        ).toHaveBeenCalled()
      }
    )

    it(
      'submits form in edit mode and updates',
      async () => {
        mockRoute.params.space_id = 'space-1'
        api.put.mockResolvedValueOnce({})
        const wrapper = mount(
          CASpacesForm,
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
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        expect(
          api.put
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles submit API errors',
      async () => {
        api.post.mockRejectedValueOnce(
          new Error('Fail')
        )
        const wrapper = mount(
          CASpacesForm,
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
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save CA Space',
          life: 3000
        })
      }
    )

    it(
      'deletes space with confirmation',
      async () => {
        mockRoute.params.space_id = 'space-1'
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.delete.mockResolvedValueOnce({})
        const wrapper = mount(
          CASpacesForm,
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
        mockRoute.params.space_id = 'space-1'
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.delete.mockRejectedValueOnce(
          new Error('Delete failed')
        )
        const wrapper = mount(
          CASpacesForm,
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
        const deleteBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Delete')
        )
        await deleteBtn.trigger('click')
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete CA Space',
          life: 3000
        })
      }
    )

    it(
      'handles CA choices and data loading failures',
      async () => {
        api.get.mockRejectedValue(
          new Error('Load error')
        )
        const wrapper = mount(
          CASpacesForm,
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
      }
    )

    it(
      'watches space_id parameter change',
      async () => {
        const wrapper = mount(
          CASpacesForm,
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
        mockRoute.params.space_id = 'space-changed'
        await wrapper.vm.$nextTick()
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
  }
)
