import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JobParamsEditor from '../JobParamsEditor.vue'

const stubs = {
  InputText: 'input',
  InputNumber: 'input',
  Select: 'select',
  Button: 'button'
}

const mountEditor = (rows) => {
  return mount(JobParamsEditor, {
    props: { rows, disabled: false },
    global: { stubs }
  })
}

describe('JobParamsEditor', () => {
  it('renders a placeholder when there are no rows', () => {
    const wrapper = mountEditor([])
    expect(wrapper.text()).toContain('No parameters')
  })

  it('shows the regex validator only for string type', () => {
    const wrapper = mountEditor([
      { key: 'a', type: 'string', regex: '', min: null, max: null, options: [] }
    ])
    expect(wrapper.text()).toContain('Regex')
    expect(wrapper.text()).not.toContain('Min')
    expect(wrapper.text()).not.toContain('Options')
  })

  it('shows min/max validators for int and float', () => {
    const wrapper = mountEditor([
      { key: 'a', type: 'int', regex: '', min: null, max: null, options: [] }
    ])
    expect(wrapper.text()).toContain('Min')
    expect(wrapper.text()).toContain('Max')
    expect(wrapper.text()).not.toContain('Regex')
  })

  it('shows an options editor for enum', () => {
    const wrapper = mountEditor([
      {
        key: 'a',
        type: 'enum',
        regex: '',
        min: null,
        max: null,
        options: ['x']
      }
    ])
    expect(wrapper.text()).toContain('Options')
  })

  it('shows a boolean hint for bool type', () => {
    const wrapper = mountEditor([
      { key: 'a', type: 'bool', regex: '', min: null, max: null, options: [] }
    ])
    expect(wrapper.text()).toContain('No validators for boolean')
  })

  it('emits add when the add-parameter button is clicked', async () => {
    const wrapper = mountEditor([])
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('emits remove with the row index', async () => {
    const wrapper = mountEditor([
      { key: 'a', type: 'bool', regex: '', min: null, max: null, options: [] }
    ])
    // the row remove button is the first button
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0]).toEqual([0])
  })

  it('adds an option to an enum row', async () => {
    const rows = [
      { key: 'a', type: 'enum', regex: '', min: null, max: null, options: [] }
    ]
    const wrapper = mountEditor(rows)
    const addOption = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Add Option'))
    await addOption.trigger('click')
    expect(rows[0].options).toHaveLength(1)
  })
})
