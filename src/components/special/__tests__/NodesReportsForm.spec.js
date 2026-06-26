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
import NodesReportsForm from '../NodesReportsForm.vue'

const mockRoute = reactive({
  params: {
    node: 'node-1',
    report: 'report-1'
  }
})

vi.mock(
  'vue-router',
  () => {
    return {
      useRoute: () => mockRoute
    }
  }
)

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        get: vi.fn()
      }
    }
  }
)

const customStubs = {
  Card: {
    template: '<div><slot name="content" /><slot /></div>'
  },
  ProgressSpinner: true,
  Tag: true,
  Accordion: 'div',
  AccordionPanel: 'div',
  AccordionHeader: 'div',
  AccordionContent: 'div',
  InputText: 'input',
  DataTable: {
    template: '<div><slot name="top" /><slot /></div>'
  },
  Column: {
    template: '<div><slot name="body" :data="slotData"></slot></div>',
    props: ['field'],
    data() {
      return {
        slotData: {
          value: 123,
          time: '2026-06-26T12:00:00Z',
          level: 'info',
          skipped: false,
          corrective_change: true,
          events: []
        }
      }
    }
  }
}

describe(
  'NodesReportsForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockRoute.params.node = 'node-1'
        mockRoute.params.report = 'report-1'

        vi.mocked(api.get).mockResolvedValue({
          report: {
            status: 'changed',
            noop: false,
            noop_pending: true,
            corrective_change: false,
            metrics: [
              { category: 'time', name: 'config_retrieval', value: 1.25 }
            ],
            logs: [
              { time: '2026-06-26T12:00:00Z', level: 'info', message: 'Applied config', source: 'Puppet' }
            ],
            resources: [
              { resource_type: 'File', resource_title: '/tmp/test', skipped: false, corrective_change: true, events: [] }
            ]
          }
        })
      }
    )

    it(
      'mounts and fetches report data successfully',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/nodes/node-1/reports/report-1')
        expect(
          wrapper.vm.reportData.status
        ).toBe('changed')
      }
    )

    it(
      'handles fetch report API error gracefully',
      async () => {
        const spyError = vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Fetch report error'))

        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.reportData
        ).toBeNull()
        expect(
          spyError
        ).toHaveBeenCalled()
      }
    )

    it(
      'returns correct severity for status',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.getStatusSeverity('changed')
        ).toBe('success')
        expect(
          wrapper.vm.getStatusSeverity('unchanged')
        ).toBe('secondary')
        expect(
          wrapper.vm.getStatusSeverity('failed')
        ).toBe('danger')
        expect(
          wrapper.vm.getStatusSeverity('unknown')
        ).toBe('info')
      }
    )

    it(
      'returns correct severity for log level',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.getLogLevelSeverity('info')
        ).toBe('info')
        expect(
          wrapper.vm.getLogLevelSeverity('notice')
        ).toBe('info')
        expect(
          wrapper.vm.getLogLevelSeverity('warning')
        ).toBe('warn')
        expect(
          wrapper.vm.getLogLevelSeverity('err')
        ).toBe('danger')
        expect(
          wrapper.vm.getLogLevelSeverity('critical')
        ).toBe('secondary')
      }
    )

    it(
      'formats values correctly',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.formatValue(null)
        ).toBe('null')
        expect(
          wrapper.vm.formatValue(undefined)
        ).toBe('undefined')
        expect(
          wrapper.vm.formatValue({ x: 1 })
        ).toBe('{"x":1}')
        expect(
          wrapper.vm.formatValue('text')
        ).toBe('text')
      }
    )

    it(
      'formats events correctly',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        expect(
          wrapper.vm.formatEvents(null)
        ).toBe('No events')
        expect(
          wrapper.vm.formatEvents([])
        ).toBe('No events')
        expect(
          wrapper.vm.formatEvents([{ name: 'test' }])
        ).toContain('test')
      }
    )

    it(
      'filters metrics, logs and resources based on search queries',
      async () => {
        const wrapper = mount(
          NodesReportsForm,
          {
            props: {
              resourceDef: createMockResourceDef()
            },
            global: {
              stubs: customStubs
            }
          }
        )
        await flushPromises()

        wrapper.vm.reportData.metrics = [
          { category: 'time', name: 'config', value: 1.5 },
          { category: 'resources', name: 'total', value: 10 }
        ]
        wrapper.vm.reportData.logs = [
          { level: 'info', message: 'Success', source: 'Agent' },
          { level: 'warn', message: 'Alert', source: 'Server' }
        ]
        wrapper.vm.reportData.resources = [
          { resource_type: 'File', resource_title: 'test' },
          { resource_type: 'Service', resource_title: 'nginx' }
        ]

        wrapper.vm.searchMetrics = 'config'
        expect(
          wrapper.vm.filteredMetrics.length
        ).toBe(1)
        wrapper.vm.searchMetrics = '10'
        expect(
          wrapper.vm.filteredMetrics.length
        ).toBe(1)

        wrapper.vm.searchLogs = 'agent'
        expect(
          wrapper.vm.filteredLogs.length
        ).toBe(1)

        wrapper.vm.searchResources = 'file'
        expect(
          wrapper.vm.filteredResources.length
        ).toBe(1)
      }
    )
  }
)
