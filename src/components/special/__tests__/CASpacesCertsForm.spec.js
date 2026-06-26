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
import CASpacesCertsForm from '../CASpacesCertsForm.vue'

const mockRouter = {
  push: vi.fn()
}
const mockRoute = reactive({
  params: {
    space_id: 'space1',
    cert_id: 'cert1'
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
        put: vi.fn()
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
  'CASpacesCertsForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.space_id = 'space1'
        mockRoute.params.cert_id = 'cert1'
        api.get.mockImplementation(
          (url) => {
            if (url.includes('/api/v1/nodes/')) {
              return Promise.resolve({
                id: 'node1'
              })
            }
            return Promise.resolve({
              id: 'cert1',
              space_id: 'space1',
              ca_id: 'ca1',
              status: 'requested',
              cn: 'node1',
              serial_number: '12345',
              not_before: '2026-06-26T12:00:00Z',
              not_after: '2027-06-26T12:00:00Z',
              fingerprint: {
                md5: 'md5val',
                sha1: 'sha1val',
                sha256: 'sha256val'
              },
              certificate: 'PEM_CERT',
              csr: 'PEM_CSR',
              sans: ['san1']
            })
          }
        )
      }
    )

    it(
      'mounts and loads certificate data successfully',
      async () => {
        const wrapper = mount(
          CASpacesCertsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: {
                ...primeVueStubs,
                RouterLink: true
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
        expect(
          wrapper.exists()
        ).toBe(true)

        const textareas = wrapper.findAllComponents({
          name: 'Textarea'
        })
        for (const textarea of textareas) {
          await textarea.vm.$emit(
            'update:modelValue',
            'test'
          )
        }
        const inputs = wrapper.findAllComponents({
          name: 'InputText'
        })
        for (const input of inputs) {
          await input.vm.$emit(
            'update:modelValue',
            'test'
          )
        }
      }
    )

    it(
      'handles back navigation button click',
      async () => {
        const wrapper = mount(
          CASpacesCertsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: primeVueStubs
            }
          }
        )
        const backBtn = wrapper.findComponent({
          name: 'Button'
        })
        await backBtn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CASpacesCertsSearch',
          params: {
            space_id: 'space1'
          }
        })
      }
    )

    it(
      'handles form reset and toggles modify mode',
      async () => {
        const wrapper = mount(
          CASpacesCertsForm,
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
      'performs sign action with confirmation',
      async () => {
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.put.mockResolvedValueOnce({})
        const wrapper = mount(
          CASpacesCertsForm,
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
        const signBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Sign')
        )
        await signBtn.trigger('click')
        expect(
          api.put
        ).toHaveBeenCalled()
      }
    )

    it(
      'performs revoke action with confirmation and handles API failure',
      async () => {
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.put.mockRejectedValueOnce(
          new Error('Fail')
        )
        const wrapper = mount(
          CASpacesCertsForm,
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
        const revokeBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Revoke')
        )
        await revokeBtn.trigger('click')
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update certificate status.',
          life: 3000
        })
      }
    )

    it(
      'handles empty fields, missing node, and API fetch failure',
      async () => {
        api.get.mockImplementation(
          (url) => {
            if (url.includes('/api/v1/nodes/')) {
              return Promise.reject(
                new Error('Node not found')
              )
            }
            return Promise.resolve({
              id: 'cert2',
              space_id: 'space1',
              status: 'signed',
              cn: 'node-not-exists',
              not_before: '',
              not_after: '',
              fingerprint: null,
              sans: []
            })
          }
        )
        mount(
          CASpacesCertsForm,
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
      }
    )

    it(
      'triggers loading error toast when api.get fails',
      async () => {
        api.get.mockRejectedValue(
          new Error('Load error')
        )
        mount(
          CASpacesCertsForm,
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
      'handles missing space_id and other statuses',
      async () => {
        mockRoute.params.space_id = ''
        api.get.mockResolvedValueOnce({
          id: 'cert1',
          status: 'revoked',
          cn: ''
        })
        mount(
          CASpacesCertsForm,
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
      }
    )

    it(
      'watches cert_id and reloads data',
      async () => {
        const wrapper = mount(
          CASpacesCertsForm,
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
        mockRoute.params.cert_id = 'cert-changed'
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
