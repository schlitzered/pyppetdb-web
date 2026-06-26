import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import api from '@/api/client'
import HieraLookupForm from '../HieraLookupForm.vue'

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
      }
    }
  }
)

const customStubs = {
  AutoComplete: {
    name: 'AutoComplete',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
    props: ['modelValue'],
    emits: ['update:modelValue']
  },
  ToggleSwitch: {
    name: 'ToggleSwitch',
    template: '<input type="checkbox" :value="modelValue" @change="$emit(\'update:modelValue\', !modelValue)">',
    props: ['modelValue'],
    emits: ['update:modelValue']
  }
}

describe(
  'HieraLookupForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})

        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: []
              })
            }
            if (url === '/api/v1/hiera/keys') {
              return Promise.resolve({
                result: []
              })
            }
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: []
              })
            }
            if (url.startsWith('/api/v1/hiera/lookup/')) {
              return Promise.resolve({})
            }
            return Promise.resolve({ result: [] })
          }
        )
      }
    )

    it(
      'fetches fact fields and keys on mount and handles fact levels',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: [
                  { id: '{environment}' },
                  { id: '{osfamily}' },
                  { id: 'static_level' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/hiera/levels',
          {
            limit: 1000
          }
        )
        expect(
          wrapper.vm.factFields
        ).toEqual(['environment', 'osfamily'])
        expect(
          wrapper.vm.facts
        ).toEqual({
          environment: '',
          osfamily: ''
        })
      }
    )

    it(
      'handles fetchFactFields error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.reject(new Error('Levels error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'searches hiera keys on AutoComplete searchKeys',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/keys') {
              return Promise.resolve({
                result: [
                  { id: 'key1' },
                  { id: 'key2' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchKeys({
          query: 'test-key'
        })

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/hiera/keys',
          {
            limit: 10,
            sort: 'id',
            sort_order: 'ascending',
            key_id: 'test-key'
          }
        )
        expect(
          wrapper.vm.availableKeys
        ).toEqual(['key1', 'key2'])
      }
    )

    it(
      'searches hiera keys on AutoComplete searchKeys with empty query',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/keys') {
              return Promise.resolve({
                result: [
                  { id: 'key1' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchKeys({
          query: ''
        })

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/hiera/keys',
          {
            limit: 10,
            sort: 'id',
            sort_order: 'ascending'
          }
        )
      }
    )

    it(
      'handles searchKeys error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/keys') {
              return Promise.reject(new Error('Keys error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchKeys({
          query: 'abc'
        })
        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'searches fact suggestions with searchFactSuggestions',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: [
                  { value: 'RedHat' },
                  { value: 'Debian' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchFactSuggestions(
          {
            query: 'red'
          },
          'osfamily'
        )

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/nodes/_distinct_fact_values',
          {
            fact_id: 'osfamily',
            limit: 10,
            sort_by: 'value',
            sort_order: 'ascending'
          },
          true
        )
        expect(
          wrapper.vm.factSuggestions.osfamily
        ).toEqual(['RedHat', 'red'])
      }
    )

    it(
      'searches fact suggestions with empty query and exact match query',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: [{ id: '{osfamily}' }]
              })
            }
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.resolve({
                result: [
                  { value: 'RedHat' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchFactSuggestions(
          {
            query: ''
          },
          'osfamily'
        )
        expect(
          wrapper.vm.factSuggestions.osfamily
        ).toEqual(['RedHat'])

        await wrapper.vm.searchFactSuggestions(
          {
            query: 'RedHat'
          },
          'osfamily'
        )
        expect(
          wrapper.vm.factSuggestions.osfamily
        ).toEqual(['RedHat'])
      }
    )

    it(
      'handles searchFactSuggestions error gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/nodes/_distinct_fact_values') {
              return Promise.reject(new Error('Suggestions error'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.searchFactSuggestions(
          {
            query: 'abc'
          },
          'osfamily'
        )
        expect(
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'performs lookup successfully with facts and merge enabled',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: [{ id: '{environment}' }]
              })
            }
            if (url === '/api/v1/hiera/lookup/my-key') {
              return Promise.resolve({
                data: {
                  value: 'some-value'
                }
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.lookupKeyId = 'my-key'
        wrapper.vm.lookupMerge = true
        wrapper.vm.facts.environment = 'production'

        await wrapper.vm.performLookup()

        expect(
          api.get
        ).toHaveBeenCalledWith(
          '/api/v1/hiera/lookup/my-key',
          {
            merge: true,
            fact: ['environment:production']
          }
        )
        expect(
          wrapper.vm.lookupResult
        ).toEqual({
          data: {
            value: 'some-value'
          }
        })
        expect(
          wrapper.vm.formattedResult
        ).toBe(
          JSON.stringify(
            {
              value: 'some-value'
            },
            null,
            2
          )
        )
      }
    )

    it(
      'handles performLookup failure gracefully',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: []
              })
            }
            if (url === '/api/v1/hiera/lookup/my-key') {
              return Promise.reject(new Error('Lookup failed'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.lookupKeyId = 'my-key'
        await wrapper.vm.performLookup()

        expect(
          wrapper.vm.lookupError
        ).toBe('Lookup failed')
        expect(
          wrapper.vm.lookupResult
        ).toBeNull()
      }
    )

    it(
      'does not perform lookup if lookupKeyId is empty',
      async () => {
        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        await wrapper.vm.performLookup()

        expect(
          api.get
        ).not.toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/hiera/lookup/')
        )
      }
    )

    it(
      'triggers template event handlers for full coverage',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/hiera/levels') {
              return Promise.resolve({
                result: [{ id: '{environment}' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )
        const wrapper = mount(
          HieraLookupForm,
          {
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        const autocompleteKey = wrapper.findComponent('#lookupKeyId')
        await autocompleteKey.vm.$emit(
          'update:modelValue',
          'my-key'
        )

        const toggleMerge = wrapper.findComponent('#lookupMerge')
        await toggleMerge.vm.$emit(
          'update:modelValue',
          true
        )

        const autocompleteFact = wrapper.findComponent('#environment')
        await autocompleteFact.vm.$emit(
          'update:modelValue',
          'production'
        )

        expect(
          wrapper.vm.lookupKeyId
        ).toBe('my-key')
        expect(
          wrapper.vm.lookupMerge
        ).toBe(true)
        expect(
          wrapper.vm.facts.environment
        ).toBe('production')
      }
    )
  }
)
