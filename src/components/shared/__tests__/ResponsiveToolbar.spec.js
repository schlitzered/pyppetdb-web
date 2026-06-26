import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResponsiveToolbar from '../ResponsiveToolbar.vue'

describe('ResponsiveToolbar', () => {
  it('renders content passed to left slot', () => {
    const wrapper = mount(
      ResponsiveToolbar,
      {
        slots: {
          left: '<div class="left-content">Left Content</div>'
        },
        global: {
          stubs: {
            Toolbar: {
              template: '<div><slot name="start" /><slot name="end" /></div>'
            }
          }
        }
      }
    )
    expect(
      wrapper.html()
    ).toContain('Left Content')
    expect(
      wrapper.find('.left-content').exists()
    ).toBe(true)
  })

  it('renders content passed to right slot', () => {
    const wrapper = mount(
      ResponsiveToolbar,
      {
        slots: {
          right: '<div class="right-content">Right Content</div>'
        },
        global: {
          stubs: {
            Toolbar: {
              template: '<div><slot name="start" /><slot name="end" /></div>'
            }
          }
        }
      }
    )
    expect(
      wrapper.html()
    ).toContain('Right Content')
    expect(
      wrapper.find('.right-content').exists()
    ).toBe(true)
  })
})
