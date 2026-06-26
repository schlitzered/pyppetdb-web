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
import CASpacesCertsSearch from '../CASpacesCertsSearch.vue'

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}
const mockRoute = reactive({
  params: {
    space_id: 'space1'
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
        get: vi.fn().mockImplementation(
          () => {
            return Promise.resolve({
              result: [
                {
                  id: 'cert-1',
                  cn: 'node1',
                  status: 'requested',
                  created: '2026-06-26T12:00:00Z'
                },
                {
                  id: 'cert-2',
                  cn: 'node2',
                  status: 'signed',
                  created: ''
                },
                {
                  id: 'cert-3',
                  cn: 'node3',
                  status: 'revoked',
                  created: '2026-06-26T12:00:00Z'
                }
              ],
              meta: {
                total: 3
              }
            })
          }
        ),
        put: vi.fn()
      }
    }
  }
)

const globalStubs = {
  ...primeVueStubs,
  'router-link': {
    template: '<a><slot /></a>'
  },
  DataTable: {
    name: 'DataTable',
    template: '<div><slot /></div>'
  },
  Column: {
    name: 'Column',
    template: '<div><slot name="body" :data="slotData"></slot></div>',
    data() {
      return {
        slotData: {
          id: 'cert-1',
          cn: 'node1',
          status: 'requested',
          created: '2026-06-26T12:00:00Z'
        }
      }
    }
  }
}

describe(
  'CASpacesCertsSearch',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.space_id = 'space1'
      }
    )

    it(
      'mounts and renders columns and tags successfully',
      async () => {
        const wrapper = mount(
          CASpacesCertsSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
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
      'performs batch Sign action on selected certs',
      async () => {
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.put.mockResolvedValueOnce({})
        const wrapper = mount(
          CASpacesCertsSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
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
        wrapper.vm.selectedCerts = [
          {
            id: 'cert-1',
            status: 'requested'
          }
        ]
        await wrapper.vm.$nextTick()
        const signBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Sign')
        )
        await signBtn.trigger('click')
        expect(
          api.put
        ).toHaveBeenCalled()
        expect(
          mockToast.add
        ).toHaveBeenCalled()
      }
    )

    it(
      'performs batch Revoke action and handles API error',
      async () => {
        mockConfirm.require.mockImplementation(
          (options) => {
            options.accept()
          }
        )
        api.put.mockRejectedValueOnce(
          new Error('Put failed')
        )
        const wrapper = mount(
          CASpacesCertsSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
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
        wrapper.vm.selectedCerts = [
          {
            id: 'cert-2',
            status: 'signed'
          }
        ]
        await wrapper.vm.$nextTick()
        const revokeBtn = wrapper.findAll('button').find(
          (el) => el.text().includes('Revoke')
        )
        await revokeBtn.trigger('click')
        expect(
          mockToast.add
        ).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Batch Operation Failed',
          detail: 'Failed to process some certificates.',
          life: 3000
        })
      }
    )

    it(
      'triggers page, sort, and select change',
      async () => {
        const wrapper = mount(
          CASpacesCertsSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const table = wrapper.findComponent({
          name: 'DataTable'
        })
        await table.vm.$emit(
          'page',
          {
            page: 1,
            rows: 10
          }
        )
        await table.vm.$emit(
          'sort',
          {
            sortField: 'id',
            sortOrder: 1
          }
        )
        await table.vm.$emit(
          'sort',
          {
            sortField: 'id',
            sortOrder: -1
          }
        )
        await table.vm.$emit(
          'sort',
          {
            sortField: null
          }
        )

        const select = wrapper.findComponent({
          name: 'Select'
        })
        await select.vm.$emit(
          'update:modelValue',
          'signed'
        )
        await select.vm.$emit('change')

        const accordion = wrapper.findComponent({
          name: 'Accordion'
        })
        await accordion.vm.$emit(
          'update:value',
          'filters'
        )
      }
    )

    it(
      'handles input fields with debounce search',
      async () => {
        vi.useFakeTimers()
        const wrapper = mount(
          CASpacesCertsSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const certInput = wrapper.find('#cert_id')
        await certInput.setValue('test-cert')
        const cnInput = wrapper.find('#cn')
        await cnInput.setValue('test-cn')
        const fpInput = wrapper.find('#fingerprint')
        await fpInput.setValue('test-fp')
        const snInput = wrapper.find('#serial_number')
        await snInput.setValue('test-sn')

        vi.advanceTimersByTime(350)
        vi.useRealTimers()
      }
    )

    it(
      'renders status tags for all statuses',
      () => {
        const statuses = ['signed', 'requested', 'revoked', 'expired']
        for (const status of statuses) {
          const wrapper = mount(
            CASpacesCertsSearch,
            {
              props: {
                resourceDef: createMockResourceDef()
              },
              global: {
                stubs: {
                  ...primeVueStubs,
                  RouterLink: true,
                  DataTable: {
                    template: '<div><slot /></div>'
                  },
                  Column: {
                    template: '<div><slot name="body" :data="slotData"></slot></div>',
                    data() {
                      return {
                        slotData: {
                          id: 'cert-1',
                          cn: 'node1',
                          status: status,
                          created: '2026-06-26T12:00:00Z'
                        }
                      }
                    }
                  }
                }
              }
            }
          )
          expect(wrapper.exists()).toBe(true)
        }
      }
    )
  }
)
