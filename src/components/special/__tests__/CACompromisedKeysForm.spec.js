import { reactive } from 'vue'
import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import api from '@/api/client'
import { caCompromisedKeys } from '@/resources/ca'
import CACompromisedKeysForm from '../CACompromisedKeysForm.vue'

const mockRouter = { push: vi.fn() }
const mockRoute = reactive({ params: { key_id: '_new' } })
const mockConfirm = { require: vi.fn() }
const mockToast = { add: vi.fn() }

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))
vi.mock('primevue/useconfirm', () => ({ useConfirm: () => mockConfirm }))
vi.mock('primevue/usetoast', () => ({ useToast: () => mockToast }))
vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
}))

const mountForm = () =>
  mount(CACompromisedKeysForm, {
    props: { resourceDef: caCompromisedKeys },
    global: { stubs: { ResponsiveToolbar: true } }
  })

describe('CACompromisedKeysForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params.key_id = '_new'
  })

  it('posts only the chosen pem source and the note after confirmation', async () => {
    api.post.mockResolvedValue({ id: 'abc' })
    const wrapper = mountForm()
    wrapper.vm.sourceKind = 'csr'
    wrapper.vm.pem = '-----BEGIN CERTIFICATE REQUEST-----'
    wrapper.vm.note = 'leaked'
    wrapper.vm.formSubmit()

    expect(api.post).not.toHaveBeenCalled()
    expect(mockConfirm.require).toHaveBeenCalledOnce()
    await mockConfirm.require.mock.calls[0][0].accept()

    expect(api.post).toHaveBeenCalledWith('/api/v1/ca/compromised_keys', {
      csr: '-----BEGIN CERTIFICATE REQUEST-----',
      note: 'leaked'
    })
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'CACompromisedKeysCRUD',
      params: { key_id: 'abc' }
    })
  })

  it('omits an empty note', async () => {
    api.post.mockResolvedValue({ id: 'abc' })
    const wrapper = mountForm()
    wrapper.vm.pem = 'PEM'
    wrapper.vm.formSubmit()
    await mockConfirm.require.mock.calls[0][0].accept()
    expect(api.post).toHaveBeenCalledWith('/api/v1/ca/compromised_keys', {
      certificate: 'PEM'
    })
  })

  it('loads and shows an existing key including its source', async () => {
    mockRoute.params.key_id = 'k1'
    api.get.mockResolvedValue({
      id: 'k1',
      key_type: 'rsa',
      reason: 'key_compromise',
      source: { kind: 'certificate', cn: 'node.example.com' }
    })
    const wrapper = mountForm()
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/ca/compromised_keys/k1')
    expect(wrapper.text()).toContain('node.example.com')
    expect(wrapper.text()).toContain('key_compromise')
  })

  it('formats the source column and forbids edit and delete', () => {
    const source = caCompromisedKeys.tableColumns.find(
      (c) => c.key === 'source'
    )
    expect(source.formatter({ kind: 'manual' })).toBe('manual')
    expect(source.formatter({ kind: 'certificate', cn: 'a' })).toBe(
      'certificate: a'
    )
    expect(caCompromisedKeys.permissions.edit()).toBe(false)
    expect(caCompromisedKeys.permissions.delete()).toBe(false)
  })
})
