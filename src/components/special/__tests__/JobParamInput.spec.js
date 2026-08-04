import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JobParamInput from '../JobParamInput.vue'

const stubs = {
  Select: {
    props: ['options'],
    emits: ['update:modelValue'],
    template: '<select class="stub-select" />'
  },
  ToggleSwitch: {
    emits: ['update:modelValue'],
    template: '<div class="stub-toggle" />'
  },
  InputNumber: {
    props: ['min', 'max'],
    emits: ['update:modelValue'],
    template: '<input class="stub-number" />'
  },
  InputText: {
    emits: ['update:modelValue'],
    template:
      '<input class="stub-text" @input="$emit(\'update:modelValue\', \'typed\')" />'
  }
}

const mountInput = (def, extra = {}) => {
  return mount(JobParamInput, {
    props: {
      modelValue: extra.modelValue ?? '',
      def,
      disabled: false,
      inputId: 'p-x',
      error: extra.error ?? null
    },
    global: { stubs }
  })
}

describe('JobParamInput', () => {
  it('renders a Select with the definition options for enum', () => {
    const wrapper = mountInput({ type: 'enum', options: ['a', 'b'] })
    const select = wrapper.findComponent('.stub-select')
    expect(select.exists()).toBe(true)
    expect(wrapper.find('.stub-toggle').exists()).toBe(false)
    expect(select.props('options')).toEqual(['a', 'b'])
  })

  it('renders a toggle for bool', () => {
    const wrapper = mountInput({ type: 'bool' })
    expect(wrapper.find('.stub-toggle').exists()).toBe(true)
    expect(wrapper.find('.stub-text').exists()).toBe(false)
  })

  it('renders a number input with min/max for int', () => {
    const wrapper = mountInput({ type: 'int', min: 1, max: 9 })
    const num = wrapper.findComponent('.stub-number')
    expect(num.exists()).toBe(true)
    expect(num.props('min')).toBe(1)
    expect(num.props('max')).toBe(9)
  })

  it('renders a number input for float', () => {
    const wrapper = mountInput({ type: 'float' })
    expect(wrapper.find('.stub-number').exists()).toBe(true)
  })

  it('renders a text input for string', () => {
    const wrapper = mountInput({ type: 'string' })
    expect(wrapper.find('.stub-text').exists()).toBe(true)
  })

  it('shows the error message when provided', () => {
    const wrapper = mountInput({ type: 'string' }, { error: 'Must match ^x$' })
    expect(wrapper.text()).toContain('Must match ^x$')
  })

  it('forwards value changes via update:modelValue', async () => {
    const wrapper = mountInput({ type: 'string' })
    await wrapper.find('.stub-text').trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['typed'])
  })
})
