import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import CAAuthoritiesForm from '../CAAuthoritiesForm.vue'
import CAValidationConfig from '../CAValidationConfig.vue'


const mockRoute = reactive({
  params: {
    ca_id: '_new'
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

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn(() => {
          return Promise.resolve({
            result: [],
            meta: {},
            nodes: [],
            filters: []
          })
        }),
        request: vi.fn(),
        delete: vi.fn(),
        post: vi.fn(),
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

const customStubs = {
  ...primeVueStubs,
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe(
  'CAAuthoritiesForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.ca_id = '_new'
        global.URL.createObjectURL = vi.fn(() => 'mock-url')
        global.URL.revokeObjectURL = vi.fn()

        vi.mocked(api.get).mockImplementation((url) => {
          if (url.includes('/api/v1/nodes')) {
            return Promise.resolve({
              result: [
                {
                  id: 'node-1'
                }
              ]
            })
          }
          if (url.includes('/api/v1/ca/authorities/existing-ca')) {
            return Promise.resolve({
              id: 'existing-ca',
              cn: 'Existing CA cn',
              organization: 'Test Org',
              status: 'active',
              certificate: 'cert-pem',
              crl: {
                generation: 1,
                crl_pem: 'crl-pem',
                updated_at: '2026-06-26T12:00:00Z',
                next_update: '2026-07-26T12:00:00Z'
              },
              chain: [
                'cert1',
                'cert2'
              ]
            })
          }
          if (url.includes('/api/v1/ca/authorities')) {
            return Promise.resolve({
              result: [
                {
                  id: 'parent-ca'
                }
              ]
            })
          }
          return Promise.resolve({})
        })
      }
    )

    it(
      'mounts successfully as new and fetches choices',
      async () => {
        const wrapper = mount(
          CAAuthoritiesForm,
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
          wrapper.exists()
        ).toBe(true)
        expect(
          wrapper.vm.caChoices
        ).toEqual(['parent-ca'])
      }
    )

    it(
      'loads existing CA authority data when caId is not _new',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        const wrapper = mount(
          CAAuthoritiesForm,
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
          wrapper.vm.formData.cn
        ).toBe('Existing CA cn')
        expect(
          wrapper.vm.formData.organization
        ).toBe('Test Org')
      }
    )

    it(
      'handles fetch errors gracefully when loading CA data',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockImplementation((url) => {
          if (url.includes('/api/v1/ca/authorities/existing-ca')) {
            return Promise.reject(new Error('Fetch failed'))
          }
          return Promise.resolve({
            result: []
          })
        })
        mount(
          CAAuthoritiesForm,
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
          detail: 'Failed to load CA Authority data',
          life: 3000
        })
      }
    )

    it(
      'handles parent CA choices loading error',
      async () => {
        vi.mocked(api.get).mockImplementation((url) => {
          if (url.includes('/api/v1/ca/authorities')) {
            return Promise.reject(new Error('Choices failed'))
          }
          return Promise.resolve({
            result: []
          })
        })
        mount(
          CAAuthoritiesForm,
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
          detail: 'Failed to load parent CA choices',
          life: 3000
        })
      }
    )

    it(
      'creates new root CA successfully',
      async () => {
        const wrapper = mount(
          CAAuthoritiesForm,
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
        wrapper.vm.caCreationMode = 'internal_root'
        wrapper.vm.formData.id = 'root-ca'
        wrapper.vm.formData.cn = 'Root CA cn'
        await wrapper.vm.formSubmit()
        expect(
          api.post
        ).toHaveBeenCalledWith(
          '/api/v1/ca/authorities/root-ca',
          {
            parent_id: null,
            cn: 'Root CA cn',
            organization: 'PyppetDB',
            organizational_unit: 'CA',
            country: 'DE',
            state: 'Hessen',
            locality: '',
            validity_days: 3650,
            certificate: null,
            private_key: null,
            external_chain: null,
            validation_config: wrapper.vm.formData.validation_config
          }
        )
      }
    )

    it(
      'creates new sub CA successfully',
      async () => {
        const wrapper = mount(
          CAAuthoritiesForm,
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
        wrapper.vm.caCreationMode = 'internal_sub'
        wrapper.vm.formData.id = 'sub-ca'
        wrapper.vm.formData.parent_id = 'root-ca'
        wrapper.vm.formData.cn = 'Sub CA cn'
        await wrapper.vm.formSubmit()
        expect(
          api.post
        ).toHaveBeenCalledWith(
          '/api/v1/ca/authorities/sub-ca',
          {
            parent_id: 'root-ca',
            cn: 'Sub CA cn',
            organization: 'PyppetDB',
            organizational_unit: 'CA',
            country: 'DE',
            state: 'Hessen',
            locality: '',
            validity_days: 3650,
            certificate: null,
            private_key: null,
            external_chain: null,
            validation_config: wrapper.vm.formData.validation_config
          }
        )
      }
    )

    it(
      'creates new external CA successfully',
      async () => {
        const wrapper = mount(
          CAAuthoritiesForm,
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
        wrapper.vm.caCreationMode = 'external'
        wrapper.vm.formData.id = 'ext-ca'
        wrapper.vm.formData.certificate = 'cert'
        wrapper.vm.formData.private_key = 'key'
        wrapper.vm.formData.external_chain_raw = '-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'
        await wrapper.vm.formSubmit()
        expect(
          api.post
        ).toHaveBeenCalledWith(
          '/api/v1/ca/authorities/ext-ca',
          {
            parent_id: null,
            cn: null,
            organization: null,
            organizational_unit: null,
            country: null,
            state: null,
            locality: null,
            validity_days: null,
            certificate: 'cert',
            private_key: 'key',
            external_chain: ['-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'],
            validation_config: wrapper.vm.formData.validation_config
          }
        )
      }
    )

    it(
      'updates existing CA validation config successfully',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        const wrapper = mount(
          CAAuthoritiesForm,
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
        await wrapper.vm.formSubmit()
        expect(
          api.put
        ).toHaveBeenCalledWith(
          '/api/v1/ca/authorities/existing-ca',
          {
            validation_config: wrapper.vm.formData.validation_config
          }
        )
      }
    )

    it(
      'handles save mutation errors gracefully',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        vi.mocked(api.put).mockRejectedValueOnce(new Error('Update failed'))
        await wrapper.vm.formSubmit()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save CA Authority',
          life: 3000
        })
      }
    )

    it(
      'deletes CA authority successfully',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        await flushPromises()
        expect(
          api.delete
        ).toHaveBeenCalledWith('/api/v1/ca/authorities/existing-ca')
      }
    )

    it(
      'handles delete CA authority failure',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        vi.mocked(api.delete).mockRejectedValueOnce(new Error('Delete failed'))
        wrapper.vm.formDelete()
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete CA Authority',
          life: 3000
        })
      }
    )

    it(
      'revokes CA authority successfully',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        wrapper.vm.formRevoke()
        await flushPromises()
        expect(
          api.put
        ).toHaveBeenCalledWith(
          '/api/v1/ca/authorities/existing-ca',
          {
            status: 'revoked'
          }
        )
      }
    )

    it(
      'handles revoke CA authority failure',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        vi.mocked(api.put).mockRejectedValueOnce(new Error('Revoke failed'))
        wrapper.vm.formRevoke()
        await flushPromises()
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to revoke CA Authority',
          life: 3000
        })
      }
    )


    it(
      'handles cancel reset',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
        await wrapper.vm.formReset()
        expect(
          wrapper.vm.isModifyMode
        ).toBe(false)
      }
    )

    it(
      'triggers downloads',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca',
          certificate: 'my-cert',
          crl: {
            crl_pem: 'my-crl'
          },
          chain: ['cert-1', 'cert-2']
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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

        wrapper.vm.downloadCert()
        wrapper.vm.downloadCRL()
        wrapper.vm.downloadChain()
        expect(
          global.URL.createObjectURL
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles redirection buttons',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca'
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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
          name: 'CAAuthoritiesSearch'
        })

        wrapper.vm.goToCerts()
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CAAuthoritiesCertsSearch',
          params: {
            ca_id: 'existing-ca'
          }
        })
      }
    )

    it(
      'watches ca_id route parameters changes',
      async () => {
        const wrapper = mount(
          CAAuthoritiesForm,
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
        vi.mocked(api.get).mockClear()

        mockRoute.params.ca_id = 'new-ca-id'
        await flushPromises()
        expect(
          api.get
        ).toHaveBeenCalled()
      }
    )

    it(
      'triggers template event handlers for full coverage',
      async () => {
        mockRoute.params.ca_id = 'existing-ca'
        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'existing-ca',
          status: 'revoked',
          crl: {
            generation: 1
          }
        })
        const wrapper = mount(
          CAAuthoritiesForm,
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

        const toggles = wrapper.findAllComponents(ToggleSwitch)
        for (const toggle of toggles) {
          toggle.vm.$emit(
            'update:modelValue',
            true
          )
        }

        const selects = wrapper.findAllComponents(Select)
        for (const sel of selects) {
          sel.vm.$emit(
            'update:modelValue',
            'external'
          )
        }

        const revocationInput = wrapper.findComponent('#revocation-date')
        if (revocationInput.exists()) {
          revocationInput.vm.$emit(
            'update:modelValue',
            'test-date'
          )
        }

        const textareas = wrapper.findAllComponents(Textarea)
        for (const ta of textareas) {
          ta.vm.$emit(
            'update:modelValue',
            'test'
          )
        }

        const buttons = wrapper.findAllComponents(Button)
        for (const btn of buttons) {
          await btn.trigger('click')
        }
      }
    )

    it(
      'triggers template event handlers when isNew is true for full coverage',
      async () => {
        mockRoute.params.ca_id = '_new'
        const wrapper = mount(
          CAAuthoritiesForm,
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

        const creationMode = wrapper.findComponent('#creation-mode')
        if (creationMode.exists()) {
          creationMode.vm.$emit(
            'update:modelValue',
            'internal_sub'
          )
        }
        wrapper.vm.caCreationMode = 'internal_sub'
        await flushPromises()

        const parentId = wrapper.findComponent('#parent-id')
        if (parentId.exists()) {
          parentId.vm.$emit(
            'update:modelValue',
            'parent-ca'
          )
        }

        const cnInput = wrapper.findComponent('#common-name')
        if (cnInput.exists()) {
          cnInput.vm.$emit(
            'update:modelValue',
            'cn'
          )
        }

        const orgInput = wrapper.findComponent('#organization')
        if (orgInput.exists()) {
          orgInput.vm.$emit(
            'update:modelValue',
            'org'
          )
        }

        const ouInput = wrapper.findComponent('#organizational-unit')
        if (ouInput.exists()) {
          ouInput.vm.$emit(
            'update:modelValue',
            'ou'
          )
        }

        const countryInput = wrapper.findComponent('#country')
        if (countryInput.exists()) {
          countryInput.vm.$emit(
            'update:modelValue',
            'DE'
          )
        }

        const stateInput = wrapper.findComponent('#state')
        if (stateInput.exists()) {
          stateInput.vm.$emit(
            'update:modelValue',
            'state'
          )
        }

        const localityInput = wrapper.findComponent('#locality')
        if (localityInput.exists()) {
          localityInput.vm.$emit(
            'update:modelValue',
            'locality'
          )
        }

        const validityInput = wrapper.findComponent('#validity-days')
        if (validityInput.exists()) {
          validityInput.vm.$emit(
            'update:modelValue',
            '365'
          )
        }

        wrapper.vm.caCreationMode = 'external'
        await flushPromises()

        const certInput = wrapper.findComponent('#certificate-new')
        if (certInput.exists()) {
          certInput.vm.$emit(
            'update:modelValue',
            'cert'
          )
        }

        const keyInput = wrapper.findComponent('#private-key')
        if (keyInput.exists()) {
          keyInput.vm.$emit(
            'update:modelValue',
            'key'
          )
        }

        const chainInput = wrapper.findComponent('#external-chain')
        if (chainInput.exists()) {
          chainInput.vm.$emit(
            'update:modelValue',
            'chain'
          )
        }

        const validationConfig = wrapper.findComponent(CAValidationConfig)
        if (validationConfig.exists()) {
          validationConfig.vm.$emit(
            'update:modelValue',
            {}
          )
        }
      }
    )
  }
)
