import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import AuditPanel from '../AuditPanel.vue'

vi.mock('@/api/client', () => ({
  default: { get: vi.fn() }
}))

const perms = { list: ['AUDIT::GET'] }
vi.mock('@/stores/auth', () => ({
  authStore: () => ({
    hasPermission: (p) => perms.list.includes(p)
  })
}))

const mountPanel = () =>
  mount(AuditPanel, {
    props: { objectKind: 'node', objectId: 'a.example.com' },
    global: { stubs: { 'router-link': { template: '<a><slot /></a>' } } }
  })

describe('AuditPanel', () => {
  beforeEach(() => {
    perms.list = ['AUDIT::GET']
    api.get.mockReset()
    api.get.mockResolvedValue({
      result: [
        {
          id: 'e1',
          event: 'nodes.nodes.updated',
          transaction: 'tx1',
          actor: { kind: 'user', id: 'alice' }
        }
      ],
      meta: { result_size: 1 }
    })
  })

  it('renders nothing without AUDIT::GET', () => {
    perms.list = []
    const wrapper = mountPanel()
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('fetches only once opened, with an anchored escaped id', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    expect(api.get).not.toHaveBeenCalled()
    await wrapper.find('.p-accordionheader').trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/audit', {
      object_kind: 'node',
      object_id: '^a\\.example\\.com$',
      sort: 'time',
      sort_order: 'descending',
      page: 0,
      limit: 10
    })
    expect(wrapper.text()).toContain('nodes.nodes.updated')
  })

  it('pages and opens filters in the audit log', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.p-accordionheader').trigger('click')
    await flushPromises()
    const table = wrapper.findComponent({ name: 'AuditEventTable' })
    table.vm.$emit('page', { page: 2, rows: 25 })
    await flushPromises()
    expect(api.get.mock.calls.at(-1)[1]).toMatchObject({ page: 2, limit: 25 })
    table.vm.$emit('filter', { transaction: 'tx1' })
    expect(useRouter().push).toHaveBeenCalledWith({
      name: 'AuditSearch',
      query: { transaction: 'tx1' }
    })
  })
})
