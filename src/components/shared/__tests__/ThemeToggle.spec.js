import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ThemeToggle from '../ThemeToggle.vue'
import { uiStore } from '@/stores/ui'
import Button from 'primevue/button'

describe('ThemeToggle', () => {
  it('renders sun icon when theme is dark', async () => {
    const ui = uiStore()
    const wrapper = mount(ThemeToggle, { global: { stubs: { Button: { name: 'Button', template: '<button @click="$emit(\'click\')"></button>', props: ['icon'] } } } })
    ui.theme = 'dark'
    await nextTick()
    const btn = wrapper.findComponent(Button)
    expect(btn.props('icon')).toBe('pi pi-sun')
  })

  it('renders moon icon when theme is light', async () => {
    const ui = uiStore()
    const wrapper = mount(ThemeToggle, { global: { stubs: { Button: { name: 'Button', template: '<button @click="$emit(\'click\')"></button>', props: ['icon'] } } } })
    ui.theme = 'light'
    await nextTick()
    const btn = wrapper.findComponent(Button)
    expect(btn.props('icon')).toBe('pi pi-moon')
  })

  it('clicking button calls ui.toggleTheme', async () => {
    const ui = uiStore()
    vi.spyOn(ui, 'toggleTheme')
    const wrapper = mount(ThemeToggle, { global: { stubs: { Button: { name: 'Button', template: '<button @click="$emit(\'click\')"></button>', props: ['icon'] } } } })
    const btn = wrapper.findComponent(Button)
    await btn.trigger('click')
    expect(ui.toggleTheme).toHaveBeenCalled()
  })
})

