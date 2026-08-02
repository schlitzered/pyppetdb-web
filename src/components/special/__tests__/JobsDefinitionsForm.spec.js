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
  JobParamsEditor: {
    props: ['rows', 'disabled'],
    template: '<div class="job-params-editor" />'
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
    expect(api.get).not.toHaveBeenCalled()
  })

  it('loads and maps existing typed definition data in edit mode', async () => {
    mockRoute.params.definition_id = 'deploy'
    vi.mocked(api.get).mockResolvedValue({
      id: 'deploy',
      executable: '/usr/bin/deploy',
      user: 'root',
      group: 'wheel',
      params_template: ['--env', '{{env}}'],
      params: {
        retries: { type: 'int', min: 1, max: 5 },
        env: { type: 'enum', options: ['prod', 'dev'] }
      },
      environment_variables: {
        NAME: { type: 'string', regex: '^[a-z]+$' }
      }
    })

    const wrapper = mountForm()
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/jobs/definitions/deploy')
    expect(wrapper.vm.paramsTemplate).toEqual([
      { value: '--env' },
      { value: '{{env}}' }
    ])
    expect(wrapper.vm.paramsRows).toEqual([
      { key: 'retries', type: 'int', regex: '', min: 1, max: 5, options: [] },
      {
        key: 'env',
        type: 'enum',
        regex: '',
        min: null,
        max: null,
        options: ['prod', 'dev']
      }
    ])
    expect(wrapper.vm.envRows).toEqual([
      {
        key: 'NAME',
        type: 'string',
        regex: '^[a-z]+$',
        min: null,
        max: null,
        options: []
      }
    ])
  })

  it('serializes each param type with only its relevant validators', async () => {
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formData.id = 'deploy'
    wrapper.vm.formData.executable = '/usr/bin/deploy'
    wrapper.vm.formData.user = 'root'
    wrapper.vm.formData.group = 'wheel'
    wrapper.vm.paramsTemplate.push({ value: '--env' })
    wrapper.vm.paramsTemplate.push({ value: '   ' })
    wrapper.vm.paramsRows.push({
      key: 'name',
      type: 'string',
      regex: '^x$',
      min: 5,
      max: 9,
      options: ['ignored']
    })
    wrapper.vm.paramsRows.push({
      key: 'count',
      type: 'int',
      regex: 'ignored',
      min: 1,
      max: 10,
      options: []
    })
    wrapper.vm.paramsRows.push({
      key: 'ratio',
      type: 'float',
      regex: '',
      min: 0.5,
      max: null,
      options: []
    })
    wrapper.vm.paramsRows.push({
      key: 'flag',
      type: 'bool',
      regex: 'ignored',
      min: 1,
      max: 2,
      options: ['ignored']
    })
    wrapper.vm.envRows.push({
      key: 'MODE',
      type: 'enum',
      regex: '',
      min: null,
      max: null,
      options: ['a', '', ' b ']
    })
    wrapper.vm.envRows.push({
      key: '',
      type: 'string',
      regex: 'dropped',
      min: null,
      max: null,
      options: []
    })
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/api/v1/jobs/definitions', {
      id: 'deploy',
      executable: '/usr/bin/deploy',
      user: 'root',
      group: 'wheel',
      params_template: ['--env'],
      params: {
        name: { type: 'string', regex: '^x$' },
        count: { type: 'int', min: 1, max: 10 },
        ratio: { type: 'float', min: 0.5 },
        flag: { type: 'bool' }
      },
      environment_variables: {
        MODE: { type: 'enum', options: ['a', 'b'] }
      }
    })
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'JobsDefinitionsSearch'
    })
  })

  it('blocks submit when required top-level fields are missing', async () => {
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formData.id = 'deploy'
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).not.toHaveBeenCalled()
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    )
  })

  it('blocks submit when an enum param has no options', async () => {
    const wrapper = mountForm()
    await flushPromises()

    wrapper.vm.formData.id = 'deploy'
    wrapper.vm.formData.executable = '/usr/bin/deploy'
    wrapper.vm.formData.user = 'root'
    wrapper.vm.formData.group = 'wheel'
    wrapper.vm.paramsRows.push({
      key: 'mode',
      type: 'enum',
      regex: '',
      min: null,
      max: null,
      options: ['  ']
    })
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.post).not.toHaveBeenCalled()
    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        detail: expect.stringContaining('enum')
      })
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
