import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { h } from 'vue'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import AutoComplete from 'primevue/autocomplete'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import CAValidationConfig from '../CAValidationConfig.vue'

vi.mock('@/api/client', () => {
  return {
    default: {
      get: vi.fn(() => {
        return Promise.resolve({
          result: [],
          meta: {},
          nodes: [],
          filters: []
        })
      }),
      request: vi.fn(),
      delete: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    }
  }
})

vi.mock('@/stores/auth', () => {
  return {
    authStore: () => {
      return {
        getUserDataIsAdmin: true,
        isLoaded: false,
        hasPermission: () => {
          return true
        },
        hasPermissionPattern: () => {
          return true
        },
        getPermissionMatches: () => {
          return []
        },
        resetTimestamp: vi.fn(),
        resetUserData: vi.fn(),
        resetIsLoaded: vi.fn(),
        reset: vi.fn(),
        fetchUserData: vi.fn(),
        setUserData: vi.fn()
      }
    }
  }
})

vi.mock('@/stores/apiError', () => {
  return {
    apiErrorStore: () => {
      return {
        setRedirect: vi.fn()
      }
    }
  }
})

describe('CAValidationConfig', () => {
  it('mounts successfully with default validation config', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: ['digital_signature'],
      extended_key_usages: ['SERVER_AUTH'],
      san_validation: null,
      san_injection: null
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('handles null modelValue by setting default config', async () => {
    const WrapperComponent = {
      props: ['resourceDef'],
      setup(props) {
        const val = ref(null)
        return () => {
          return h(CAValidationConfig, {
            resourceDef: props.resourceDef,
            modelValue: val.value,
            'onUpdate:modelValue': (newVal) => {
              val.value = newVal
            }
          })
        }
      }
    }
    const wrapper = mount(WrapperComponent, {
      props: {
        resourceDef: createMockResourceDef()
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()
    const child = wrapper.findComponent(CAValidationConfig)
    expect(child.vm.model).not.toBeNull()
    expect(child.vm.model.enforce_rfc1123).toBe(true)
  })

  it('toggles san validation and injection', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: [],
      extended_key_usages: [],
      san_validation: null,
      san_injection: null
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    wrapper.vm.hasSanValidation = true
    await flushPromises()
    expect(model.value.san_validation).not.toBeNull()
    expect(model.value.san_validation.max_san_count).toBe(10)

    wrapper.vm.hasSanValidation = false
    await flushPromises()
    expect(model.value.san_validation).toBeNull()

    wrapper.vm.hasSanInjection = true
    await flushPromises()
    expect(model.value.san_injection).toEqual([])

    wrapper.vm.hasSanInjection = false
    await flushPromises()
    expect(model.value.san_injection).toBeNull()
  })

  it('manages key usage options list selections', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: ['digital_signature'],
      extended_key_usages: ['SERVER_AUTH'],
      san_validation: null,
      san_injection: null
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    wrapper.vm.toggleKeyUsage('key_encipherment')
    expect(model.value.key_usages).toContain('key_encipherment')

    wrapper.vm.toggleKeyUsage('key_encipherment')
    expect(model.value.key_usages).not.toContain('key_encipherment')

    wrapper.vm.toggleExtendedKeyUsage('CLIENT_AUTH')
    expect(model.value.extended_key_usages).toContain('CLIENT_AUTH')

    wrapper.vm.toggleExtendedKeyUsage('CLIENT_AUTH')
    expect(model.value.extended_key_usages).not.toContain('CLIENT_AUTH')
  })

  it('manages HTTP and script checks configurations', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: [],
      extended_key_usages: [],
      san_validation: {
        max_san_count: 10,
        regex_list: [],
        http_checks: [],
        script_checks: []
      },
      san_injection: null
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    wrapper.vm.addHttpCheck()
    expect(model.value.san_validation.http_checks.length).toBe(1)

    wrapper.vm.addHeader(0)
    expect(model.value.san_validation.http_checks[0].headers.length).toBe(1)

    wrapper.vm.removeHeader(0, 0)
    expect(model.value.san_validation.http_checks[0].headers.length).toBe(0)

    wrapper.vm.removeHttpCheck(0)
    expect(model.value.san_validation.http_checks.length).toBe(0)

    wrapper.vm.addScriptCheck()
    expect(model.value.san_validation.script_checks.length).toBe(1)

    wrapper.vm.removeScriptCheck(0)
    expect(model.value.san_validation.script_checks.length).toBe(0)
  })

  it('manages hostnames and regex lists for simulator', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: [],
      extended_key_usages: [],
      san_validation: {
        max_san_count: 10,
        regex_list: ['^.*\\.example\\.com$'],
        http_checks: [],
        script_checks: []
      },
      san_injection: null
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    wrapper.vm.addRegex()
    expect(model.value.san_validation.regex_list.length).toBe(2)

    wrapper.vm.removeRegex(1)
    expect(model.value.san_validation.regex_list.length).toBe(1)

    wrapper.vm.addRegexHostname()
    expect(wrapper.vm.regexSimulatorHostnames.length).toBe(1)

    wrapper.vm.regexSimulatorHostnames[0] = 'test.example.com'
    expect(wrapper.vm.regexSimulation[0]).toEqual({
      matched: true,
      matches: [0]
    })

    wrapper.vm.regexSimulatorHostnames[0] = 'test.wrong.com'
    expect(wrapper.vm.regexSimulation[0].matched).toBe(false)

    wrapper.vm.removeRegexHostname(0)
    expect(wrapper.vm.regexSimulatorHostnames.length).toBe(0)
  })

  it('runs live CN injection simulations', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: [],
      key_usages: [],
      extended_key_usages: [],
      san_validation: null,
      san_injection: [
        {
          pattern: '^(?P<host>[^.]+)\\.(?P<domain>.+)$',
          templates: ['{host}-alt.{domain}', '{0}', '{missing}']
        }
      ]
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    wrapper.vm.simulatorCn = 'myhost.example.com'
    await flushPromises()

    const sims = wrapper.vm.injectionSimulations
    expect(sims[0].matched).toBe(true)
    expect(sims[0].results[0].resolved).toBe('myhost-alt.example.com')
    expect(sims[0].results[1].resolved).toBe('myhost.example.com')
    expect(sims[0].results[2].missingGroup).toBe(true)

    wrapper.vm.addInjectionEntry()
    expect(model.value.san_injection.length).toBe(2)

    wrapper.vm.addTemplate(1)
    expect(model.value.san_injection[1].templates.length).toBe(1)

    wrapper.vm.removeTemplate(1, 0)
    expect(model.value.san_injection[1].templates.length).toBe(0)

    wrapper.vm.removeInjectionEntry(1)
    expect(model.value.san_injection.length).toBe(1)
  })

  it('searches nodes list and handles onMounted actions', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      result: [
        {
          id: 'node-abc'
        }
      ]
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: {}
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()
    expect(api.get).toHaveBeenCalled()

    vi.mocked(api.get).mockResolvedValueOnce({
      result: [
        {
          id: 'node-xyz'
        }
      ]
    })
    await wrapper.vm.searchNodes({
      query: 'xyz'
    })
    expect(wrapper.vm.nodeSuggestions).toEqual(['node-xyz'])
  })

  it('watches model and normalizes internal values', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: null,
      key_usages: null,
      extended_key_usages: null,
      san_validation: {
        max_san_count: 10,
        regex_list: null,
        http_checks: [
          {
            headers: null
          }
        ],
        script_checks: null
      },
      san_injection: [
        {
          templates: null
        }
      ]
    })
    mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()
    expect(model.value.allowed_extensions).toEqual([])
    expect(model.value.key_usages).toEqual([])
    expect(model.value.extended_key_usages).toEqual([])
    expect(model.value.san_validation.regex_list).toEqual([])
    expect(model.value.san_validation.script_checks).toEqual([])
    expect(model.value.san_validation.http_checks[0].headers).toEqual([])
    expect(model.value.san_injection[0].templates).toEqual([])
  })

  it('triggers template event handlers for full coverage', async () => {
    const model = ref({
      enforce_rfc1123: true,
      allowed_extensions: ['ext1'],
      key_usages: ['digital_signature'],
      extended_key_usages: ['SERVER_AUTH'],
      san_validation: {
        max_san_count: 10,
        regex_list: ['^.*\\.example\\.com$'],
        http_checks: [
          {
            method: 'GET',
            url: 'http://example.com',
            headers: [
              {
                name: 'h1',
                value: 'v1',
                secret: false
              }
            ],
            basic_auth_enabled: true,
            username: 'user',
            password: 'pass',
            body_template: '{}',
            verify_ssl: true,
            timeout_seconds: 5,
            ca_cert: 'ca',
            client_cert: 'cert',
            client_key: 'key'
          }
        ],
        script_checks: [
          {
            script_path: '/path/to/script',
            timeout_seconds: 5
          }
        ]
      },
      san_injection: [
        {
          pattern: 'pattern',
          templates: ['template']
        }
      ]
    })
    const wrapper = mount(CAValidationConfig, {
      props: {
        resourceDef: createMockResourceDef(),
        modelValue: model.value,
        'onUpdate:modelValue': (val) => {
          model.value = val
        }
      },
      global: {
        stubs: primeVueStubs
      }
    })
    await flushPromises()

    const toggles = wrapper.findAllComponents(ToggleSwitch)
    for (const toggle of toggles) {
      toggle.vm.$emit('update:modelValue', true)
    }

    const autocompletes = wrapper.findAllComponents(AutoComplete)
    for (const ac of autocompletes) {
      ac.vm.$emit('update:modelValue', ['val'])
      ac.vm.$emit('complete', {
        query: 'val'
      })
    }

    const inputTexts = wrapper.findAllComponents(InputText)
    for (const it of inputTexts) {
      it.vm.$emit('update:modelValue', 'val')
    }

    const selects = wrapper.findAllComponents(Select)
    for (const sel of selects) {
      sel.vm.$emit('update:modelValue', 'POST')
    }

    const textareas = wrapper.findAllComponents(Textarea)
    for (const ta of textareas) {
      ta.vm.$emit('update:modelValue', 'val')
    }

    const buttons = wrapper.findAllComponents(Button)
    for (const btn of buttons) {
      await btn.trigger('click')
    }
  })
})
