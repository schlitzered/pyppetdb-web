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
import CASpacesSearch from '../CASpacesSearch.vue'

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}
const mockRoute = reactive({
  query: {}
})

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
                  id: 'space-active',
                  ca_id: 'ca-1',
                  description: 'Desc Active'
                }
              ],
              meta: {
                total: 1
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
          id: 'space-active',
          ca_id: 'ca-1',
          description: 'Desc Active'
        }
      }
    }
  }
}

describe(
  'CASpacesSearch',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
      }
    )

    it(
      'mounts and renders slots successfully',
      async () => {
        const wrapper = mount(
          CASpacesSearch,
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
      }
    )

    it(
      'navigates to new space page when button is clicked',
      async () => {
        const wrapper = mount(
          CASpacesSearch,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: globalStubs
            }
          }
        )
        const btn = wrapper.findComponent({
          name: 'Button'
        })
        await btn.trigger('click')
        expect(
          mockRouter.push
        ).toHaveBeenCalledWith({
          name: 'CASpacesCRUD',
          params: {
            space_id: '_new'
          }
        })
      }
    )

    it(
      'triggers page, sort, and input search events',
      async () => {
        vi.useFakeTimers()
        const wrapper = mount(
          CASpacesSearch,
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
            rows: 20
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

        const spaceInput = wrapper.find('#space_id')
        await spaceInput.setValue('test-space')
        const caInput = wrapper.find('#ca_id')
        await caInput.setValue('test-ca')

        vi.advanceTimersByTime(350)
        vi.useRealTimers()

        const accordion = wrapper.findComponent({
          name: 'Accordion'
        })
        await accordion.vm.$emit(
          'update:value',
          'filters'
        )
      }
    )
  }
)
