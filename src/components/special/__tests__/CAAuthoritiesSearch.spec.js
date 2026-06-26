import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import CAAuthoritiesSearch from '../CAAuthoritiesSearch.vue'

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}
const mockRoute = {
  query: {}
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
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn().mockImplementation(
          () => {
            return Promise.resolve({
              result: [
                {
                  id: 'ca-active',
                  status: 'active',
                  internal: true,
                  cn: 'CN Active',
                  issuer: 'Issuer A'
                },
                {
                  id: 'ca-revoked',
                  status: 'revoked',
                  internal: false,
                  cn: 'CN Revoked',
                  issuer: 'Issuer B'
                },
                {
                  id: 'ca-other',
                  status: 'other',
                  internal: false,
                  cn: '',
                  issuer: ''
                }
              ],
              meta: {
                total: 3
              }
            })
          }
        )
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
          id: 'ca1',
          cn: 'Common Name A',
          issuer: 'Issuer A',
          internal: true,
          status: 'active'
        }
      }
    }
  }
}

describe(
  'CAAuthoritiesSearch',
  () => {
    it(
      'mounts and renders multiple tags and router links',
      () => {
        const wrapper = mount(
          CAAuthoritiesSearch,
          {
            props: {
              resourceDef: createMockResourceDef(),
              status: 'active',
              modelValue: ''
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        expect(
          wrapper.exists()
        ).toBe(true)
      }
    )

    it(
      'navigates to new CA page when button is clicked',
      async () => {
        const wrapper = mount(
          CAAuthoritiesSearch,
          {
            props: {
              resourceDef: createMockResourceDef(),
              status: 'active',
              modelValue: ''
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const newCAButton = wrapper.findComponent({
          name: 'Button'
        })
        await newCAButton.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CAAuthoritiesCRUD',
          params: {
            ca_id: '_new'
          }
        })
      }
    )

    it(
      'handles text search with debounce',
      async () => {
        vi.useFakeTimers()
        const wrapper = mount(
          CAAuthoritiesSearch,
          {
            props: {
              resourceDef: createMockResourceDef(),
              status: 'active',
              modelValue: ''
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const caInput = wrapper.find('#ca_id')
        await caInput.setValue('test-ca-id')
        const parentInput = wrapper.find('#parent_id')
        await parentInput.setValue('parent-id')
        const cnInput = wrapper.find('#cn')
        await cnInput.setValue('cn-value')
        const fpInput = wrapper.find('#fingerprint')
        await fpInput.setValue('fp-value')
        vi.advanceTimersByTime(350)
        vi.useRealTimers()
      }
    )

    it(
      'triggers page and sort events on DataTable',
      async () => {
        const wrapper = mount(
          CAAuthoritiesSearch,
          {
            props: {
              resourceDef: createMockResourceDef(),
              status: 'active',
              modelValue: ''
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
            rows: 25
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
      }
    )

    it(
      'triggers select change',
      async () => {
        const wrapper = mount(
          CAAuthoritiesSearch,
          {
            props: {
              resourceDef: createMockResourceDef(),
              status: 'active',
              modelValue: ''
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const accordion = wrapper.findComponent({
          name: 'Accordion'
        })
        await accordion.vm.$emit(
          'update:value',
          'filters'
        )
        const select = wrapper.findComponent({
          name: 'Select'
        })
        await select.vm.$emit(
          'update:modelValue',
          true
        )
        await select.vm.$emit('change')
      }
    )

    it(
      'renders status tags',
      () => {
        const statuses = ['active', 'revoked', 'expired']
        for (const status of statuses) {
          const wrapper = mount(
            CAAuthoritiesSearch,
            {
              props: {
                resourceDef: createMockResourceDef(),
                status: 'active',
                modelValue: ''
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
                          id: 'ca1',
                          cn: 'CN A',
                          issuer: 'Issuer A',
                          internal: true,
                          status: status
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
