import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import api from '@/api/client'
import { audit } from '@/resources/audit'
import AuditSearch from '../AuditSearch.vue'

vi.mock('@/api/client', () => ({
  default: { get: vi.fn() }
}))

const event = {
  id: 'e1',
  time: '2026-11-04T10:15:00Z',
  event: 'jobs.jobs.created',
  module: 'jobs',
  transaction: 'tx1',
  actor: { kind: 'user', id: 'alice' },
  object: { kind: 'job', id: 'j1' },
  sealed: true
}

const responses = {
  '/api/v1/audit': { result: [event], meta: { result_size: 1 } },
  '/api/v1/audit/events': {
    result: [{ name: 'jobs.jobs.created' }, { name: 'nodes.nodes.created' }]
  },
  '/api/v1/audit/verify': {
    ok: true,
    checked: 12,
    first_seq: 1,
    last_seq: 12,
    unsealed: 3,
    error: null
  }
}

const mountSearch = () =>
  mount(AuditSearch, {
    props: { resourceDef: audit },
    global: { stubs: { 'router-link': { template: '<a><slot /></a>' } } }
  })

const auditCalls = () =>
  api.get.mock.calls.filter((c) => c[0] === '/api/v1/audit')

describe('AuditSearch', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.get.mockImplementation((url) => Promise.resolve(responses[url]))
  })

  it('loads newest first', async () => {
    const wrapper = mountSearch()
    await flushPromises()
    expect(auditCalls()[0][1]).toMatchObject({
      sort: 'time',
      sort_order: 'descending'
    })
    expect(wrapper.text()).toContain('jobs.jobs.created')
  })

  it('filters by transaction when one is clicked', async () => {
    const wrapper = mountSearch()
    await flushPromises()
    await wrapper.findComponent({ name: 'AuditEventTable' }).vm.$emit(
      'filter',
      { transaction: 'tx1' }
    )
    await flushPromises()
    expect(auditCalls().at(-1)[1]).toMatchObject({ transaction: 'tx1' })
  })

  it('serializes since as ISO 8601', async () => {
    const wrapper = mountSearch()
    await flushPromises()
    const picker = wrapper
      .findAllComponents({ name: 'DatePicker' })
      .find((c) => c.props('inputId') === 'since')
    picker.vm.$emit('update:modelValue', new Date('2026-11-01T00:00:00Z'))
    await flushPromises()
    expect(auditCalls().at(-1)[1]).toMatchObject({
      since: '2026-11-01T00:00:00.000Z'
    })
  })

  it('suggests event names from the catalogue', async () => {
    const wrapper = mountSearch()
    await flushPromises()
    const ac = wrapper.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('complete', { query: 'nodes' })
    await flushPromises()
    expect(ac.props('suggestions')).toEqual(['nodes.nodes.created'])
  })

  it('verifies the chain and shows the result', async () => {
    const wrapper = mountSearch()
    await flushPromises()
    await wrapper.find('button[aria-label="Verify chain"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Chain OK: 12 events checked')
    expect(wrapper.text()).toContain('3 unsealed')
  })

  it('shows a broken chain', async () => {
    responses['/api/v1/audit/verify'] = {
      ok: false,
      checked: 17,
      unsealed: 0,
      error: { seq: 17, id: 'bad', reason: 'hash mismatch' }
    }
    const wrapper = mountSearch()
    await flushPromises()
    await wrapper.find('button[aria-label="Verify chain"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Chain broken at seq 17')
    expect(wrapper.text()).toContain('hash mismatch')
  })
})
