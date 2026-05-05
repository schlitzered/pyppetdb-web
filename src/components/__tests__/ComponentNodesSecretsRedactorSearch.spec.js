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
import ComponentNodesSecretsRedactorSearch from '../ComponentNodesSecretsRedactorSearch.vue'
import api from '@/api/common'

// Mock dependencies globally
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
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
    get: vi.fn(() => Promise.resolve({ result: [], meta: { result_size: 0 } })),
    request: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({}))
  }
}))

vi.mock('@/store/login_data', () => ({
  loginDataStore: vi.fn(() => ({
    getUserDataIsAdmin: true,
    hasPermission: vi.fn(() => true),
    isLoaded: false
  }))
}))

describe('ComponentNodesSecretsRedactorSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts successfully', () => {
    const wrapper = mount(ComponentNodesSecretsRedactorSearch, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'v-card': true,
          'v-data-table-server': {
            template: '<div><slot name="top" /><slot name="item.actions" :item="{id: \'test\'}" /></div>'
          },
          'v-expansion-panels': true,
          'v-expansion-panel': true,
          'v-expansion-panel-title': true,
          'v-expansion-panel-text': true,
          'v-text-field': true,
          'v-icon': true
        }
      }
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('handles delete action', async () => {
    const wrapper = mount(ComponentNodesSecretsRedactorSearch, {
      global: {
        stubs: {
          'ComponentDialogWarning': true,
          'v-card': true,
          'v-data-table-server': true,
          'v-expansion-panels': true,
          'v-expansion-panel': true,
          'v-expansion-panel-title': true,
          'v-expansion-panel-text': true,
          'v-text-field': true,
          'v-icon': true
        }
      }
    })

    const testItem = { id: 'test-secret-id' }
    wrapper.vm.formDelete(testItem)
    
    expect(wrapper.vm.dialogDeleteShow).toBe(true)
    expect(wrapper.vm.dialogDeleteMsg).toContain('test-secret-id')

    await wrapper.vm.dialogDeleteEvent('confirm')
    
    expect(api.delete).toHaveBeenCalledWith('/api/v1/nodes_secrets_redactor/test-secret-id')
  })
})
