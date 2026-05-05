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
import ComponentJobsDefinitionsCRUD from '../ComponentJobsDefinitionsCRUD.vue'
import api from '@/api/common'

// Mock dependencies globally
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    resolve: vi.fn(() => ({ href: '' }))
  })),
  useRoute: vi.fn(() => ({
    name: '',
    params: { definition_id: 'test-def' },
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

describe('ComponentJobsDefinitionsCRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts successfully', () => {
    const wrapper = mount(ComponentJobsDefinitionsCRUD, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'ComponentGenericToolBar': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-form': true,
          'v-switch': true,
          'v-text-field': true,
          'v-textarea': true,
          'v-select': true,
          'v-divider': true,
          'v-btn': true,
          'v-spacer': true,
          'v-combobox': true,
          'v-label': true,
          'v-chip': true,
          'v-list-subheader': true,
          'v-row': true,
          'v-col': true
        }
      }
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('handles dialogDeleteEvent correctly', async () => {
    const wrapper = mount(ComponentJobsDefinitionsCRUD, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'v-card': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-form': true,
          'v-switch': true,
          'v-text-field': true,
          'v-textarea': true,
          'v-select': true,
          'v-divider': true,
          'v-btn': true,
          'v-spacer': true,
          'v-combobox': true,
          'v-label': true,
          'v-chip': true,
          'v-list-subheader': true,
          'v-row': true,
          'v-col': true
        }
      }
    })

    // Simulate clicking delete which calls formDelete
    wrapper.vm.formDelete()
    expect(wrapper.vm.dialogDeleteShow).toBe(true)

    // Set formData.id
    wrapper.vm.formData.id = 'test-def'

    // Simulate dialog response with 'confirm'
    await wrapper.vm.dialogDeleteEvent('confirm')
    
    expect(api.delete).toHaveBeenCalledWith('/api/v1/jobs/definitions/test-def')
    expect(wrapper.vm.dialogDeleteShow).toBe(false)
  })
})
