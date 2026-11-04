import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditEventTable from '../AuditEventTable.vue'

const items = [
  {
    id: 'e1',
    time: '2026-11-04T10:15:00.123Z',
    event: 'jobs.jobs.created',
    module: 'jobs',
    transaction: 'tx1',
    actor: { kind: 'user', id: 'alice.b', via: 'session' },
    object: { kind: 'job', id: 'j1' },
    details: { count: 2 },
    request: { ip: '10.0.0.5' },
    sealed: false
  },
  {
    id: 'e2',
    time: null,
    event: 'jobs.node_jobs.expired',
    module: 'jobs',
    transaction: null,
    actor: null,
    object: null,
    details: null,
    request: null,
    sealed: true
  }
]

const mountTable = (props = {}) =>
  mount(AuditEventTable, {
    props: {
      items,
      loading: false,
      totalRecords: 2,
      rows: 10,
      first: 0,
      ...props
    },
    global: {
      stubs: {
        'router-link': {
          props: ['to'],
          template: '<a class="obj-link"><slot /></a>'
        }
      }
    }
  })

describe('AuditEventTable', () => {
  it('renders events, tolerating null actor/object/request', () => {
    const wrapper = mountTable()
    const text = wrapper.text()
    expect(text).toContain('jobs.jobs.created')
    expect(text).toContain('user: alice.b')
    expect(text).toContain('10.0.0.5')
    expect(text).toContain('unsealed')
    expect(text).toContain('jobs.node_jobs.expired')
    expect(wrapper.findAll('.obj-link')).toHaveLength(1)
  })

  it('emits an escaped actor filter and a transaction filter', async () => {
    const wrapper = mountTable()
    const links = wrapper.findAll('a[href="#"]')
    await links.find((l) => l.text().startsWith('user')).trigger('click')
    await links.find((l) => l.text() === 'tx1').trigger('click')
    expect(wrapper.emitted('filter')).toEqual([
      [{ actor_kind: 'user', actor_id: '^alice\\.b$' }],
      [{ transaction: 'tx1' }]
    ])
  })

  it('hides the object column when asked', () => {
    const wrapper = mountTable({ showObject: false })
    expect(wrapper.findAll('.obj-link')).toHaveLength(0)
  })

  it('shows details and request when a row is expanded', async () => {
    const wrapper = mountTable()
    await wrapper.find('button.p-datatable-row-toggle-button').trigger('click')
    expect(wrapper.text()).toContain('"count": 2')
    expect(wrapper.text()).toContain('"ip": "10.0.0.5"')
  })
})
