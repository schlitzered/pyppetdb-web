import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginErrorView from '../LoginErrorView.vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn()
  }
})

describe('LoginErrorView', () => {
  let mockRouter

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockRouter = { push: vi.fn() }
    vi.mocked(useRouter).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Authentication Failed message', () => {
    const wrapper = mount(LoginErrorView, {
      global: {
        stubs: {
          Card: { template: '<div><slot name="content" /></div>' },
          Button: { template: '<button class="btn" :to="to">{{label}}</button>', props: ['label', 'to'] },
          XCircle: true,
          'router-link': true
        }
      }
    })
    expect(wrapper.text()).toContain('Authentication Failed')
  })

  it('renders Continue to Login button', () => {
    const wrapper = mount(LoginErrorView, {
      global: {
        stubs: {
          Card: { template: '<div><slot name="content" /></div>' },
          Button: { template: '<button class="btn" :to="to">{{label}}</button>', props: ['label', 'to'] },
          XCircle: true,
          'router-link': true
        }
      }
    })
    const btn = wrapper.findComponent(Button)
    expect(btn.props('label')).toBe('Continue to Login')
    expect(btn.props('to')).toBe('/login')
  })

  it('auto-redirects to Login after 5 seconds', () => {
    mount(LoginErrorView, {
      global: {
        stubs: {
          Card: true,
          Button: true,
          XCircle: true,
          'router-link': true
        }
      }
    })

    vi.advanceTimersByTime(5000)
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'Login' })
  })
})

