import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KeyValueEditor from '../KeyValueEditor.vue'

const stubs = {
  InputText: 'input',
  Button: 'button'
}

describe('KeyValueEditor', () => {
  it('renders a placeholder when there are no rows', () => {
    const wrapper = mount(KeyValueEditor, {
      props: { rows: [], disabled: false },
      global: { stubs }
    })
    expect(wrapper.text()).toContain('No entries')
  })

  it('renders one input pair per row', () => {
    const wrapper = mount(KeyValueEditor, {
      props: {
        rows: [
          { key: 'a', value: '1' },
          { key: 'b', value: '2' }
        ],
        disabled: false
      },
      global: { stubs }
    })
    // 2 rows * 2 inputs = 4 inputs
    expect(wrapper.findAll('input')).toHaveLength(4)
  })

  it('emits add when the add button is clicked', async () => {
    const wrapper = mount(KeyValueEditor, {
      props: { rows: [], disabled: false },
      global: { stubs }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('emits remove with the row index', async () => {
    const wrapper = mount(KeyValueEditor, {
      props: {
        rows: [{ key: 'a', value: '1' }],
        disabled: false
      },
      global: { stubs }
    })
    // first button is the row's remove button
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0]).toEqual([0])
  })
})
