import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

if (typeof document !== 'undefined') {
  document.queryCommandSupported = () => {
    return false
  }
  HTMLCanvasElement.prototype.getContext = function (type: string) {
    if (type === '2d') {
      return {
        webkitBackingStorePixelRatio: 1,
        mozBackingStorePixelRatio: 1,
        msBackingStorePixelRatio: 1,
        oBackingStorePixelRatio: 1,
        backingStorePixelRatio: 1
      } as any
    }
    return null
  } as any
}

if (typeof window !== 'undefined') {
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
      }
    }
  window.CSS = window.CSS || {
    escape: (str: string) => {
      return str
    }
  }
}

if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).CSS = (globalThis as any).CSS || {
    escape: (str: string) => {
      return str
    }
  }
}

import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { createMockRouter } from './__test_utils__/helpers'
import { createMockRoute } from './__test_utils__/helpers'

const mockRouter = createMockRouter()
const mockRoute = createMockRoute()

vi.mock('vue-router', () => {
  return {
    useRouter: () => mockRouter,
    useRoute: () => mockRoute,
    createRouter: vi.fn(),
    createWebHistory: vi.fn()
  }
})

vi.mock('@/router', () => {
  return {
    default: mockRouter
  }
})

let pinia = createPinia()

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  config.global.plugins = [pinia, PrimeVue, ConfirmationService, ToastService]
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
})

config.global.plugins = [pinia, PrimeVue, ConfirmationService, ToastService]
