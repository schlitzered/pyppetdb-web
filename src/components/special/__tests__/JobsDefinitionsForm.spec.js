import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import JobsDefinitionsForm from '../JobsDefinitionsForm.vue'

const mockRoute = reactive({
  params: {
    definition_id: '_new'
  }
})

const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => {
  return {
    useRoute: () => mockRoute,
    useRouter: () => mockRouter
  }
})

const mockToast = {
  add: vi.fn()
}

const mockConfirm = {
  require: vi.fn()
}

vi.mock('primevue/usetoast', () => {
  return {
    useToast: () => mockToast
  }
})

vi.mock('primevue/useconfirm', () => {
  return {
    useConfirm: () => mockConfirm
  }
})

vi.mock('@/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  }
})

vi.mock('@/stores/auth', () => {
  return {
    authStore: () => {
      return {
        hasPermission: () => true
      }
    }
  }
})

const customStubs = {
  ResponsiveToolbar: {
    template: '<div><slot name="left" /><slot name="right" /><slot /></div>'
  },
  Card: {
    template: '<div><slot name="content" /></div>'
  },
  Button: 'button',
  InputText: 'input',
  ToggleSwitch: 'div',
  KeyValueEditor: {
    props: ['rows', 'disabled'],
    template: '<div class="kv-editor" />'
  }
}

const mountForm = () => {
  return mount(JobsDefinitionsForm, {
    props: {
      resourceDef: createMockResourceDef()
    },
    global: {
      stubs: customStubs
    }
  })
}

describe('JobsDefinitionsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params.definition_id = '_new'
    vi.mocked(api.get).mockResolvedValue({})
    vi.mocked(api.post).mockResolvedValue({})
    vi.mocked(api.put).mockResolvedValue({})
    vi.mocked(api.delete).mockResolvedValue({})
  })

  it('mounts in new mode with an empty form', async () => {
    const wrapper = mountForm()
    await flushPromises()

    expect(wrapper.vm.isNew).toBe(true)
    expect(wrapper.vm.formData.id).toBe('')
    expect(wrapper.vm.paramsTemplate).toEqual([])
    expect(wrapper.vm.paramsRows).toEqual([])
    expect(wrapper.vm.envRows).toEqual([])
    // no GET in new mode
    expect(api.get).not.toHaveBeenCalled()
  })

  it('loads and maps existing definition data in edit mode', async () => {
    mockRoute.params.definition_id = 'deploy'
    vi.mocked(api.get).mockResolvedValue({
      id: 'deploy',
      executable: '/usr/bin/deploy',
      user: 'root',
      group: 'wheel',
      params_template: ['--env', '{{env}}'],
      params: { timeout: '30', retries: '3' },
      environment_variables: { PATH: '/usr/bin' }
    })

    const wrapper = mountForm()
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/jobs/definitions/deploy')
    expect(wrapper.vm.formData.executable).toBe('/usr/bin/deploy')
    expect(wrapper.vm.formData.user).toBe('root')
    expect(wrapper.vm.formData.group).toBe('wheel')
    expect(wrapper.vm.paramsTemplate).toEqual([
      { value: '--env' },
      { value: '{{env}}' }
    ])
    expect(wrapper.vm.paramsRows).toEqual([
      { key: 'timeout', value: '30' },
      { key: 'retries', value: '3' }
    ])
    expect(wrapper.vm.envRows).toEqual([{ key: 'PATH', value: '/usr/bin' }])
  })

  it('creates a definition with the full payload and drops blank rows', async () => {
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formData.id = 'deploy'
    wrapper.vm.formData.executable = '/usr/bin/deploy'
    wrapper.vm.formData.user = 'root'
    wrapper.vm.formData.group = 'wheel'
    wrapper.vm.paramsTemplate.push({ value: '--env' })
    wrapper.vm.paramsTemplate.push({ value: '   ' })
    wrapper.vm.paramsRows.push({ key: 'timeout', value: '30' })
    wrapper.vm.paramsRows.push({ key: '', value: 'ignored' })
    wrapper.vm.envRows.push({ key: 'PATH', value: '/usr/bin' })
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/api/v1/jobs/definitions', {
      id: 'deploy',
      executable: '/usr/bin/deploy',
      user: 'root',
      group: 'wheel',
      params_template: ['--env'],
      params: { timeout: '30' },
      environment_variables: { PATH: '/usr/bin' }
    })
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'JobsDefinitionsSearch'
    })
  })

  it('blocks submit and warns when required fields are missing', async () => {
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formData.id = 'deploy'
    // executable/user/group left empty
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).not.toHaveBeenCalled()
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    )
  })

  it('updates via PUT without the id in the payload', async () => {
    mockRoute.params.definition_id = 'deploy'
    vi.mocked(api.get).mockResolvedValue({
      id: 'deploy',
      executable: '/usr/bin/deploy',
      user: 'root',
      group: 'wheel',
      params_template: [],
      params: {},
      environment_variables: {}
    })
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.isModifyMode = true
    wrapper.vm.formData.executable = '/usr/bin/deploy2'
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.put).toHaveBeenCalledWith(
      '/api/v1/jobs/definitions/deploy',
      expect.objectContaining({ executable: '/usr/bin/deploy2' })
    )
    const payload = vi.mocked(api.put).mock.calls[0][1]
    expect(payload).not.toHaveProperty('id')
  })

  it('deletes after confirmation', async () => {
    mockRoute.params.definition_id = 'deploy'
    vi.mocked(api.get).mockResolvedValue({ id: 'deploy' })
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formDelete()
    expect(mockConfirm.require).toHaveBeenCalled()

    const accept = mockConfirm.require.mock.calls[0][0].accept
    await accept()
    await flushPromises()

    expect(api.delete).toHaveBeenCalledWith('/api/v1/jobs/definitions/deploy')
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'JobsDefinitionsSearch'
    })
  })
})
