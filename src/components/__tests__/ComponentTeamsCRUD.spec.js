/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentTeamsCRUD from '../ComponentTeamsCRUD.vue'
import api from '@/api/common'

// Mock dependencies globally
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    resolve: vi.fn(() => ({ href: '' }))
  })),
  useRoute: vi.fn(() => ({
    name: '',
    params: { team: '_new' },
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
    hasPermission: vi.fn(() => true),
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

describe('ComponentTeamsCRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts successfully', () => {
    const wrapper = mount(ComponentTeamsCRUD, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'ComponentGenericToolBar': true,
          'v-card': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-form': true,
          'v-switch': true,
          'v-text-field': true,
          'v-autocomplete': true,
          'v-divider': true,
          'v-btn': true,
          'v-spacer': true
        }
      }
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('fetches and populates permissions including jobs and hiera', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/api/v1/ca/spaces') {
        return Promise.resolve({ result: [{ id: 'space1' }] })
      }
      if (url === '/api/v1/ca/authorities') {
        return Promise.resolve({ result: [{ id: 'auth1' }] })
      }
      if (url === '/api/v1/jobs/definitions') {
        return Promise.resolve({ result: [{ id: 'job-def-1' }] })
      }
      if (url === '/api/v1/hiera/keys') {
        return Promise.resolve({ result: [{ id: 'hiera-key-1' }] })
      }
      if (url === '/api/v1/users') {
        return Promise.resolve({ result: [] })
      }
      return Promise.resolve({ result: [] })
    })

    const wrapper = mount(ComponentTeamsCRUD, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'v-card': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-form': true,
          'v-switch': true,
          'v-text-field': true,
          'v-autocomplete': true,
          'v-divider': true,
          'v-btn': true,
          'v-spacer': true
        }
      }
    })

    // Wait for all promises to resolve
    await new Promise(resolve => setTimeout(resolve, 100))

    const permissions = wrapper.vm.permissionsChoices
    expect(permissions).toContain('JOBS:JOB::CREATE')
    expect(permissions).toContain('JOBS:DEFINITION::CREATE')
    expect(permissions).toContain('JOBS:DEFINITION::UPDATE')
    expect(permissions).toContain('JOBS:DEFINITION::DELETE')
    expect(permissions).toContain('JOBS:JOB:job-def-1:CREATE')
    expect(permissions).toContain('HIERA:KEY_MODELS_DYNAMIC::CREATE')
    expect(permissions).toContain('HIERA:LEVEL_DATA:hiera-key-1:CREATE')
    expect(permissions).toContain('HIERA:LEVEL_DATA:hiera-key-1:UPDATE')
    expect(permissions).toContain('HIERA:LEVEL_DATA:hiera-key-1:DELETE')
    expect(permissions).toContain('NODES:SECRETS_REDACTOR::CREATE')
    expect(permissions).toContain('NODES:SECRETS_REDACTOR::DELETE')
    expect(permissions).toContain('CA:SPACES:space1:CERTS:UPDATE')
    expect(permissions).toContain('CA:AUTHORITIES:auth1:CERTS:UPDATE')
  })
})
