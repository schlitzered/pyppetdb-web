import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import Select from 'primevue/select'
import CAInsertPicker from '../CAInsertPicker.vue'

describe('CAInsertPicker', () => {
  it('emits the picked option and stays reset', () => {
    const wrapper = mount(CAInsertPicker, {
      props: {
        options: ['{{cn}}', '{{sans}}']
      },
      global: {
        stubs: primeVueStubs
      }
    })

    const select = wrapper.findComponent(Select)
    select.vm.$emit('update:modelValue', '{{sans}}')
    expect(wrapper.emitted('insert')).toEqual([['{{sans}}']])

    // the control is pinned to null so it never keeps a value
    expect(select.props('modelValue')).toBeNull()
  })

  it('ignores a cleared (null) selection', () => {
    const wrapper = mount(CAInsertPicker, {
      props: {
        options: ['GITHUB_TOKEN']
      },
      global: {
        stubs: primeVueStubs
      }
    })

    wrapper.findComponent(Select).vm.$emit('update:modelValue', null)
    expect(wrapper.emitted('insert')).toBeUndefined()
  })

  it('disables itself and shows the empty placeholder when no options exist', () => {
    const wrapper = mount(CAInsertPicker, {
      props: {
        options: [],
        emptyPlaceholder: 'No secrets'
      },
      global: {
        stubs: primeVueStubs
      }
    })

    const select = wrapper.findComponent(Select)
    expect(select.props('disabled')).toBe(true)
    expect(select.props('placeholder')).toBe('No secrets')
  })
})
