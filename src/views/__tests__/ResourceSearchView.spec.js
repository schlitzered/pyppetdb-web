import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceSearchView from '../ResourceSearchView.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { createPinia } from 'pinia'
import { setActivePinia } from 'pinia'
import { primeVueStubs } from '@/__test_utils__/helpers'

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn()
  }
})

describe('ResourceSearchView', () => {
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
      params: { env: 'production' },
      meta: {
        resource: {
          labelPlural: 'Servers',
          routeParam: 'id',
          routeNames: { crud: 'server-crud' },
          permissions: {
            create: vi.fn().mockReturnValue(true)
          }
        }
      }
    }
    vi.mocked(useRoute).mockReturnValue(
      mockRoute
    )
  })

  it('renders labelPlural from route meta', () => {
    const wrapper = mount(
      ResourceSearchView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceTable: true }
        }
      }
    )
    expect(
      wrapper.text()
    ).toContain('Servers')
  })

  it('renders New button when canCreate is true', () => {
    const wrapper = mount(
      ResourceSearchView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceTable: true }
        }
      }
    )
    const btn = wrapper.findComponent({ name: 'Button' })
    expect(
      btn.exists()
    ).toBe(true)
    expect(
      btn.props('label')
    ).toBe('New')
  })

  it('hides New button when canCreate is false', () => {
    mockRoute.meta.resource.permissions.create.mockReturnValueOnce(false)
    const wrapper = mount(
      ResourceSearchView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceTable: true }
        }
      }
    )
    const btn = wrapper.findComponent({ name: 'Button' })
    expect(
      btn.exists()
    ).toBe(false)
  })

  it('handleCreate navigates to crud route with _new param', async () => {
    const wrapper = mount(
      ResourceSearchView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceTable: true, Button: true }
        }
      }
    )
    const btn = wrapper.findComponent({ name: 'Button' })
    await btn.trigger('click')

    expect(
      mockRouter.push
    ).toHaveBeenCalledWith({
      name: 'server-crud',
      params: { env: 'production', id: '_new' }
    })
  })

  it('handleCreate uses creationParams if provided', async () => {
    mockRoute.meta.resource.creationParams = { custom: 'value' }
    const wrapper = mount(
      ResourceSearchView,
      {
        global: {
          stubs: { ...primeVueStubs, ResponsiveToolbar: { template: '<div><slot name="left"/><slot name="right"/></div>' }, ResourceTable: true, Button: true }
        }
      }
    )
    const btn = wrapper.findComponent({ name: 'Button' })
    await btn.trigger('click')

    expect(
      mockRouter.push
    ).toHaveBeenCalledWith({
      name: 'server-crud',
      params: { env: 'production', custom: 'value' }
    })
  })

  it(
    'hides New button when create permission is not defined',
    () => {
      mockRoute.meta.resource.permissions.create = undefined
      const wrapper = mount(
        ResourceSearchView,
        {
          global: {
            stubs: {
              ...primeVueStubs,
              ResponsiveToolbar: {
                template: '<div><slot name="left"/><slot name="right"/></div>'
              },
              ResourceTable: true
            }
          }
        }
      )
      const btn = wrapper.findComponent({ name: 'Button' })
      expect(
        btn.exists()
      ).toBe(false)
    }
  )
})
