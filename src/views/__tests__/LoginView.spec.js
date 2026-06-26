import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import LoginView from '../LoginView.vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import axios from 'axios'
import api from '@/api/client'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn()
    }
  }
})

vi.mock('@/api/client', () => {
  return {
    default: {
      get: vi.fn()
    }
  }
})

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ result: [] })
  })

  it('renders username and password fields', () => {
    const wrapper = mount(
      LoginView,
      {
        global: {
          stubs: {
            Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
            InputText: { name: 'InputText', template: '<input />' },
            Password: { name: 'Password', template: '<input />' },
            Button: { name: 'Button', template: '<button></button>' }
          }
        }
      }
    )
    expect(
      wrapper.findComponent(InputText).exists()
    ).toBe(true)
    expect(
      wrapper.findComponent(Password).exists()
    ).toBe(true)
    expect(
      wrapper.findComponent(Button).exists()
    ).toBe(true)
  })

  it('submitting calls axios.post and navigates to Home on success', async () => {
    const router = useRouter()
    const auth = authStore()
    vi.spyOn(auth, 'fetchUserData').mockResolvedValueOnce(
      { id: 'user1' }
    )
    vi.mocked(axios.post).mockResolvedValueOnce(
      {}
    )

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          Card: { template: '<div><slot name="content" /></div>' },
          InputText: { name: 'InputText', template: '<input />', props: ['modelValue'] },
          Password: { name: 'Password', template: '<input />', props: ['modelValue'] },
          Button: true
        }
      }
    })
    
    await wrapper.findComponent(InputText).vm.$emit('update:modelValue', 'testuser')
    await wrapper.findComponent(Password).vm.$emit('update:modelValue', 'testpass')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    
    expect(axios.post).toHaveBeenCalledWith('/api/v1/authenticate', {
      user: 'testuser',
      password: 'testpass'
    })
    expect(auth.fetchUserData).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'Home' })
  })

  it('navigates to LoginError on failure', async () => {
    const router = useRouter()
    vi.mocked(axios.post).mockRejectedValueOnce(
      new Error('Failed')
    )

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          Card: { template: '<div><slot name="content" /></div>' },
          InputText: { name: 'InputText', template: '<input />', props: ['modelValue'] },
          Password: { name: 'Password', template: '<input />', props: ['modelValue'] },
          Button: true
        }
      }
    })
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    
    expect(router.push).toHaveBeenCalledWith({ name: 'LoginError' })
  })

  it('renders provider buttons when providers are fetched', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      {
        result: [
          { name: 'Google', url: '/oauth/google' },
          { name: 'GitHub', url: '/oauth/github' }
        ]
      }
    )
    const wrapper = mount(
      LoginView,
      {
        global: {
          stubs: {
            Card: {
              template: '<div><slot name="content" /></div>'
            },
            InputText: true,
            Password: true,
            Button: {
              template: '<button class="provider-btn">{{label}}</button>',
              props: ['label']
            }
          }
        }
      }
    )
    await flushPromises()
    
    const text = wrapper.text()
    expect(
      text
    ).toContain('Google')
    expect(
      text
    ).toContain('GitHub')
    expect(
      text
    ).toContain('Or continue with')
  })

  it('hides divider section when no providers are fetched', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      { result: [] }
    )
    const wrapper = mount(
      LoginView,
      {
        global: {
          stubs: {
            Card: {
              template: '<div><slot name="content" /></div>'
            },
            InputText: true,
            Password: true,
            Button: true
          }
        }
      }
    )
    await flushPromises()
    
    expect(
      wrapper.text()
    ).not.toContain('Or continue with')
  })
})
