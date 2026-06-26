import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCrudView from '../ResourceCrudView.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { authStore } from '@/stores/auth'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import { primeVueStubs } from '@/__test_utils__/helpers'

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn()
  }
})

describe('ResourceCrudView', () => {
  let mockRouter
  let mockRoute

  beforeEach(() => {
    setActivePinia(
      createPinia()
    )
    vi.clearAllMocks()

    mockRouter = {
      push: vi.fn()
    }
    vi.mocked(useRouter).mockReturnValue(
      mockRouter
    )

    mockRoute = {
      params: { id: '_new' },
      meta: {
        resource: {
          label: 'Server',
          routeParam: 'id',
          routeNames: { search: 'server-search' },
          toolbar: {
            crud: {
              title: 'Server Details',
              items: []
            }
          }
        }
      }
    }
    vi.mocked(useRoute).mockReturnValue(
      mockRoute
    )
  })

  it('renders title as New label when id is _new', () => {
    const wrapper = mount(
      ResourceCrudView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceForm: true }
        }
      }
    )
    expect(
      wrapper.text()
    ).toContain('New Server')
  })

  it('renders crud.title when id is existing', () => {
    mockRoute.params.id = '123'
    const wrapper = mount(
      ResourceCrudView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceForm: true }
        }
      }
    )
    expect(
      wrapper.text()
    ).toContain('Server Details')
  })

  it('handleBack navigates to search route', async () => {
    const wrapper = mount(
      ResourceCrudView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceForm: true, Button: true }
        }
      }
    )
    const backBtn = wrapper.findAllComponents({ name: 'Button' })[0]
    await backBtn.trigger('click')
    
    expect(
      mockRouter.push
    ).toHaveBeenCalledWith({ name: 'server-search' })
  })

  it('renders toolbar items filtered by permissions', () => {
    mockRoute.params.id = '123'
    mockRoute.meta.resource.toolbar.crud.items = [
      { label: 'Public Action', requireAdmin: false },
      { label: 'Admin Action', requireAdmin: true }
    ]
    const auth = authStore()
    auth.loginData = { is_admin: false }

    const wrapper = mount(
      ResourceCrudView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceForm: true, Button: { name: 'Button', template: '<button></button>', props: ['label'] } }
        }
      }
    )

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    const labels = buttons.map((b) => b.props('label'))
    expect(
      labels
    ).toContain('Public Action')
    expect(
      labels
    ).not.toContain('Admin Action')
  })
})
