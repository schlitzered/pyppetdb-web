import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import api from '@/api/client'
import AuditConfig from '../AuditConfig.vue'

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), put: vi.fn() }
}))

const perms = { list: ['AUDIT:CONFIG::GET', 'AUDIT:CONFIG::UPDATE'] }
vi.mock('@/stores/auth', () => ({
  authStore: () => ({
    hasPermission: (p) => perms.list.includes(p)
  })
}))

const config = () => ({
  enabled: true,
  events: { 'jobs.agents': false, 'old.rule': true },
  retention_days: 365,
  seal_interval: 60,
  unknown_rules: ['old.rule']
})

const events = () => ({
  result: [
    {
      name: 'jobs.agents.connected',
      module: 'jobs',
      description: 'Agent connected',
      default: true,
      mandatory: false,
      enabled: false
    },
    {
      name: 'jobs.jobs.created',
      module: 'jobs',
      description: 'Job created',
      default: true,
      mandatory: false,
      enabled: true
    },
    {
      name: 'core.audit.config_changed',
      module: 'core',
      description: 'Config changed',
      default: true,
      mandatory: true,
      enabled: true
    }
  ]
})

const mountConfig = async () => {
  const wrapper = mount(AuditConfig)
  await flushPromises()
  return wrapper
}

describe('AuditConfig', () => {
  beforeEach(() => {
    perms.list = ['AUDIT:CONFIG::GET', 'AUDIT:CONFIG::UPDATE']
    api.get.mockReset()
    api.put.mockReset()
    api.get.mockImplementation((url) =>
      Promise.resolve(url === '/api/v1/audit/config' ? config() : events())
    )
    api.put.mockResolvedValue({})
  })

  it('builds the event tree by module and prefix', async () => {
    const wrapper = await mountConfig()
    const tree = wrapper.vm.tree
    expect(tree.map((n) => n.key)).toEqual(['jobs', 'core'])
    expect(tree[0].children.map((n) => n.key)).toEqual([
      'jobs.agents',
      'jobs.jobs'
    ])
    expect(tree[0].children[0].children[0].data.event.name).toBe(
      'jobs.agents.connected'
    )
    expect(wrapper.text()).toContain('mandatory')
    expect(wrapper.text()).toContain('old.rule')
  })

  it('maps rules to tri-state', async () => {
    const wrapper = await mountConfig()
    expect(wrapper.vm.ruleState('jobs.agents')).toBe('off')
    expect(wrapper.vm.ruleState('jobs')).toBe('inherit')
    wrapper.vm.setRule('jobs', 'on')
    expect(wrapper.vm.ruleState('jobs')).toBe('on')
    wrapper.vm.setRule('jobs.agents', 'inherit')
    expect(wrapper.vm.ruleState('jobs.agents')).toBe('inherit')
  })

  it('saves the complete rule map and reloads', async () => {
    const wrapper = await mountConfig()
    wrapper.vm.setRule('jobs.jobs.created', 'off')
    wrapper.vm.retentionDays = null
    await wrapper.find('button[aria-label="Save"]').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/audit/config', {
      enabled: true,
      events: {
        'jobs.agents': false,
        'old.rule': true,
        'jobs.jobs.created': false
      },
      retention_days: null,
      seal_interval: 60
    })
    // config and events fetched again after save
    expect(api.get).toHaveBeenCalledTimes(4)
  })

  it('is read only without AUDIT:CONFIG::UPDATE', async () => {
    perms.list = ['AUDIT:CONFIG::GET']
    const wrapper = await mountConfig()
    expect(wrapper.find('button[aria-label="Save"]').exists()).toBe(false)
    expect(
      wrapper.findComponent({ name: 'ToggleSwitch' }).props('disabled')
    ).toBe(true)
  })
})
