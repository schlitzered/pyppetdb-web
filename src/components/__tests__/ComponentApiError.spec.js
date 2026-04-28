import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentApiError from '../ComponentApiError.vue'

// Mock dependencies globally
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    resolve: vi.fn(() => ({ href: '' }))
  })),
  useRoute: vi.fn(() => ({
    name: '',
    params: {},
    query: {},
    meta: {}
  })),
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}))

vi.mock('vuetify', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      global: { name: { value: 'light' } }
    }))
  };
});

vi.mock('@/api/common', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ result: [], meta: {}, nodes: [], filters: [] })),
    request: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({}))
  }
}))

vi.mock('@/store/login_data', () => ({
  loginDataStore: vi.fn(() => ({
    getUserDataIsAdmin: true,
    isLoaded: false,
    resetTimestamp: vi.fn(),
    resetUserData: vi.fn(),
    resetIsLoaded: vi.fn(),
    setUserData: vi.fn()
  }))
}))

vi.mock('@/store/api_error', () => ({
  apiErrorStore: vi.fn(() => ({
    setRedirect: vi.fn()
  }))
}))

describe('ComponentApiError', () => {
  it('mounts successfully', () => {
    const wrapper = mount(ComponentApiError, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'ComponentGenericToolBar': true,
          'ComponentNodesSearch': true,
          'ComponentNodesCrud': true,
          'ComponentUsersSearch': true,
          'ComponentUsersCrud': true,
          // Add all standard Vuetify and custom components to be safe
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-form': true,
          'v-switch': true,
          'v-text-field': true,
          'v-textarea': true,
          'v-expansion-panels': true,
          'v-expansion-panel': true,
          'v-expansion-panel-title': true,
          'v-expansion-panel-text': true,
          'v-data-table': true,
          'v-data-table-server': {
             template: '<div><slot name="top" /><slot /></div>'
          },
          'v-toolbar': true,
          'v-toolbar-title': true,
          'v-spacer': true,
          'v-btn': true,
          'v-divider': true,
          'v-icon': true,
          'v-row': true,
          'v-col': true,
          'v-select': true,
          'v-chip': true,
          'v-menu': true,
          'v-list': true,
          'v-list-group': true,
          'v-list-item': true,
          'v-list-item-title': true,
          'v-list-item-subtitle': true,
          'v-list-subheader': true,
          'v-container': true,
          'v-tooltip': true,
          'v-app-bar': true,
          'v-app-bar-title': true,
          'v-app-bar-nav-icon': true,
          'v-dialog': true,
          'v-main': true,
          'v-app': true,
          'v-navigation-drawer': true,
          'router-view': true,
          'router-link': true,
          'v-alert': true,
          'v-progress-linear': true,
          'v-progress-circular': true,
          'v-footer': true,
          'v-breadcrumbs': true,
          'v-breadcrumbs-item': true,
          'v-breadcrumbs-divider': true,
          'v-infinite-scroll': true
        }
      }
    })
    
    expect(wrapper.exists()).toBe(true)
  })
})
