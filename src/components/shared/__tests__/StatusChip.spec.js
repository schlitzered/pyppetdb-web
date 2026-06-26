import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusChip from '../StatusChip.vue'

describe('StatusChip', () => {
  it('renders label in uppercase', () => {
    const wrapper = mount(StatusChip, {
      props: {
        status: 'active'
      }
    })
    const chip = wrapper.findComponent({ name: 'Chip' })
    expect(chip.props('label')).toBe('ACTIVE')
  })

  it('renders emerald classes for success statuses', () => {
    const statuses = ['changed', 'success', 'connected']
    for (const status of statuses) {
      const wrapper = mount(StatusChip, {
        props: { status }
      })
      const chip = wrapper.findComponent({ name: 'Chip' })
      expect(chip.classes()).toContain('bg-emerald-500/15')
    }
  })

  it('renders rose classes for error statuses', () => {
    const statuses = ['failed', 'error']
    for (const status of statuses) {
      const wrapper = mount(StatusChip, {
        props: { status }
      })
      const chip = wrapper.findComponent({ name: 'Chip' })
      expect(chip.classes()).toContain('bg-rose-500/15')
    }
  })

  it('renders zinc classes for neutral statuses', () => {
    const statuses = ['unchanged', 'idle']
    for (const status of statuses) {
      const wrapper = mount(StatusChip, {
        props: { status }
      })
      const chip = wrapper.findComponent({ name: 'Chip' })
      expect(chip.classes()).toContain('bg-zinc-500/15')
    }
  })

  it('renders amber classes for unknown statuses', () => {
    const wrapper = mount(StatusChip, {
      props: {
        status: 'unknown'
      }
    })
    const chip = wrapper.findComponent({ name: 'Chip' })
    expect(chip.classes()).toContain('bg-amber-500/15')
  })
})
