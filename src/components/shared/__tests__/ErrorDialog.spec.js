import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorDialog from '../ErrorDialog.vue'
import { apiErrorStore } from '@/stores/apiError'
import { useRouter } from 'vue-router'
import { config } from '@vue/test-utils'
import Button from 'primevue/button'

config.global.stubs = {
  Dialog: { template: '<div><slot/><slot name="footer"/></div>' },
  Button: { name: 'Button', template: '<button @click="$emit(\'click\')"></button>' }
}

describe('ErrorDialog', () => {
  it('renders default message when dialogError is null', async () => {
    const store = apiErrorStore()
    store.dialogShow = true
    const wrapper = mount(ErrorDialog)
    await nextTick()
    expect(wrapper.text()).toContain('An unexpected error occurred.')
  })

  it('renders string when dialogError is a string', async () => {
    const store = apiErrorStore()
    store.dialogShow = true
    store.dialogError = 'Server is down'
    const wrapper = mount(ErrorDialog)
    await nextTick()
    expect(wrapper.text()).toContain('Server is down')
  })

  it('renders JSON stringified when dialogError is an object', async () => {
    const store = apiErrorStore()
    store.dialogShow = true
    store.dialogError = { message: 'Failed' }
    const wrapper = mount(ErrorDialog)
    await nextTick()
    expect(wrapper.text()).toContain('"message": "Failed"')
  })

  it('renders HTTP status when dialogHTTPStatus is set', async () => {
    const store = apiErrorStore()
    store.dialogShow = true
    store.dialogHTTPStatus = 500
    const wrapper = mount(ErrorDialog)
    await nextTick()
    expect(wrapper.text()).toContain('HTTP 500')
  })

  it('handleClose clears store and pushes to router', async () => {
    const store = apiErrorStore()
    store.dialogShow = true
    store.redirect = { name: 'Home' }
    vi.spyOn(store, 'clear')
    
    const router = useRouter()
    
    const wrapper = mount(ErrorDialog)
    await nextTick()
    const closeBtn = wrapper.findComponent(Button)
    await closeBtn.trigger('click')
    
    expect(store.clear).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'Home' })
  })
})

