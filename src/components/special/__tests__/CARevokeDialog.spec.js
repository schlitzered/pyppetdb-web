import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from 'primevue/select'
import CARevokeDialog from '../CARevokeDialog.vue'
import { CERT_REVOCATION_REASONS } from '@/constants/ca'
import { AUTHORITY_REVOCATION_REASONS } from '@/constants/ca'

const DialogStub = {
  name: 'Dialog',
  props: ['visible', 'header'],
  template:
    '<div v-if="visible" class="dialog-stub"><h2>{{ header }}</h2><slot /><slot name="footer" /></div>'
}

const mountDialog = (props = {}) => {
  return mount(CARevokeDialog, {
    props: { visible: false, ...props },
    global: { stubs: { Dialog: DialogStub } }
  })
}

const open = async (wrapper) => {
  await wrapper.setProps({ visible: true })
}

describe('CARevokeDialog', () => {
  it('defaults to cert reasons and resets to unspecified on open', async () => {
    const wrapper = mountDialog({ header: 'Revoke Certificate' })
    await open(wrapper)
    expect(wrapper.text()).toContain('Revoke Certificate')
    const select = wrapper.findComponent(Select)
    expect(select.props('options')).toEqual(CERT_REVOCATION_REASONS)
    expect(
      select.props('options').some((o) => o.value === 'ca_compromise')
    ).toBe(false)
    expect(wrapper.vm.reason).toBe('unspecified')
  })

  it('emits a payload without invalidity_date when none is set', async () => {
    const wrapper = mountDialog()
    await open(wrapper)
    wrapper.vm.reason = 'cessation_of_operation'
    await wrapper.vm.$nextTick()
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Revoke'))
      .trigger('click')
    expect(wrapper.emitted('confirm')[0][0]).toEqual({
      status: 'revoked',
      revocation_reason: 'cessation_of_operation'
    })
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })

  it('sends invalidity_date as an ISO string with timezone', async () => {
    const wrapper = mountDialog()
    await open(wrapper)
    wrapper.vm.invalidityDate = new Date('2026-01-02T03:04:05Z')
    await wrapper.vm.$nextTick()
    wrapper.vm.submit()
    expect(wrapper.emitted('confirm')[0][0]).toEqual({
      status: 'revoked',
      revocation_reason: 'unspecified',
      invalidity_date: '2026-01-02T03:04:05.000Z'
    })
  })

  it('blocks invalidity dates in the future', async () => {
    const wrapper = mountDialog()
    await open(wrapper)
    wrapper.vm.invalidityDate = new Date(Date.now() + 86400000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('must not be in the future')
    const revokeBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Revoke'))
    expect(revokeBtn.attributes('disabled')).toBeDefined()
  })

  it('warns about key compromise', async () => {
    const wrapper = mountDialog()
    await open(wrapper)
    expect(wrapper.find('[data-test="compromise-warning"]').exists()).toBe(
      false
    )
    wrapper.vm.reason = 'key_compromise'
    await wrapper.vm.$nextTick()
    const warning = wrapper.find('[data-test="compromise-warning"]')
    expect(warning.exists()).toBe(true)
    expect(warning.text()).toContain('every')
    expect(warning.text()).toContain('all')
  })

  it('warns about ca compromise with authority reasons', async () => {
    const wrapper = mountDialog({ reasons: AUTHORITY_REVOCATION_REASONS })
    await open(wrapper)
    const select = wrapper.findComponent(Select)
    expect(
      select.props('options').some((o) => o.value === 'ca_compromise')
    ).toBe(true)
    wrapper.vm.reason = 'ca_compromise'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="compromise-warning"]').exists()).toBe(
      true
    )
  })

  it('cancel closes without emitting confirm', async () => {
    const wrapper = mountDialog()
    await open(wrapper)
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Cancel'))
      .trigger('click')
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:visible')[0]).toEqual([false])
  })
})
