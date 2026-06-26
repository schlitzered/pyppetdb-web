import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import LogoutView from '../LogoutView.vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import api from '@/api/client'

vi.mock('@/api/client', () => {
  return {
    default: {
      delete: vi.fn()
    }
  }
})

describe('LogoutView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    document.cookie = 'session=val'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders logging out message', () => {
    const wrapper = mount(
      LogoutView,
      {
        global: {
          stubs: {
            Card: { template: '<div><slot name="content" /></div>' },
            ProgressSpinner: true
          }
        }
      }
    )
    expect(
      wrapper.text()
    ).toContain('Logging Out...')
  })

  it('calls api.delete, clears cookie, resets auth, and redirects', async () => {
    const auth = authStore()
    vi.spyOn(auth, 'reset')
    const router = useRouter()
    vi.mocked(api.delete).mockResolvedValueOnce(
      {}
    )

    mount(
      LogoutView,
      {
        global: {
          stubs: {
            Card: true,
            ProgressSpinner: true
          }
        }
      }
    )

    await flushPromises()
    vi.runAllTimers()
    
    expect(
      api.delete
    ).toHaveBeenCalledWith('/api/v1/authenticate')
    expect(
      auth.reset
    ).toHaveBeenCalled()
    expect(
      document.cookie
    ).not.toContain('session=val')

    expect(
      router.push
    ).toHaveBeenCalledWith({ name: 'Login' })
  })

  it(
    'handles api.delete failure gracefully',
    async () => {
      const consoleSpy = vi.spyOn(
        console,
        'error'
      ).mockImplementation(
        () => {}
      )
      const auth = authStore()
      vi.spyOn(
        auth,
        'reset'
      )
      const router = useRouter()
      vi.mocked(api.delete).mockRejectedValueOnce(
        new Error('Network error')
      )

      mount(
        LogoutView,
        {
          global: {
            stubs: {
              Card: true,
              ProgressSpinner: true
            }
          }
        }
      )

      await flushPromises()
      vi.runAllTimers()

      expect(
        consoleSpy
      ).toHaveBeenCalled()
      expect(
        auth.reset
      ).toHaveBeenCalled()
      expect(
        router.push
      ).toHaveBeenCalledWith({ name: 'Login' })

      consoleSpy.mockRestore()
    }
  )
})
