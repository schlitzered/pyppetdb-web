import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { ref } from 'vue'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import api from '@/api/client'
import JobsNodesJobsForm from '../JobsNodesJobsForm.vue'

const mockRoute = reactive({
  params: {
    node_job_id: 'node-job-123'
  },
  hash: ''
})

const mockRouter = {
  replace: vi.fn()
}

vi.mock(
  'vue-router',
  () => {
    return {
      useRoute: () => mockRoute,
      useRouter: () => mockRouter
    }
  }
)

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockIsConnected = ref(false)

vi.mock(
  '@/composables/useLogStream',
  () => {
    return {
      useLogStream: () => {
        return {
          connect: mockConnect,
          disconnect: mockDisconnect,
          isConnected: mockIsConnected
        }
      }
    }
  }
)

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
  Card: 'div',
  Tag: true,
  Button: true,
  InputText: true,
  ProgressSpinner: true
}

describe(
  'JobsNodesJobsForm',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(() => {})

        window.HTMLElement.prototype.scrollIntoView = vi.fn()
        Object.defineProperty(
          window.HTMLElement.prototype,
          'scrollHeight',
          {
            configurable: true,
            get() {
              return 100
            }
          }
        )
        Object.defineProperty(
          window.HTMLElement.prototype,
          'clientHeight',
          {
            configurable: true,
            get() {
              return 10
            }
          }
        )
        Object.defineProperty(
          window.HTMLElement.prototype,
          'scrollTop',
          {
            configurable: true,
            get() {
              return this._scrollTop || 0
            },
            set(val) {
              this._scrollTop = val
            }
          }
        )
        vi.spyOn(
          document,
          'getElementById'
        ).mockImplementation(
          (id) => {
            if (id && typeof id === 'string' && id.startsWith('L')) {
              return {
                scrollIntoView: vi.fn()
              }
            }
            return null
          }
        )

        mockRoute.params.node_job_id = 'node-job-123'
        mockRoute.hash = ''
        mockIsConnected.value = false

        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'running',
                log_blobs: ['blob-1', 'blob-2']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [
                  { line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'log line 1' },
                  { line_nr: 2, timestamp: '2026-06-26T12:00:01Z', msg: 'log line 2' }
                ]
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-2') {
              return Promise.resolve({
                data: [
                  { line_nr: 3, timestamp: '2026-06-26T12:00:02Z', msg: 'log line 3' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )
      }
    )

    it(
      'mounts in live mode for running job and connects to stream',
      async () => {
        mount(
          JobsNodesJobsForm,
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
        ).toHaveBeenCalledWith('/api/v1/jobs/nodes_jobs/node-job-123')
        expect(
          mockConnect
        ).toHaveBeenCalledWith(
          'job-1:node-1',
          expect.any(Function),
          expect.any(Function)
        )
      }
    )

    it(
      'mounts in static mode for finished job and loads first blob',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1', 'blob-2']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [
                  { line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'log line 1' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsNodesJobsForm,
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
          mockDisconnect
        ).toHaveBeenCalledWith('job-1:node-1')
        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/jobs/nodes_jobs_logs/blob-1')
        expect(
          wrapper.vm.allLines.length
        ).toBe(1)
      }
    )

    it(
      'handles fetchNodeJob error gracefully',
      async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Fetch error'))

        mount(
          JobsNodesJobsForm,
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
          console.error
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles stream log messages in different formats',
      async () => {
        const wrapper = mount(
          JobsNodesJobsForm,
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

        const handler = mockConnect.mock.calls[0][1]

        handler([
          { line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'first line' }
        ])
        expect(
          wrapper.vm.allLines.length
        ).toBe(1)

        handler(
          JSON.stringify([
            { line_nr: 2, timestamp: '2026-06-26T12:00:01Z', msg: 'second line' }
          ])
        )
        expect(
          wrapper.vm.allLines.length
        ).toBe(2)

        handler(
          JSON.stringify({
            line_nr: 3,
            timestamp: '2026-06-26T12:00:02Z',
            msg: 'third line'
          })
        )
        expect(
          wrapper.vm.allLines.length
        ).toBe(3)

        handler('fourth raw line')
        expect(
          wrapper.vm.allLines.length
        ).toBe(4)
      }
    )

    it(
      'handles finish log message from stream',
      async () => {
        const wrapper = mount(
          JobsNodesJobsForm,
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

        const finishHandler = mockConnect.mock.calls[0][2]

        vi.mocked(api.get).mockResolvedValueOnce({
          id: 'node-job-123',
          job_id: 'job-1',
          node_id: 'node-1',
          status: 'success',
          log_blobs: ['blob-1']
        })

        await finishHandler({
          status: 'success'
        })
        await flushPromises()

        expect(
          wrapper.vm.formData.status
        ).toBe('success')
      }
    )

    it(
      'handles line click range selection and hash updates',
      async () => {
        mockRoute.params.node_job_id = 'node-job-123'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [
                  { line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'line 1' },
                  { line_nr: 2, timestamp: '2026-06-26T12:00:01Z', msg: 'line 2' },
                  { line_nr: 3, timestamp: '2026-06-26T12:00:02Z', msg: 'line 3' }
                ]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsNodesJobsForm,
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

        wrapper.vm.onLineClick(
          1,
          { shiftKey: false }
        )
        expect(
          mockRouter.replace
        ).toHaveBeenCalledWith({
          hash: '#L1'
        })

        wrapper.vm.onLineClick(
          3,
          { shiftKey: true }
        )
        expect(
          mockRouter.replace
        ).toHaveBeenCalledWith({
          hash: '#L1-L3'
        })

        expect(
          wrapper.vm.isSelected(2)
        ).toBe(true)

        wrapper.vm.onLineClick(
          1,
          { shiftKey: false }
        )
        wrapper.vm.onLineClick(
          1,
          { shiftKey: false }
        )
        expect(
          wrapper.vm.selectedRange.start
        ).toBeNull()
      }
    )

    it(
      'handles manualTriggerLoad',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [{ line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'line 1' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsNodesJobsForm,
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

        wrapper.vm.nextBlobIndex = 0
        await wrapper.vm.manualTriggerLoad()

        expect(
          api.get
        ).toHaveBeenCalledWith('/api/v1/jobs/nodes_jobs_logs/blob-1')
      }
    )

    it(
      'loads blobs until hash line on mount',
      async () => {
        mockRoute.hash = '#L3'
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [{ line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'line 1' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        mount(
          JobsNodesJobsForm,
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
        ).toHaveBeenCalledWith('/api/v1/jobs/nodes_jobs_logs/blob-1')
      }
    )

    it(
      'watches route hash and parses selection',
      async () => {
        const wrapper = mount(
          JobsNodesJobsForm,
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

        mockRoute.hash = '#L5-L10'
        await flushPromises()

        expect(
          wrapper.vm.selectedRange.start
        ).toBe(5)
        expect(
          wrapper.vm.selectedRange.end
        ).toBe(10)
      }
    )

    it(
      'handles scrolling and loads more blobs',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1', 'blob-2']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [{ line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'line 1' }]
              })
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsNodesJobsForm,
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

        const scrollEvent = {
          target: {
            scrollHeight: 100,
            scrollTop: 90,
            clientHeight: 10
          }
        }
        wrapper.vm.handleScroll(scrollEvent)
        expect(
          wrapper.vm.userScrolledUp
        ).toBe(false)

        const scrollUpEvent = {
          target: {
            scrollHeight: 100,
            scrollTop: 10,
            clientHeight: 10
          }
        }
        wrapper.vm.handleScroll(scrollUpEvent)
        expect(
          wrapper.vm.userScrolledUp
        ).toBe(true)
      }
    )

    it(
      'filters log lines based on searchQuery',
      async () => {
        const wrapper = mount(
          JobsNodesJobsForm,
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

        wrapper.vm.logsMap.set(
          'L1',
          { line_nr: 1, msg: 'Error occurred' }
        )
        wrapper.vm.logsMap.set(
          'L2',
          { line_nr: 2, msg: 'Info trace' }
        )

        wrapper.vm.searchQuery = 'error'
        expect(
          wrapper.vm.filteredLines.length
        ).toBe(1)
        expect(
          wrapper.vm.filteredLines[0].msg
        ).toBe('Error occurred')
      }
    )

    it(
      'returns correct severity for status',
      async () => {
        const wrapper = mount(
          JobsNodesJobsForm,
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
          wrapper.vm.getStatusSeverity('success')
        ).toBe('success')
        expect(
          wrapper.vm.getStatusSeverity('failed')
        ).toBe('danger')
        expect(
          wrapper.vm.getStatusSeverity('running')
        ).toBe('info')
        expect(
          wrapper.vm.getStatusSeverity('unknown')
        ).toBe('secondary')
      }
    )

    it(
      'handles edge cases for loadNextBlob and checkScrollAndLoadMore',
      async () => {
        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1', 'blob-2']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.reject(new Error('Load blob failure'))
            }
            return Promise.resolve({ result: [] })
          }
        )

        const wrapper = mount(
          JobsNodesJobsForm,
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

        await wrapper.vm.loadNextBlob()
        expect(
          console.error
        ).toHaveBeenCalledWith(
          'Failed to load next blob',
          expect.any(Error)
        )

        vi.mocked(api.get).mockImplementation(
          (url) => {
            if (url === '/api/v1/jobs/nodes_jobs/node-job-123') {
              return Promise.resolve({
                id: 'node-job-123',
                job_id: 'job-1',
                node_id: 'node-1',
                status: 'success',
                log_blobs: ['blob-1', 'blob-2']
              })
            }
            if (url === '/api/v1/jobs/nodes_jobs_logs/blob-1') {
              return Promise.resolve({
                data: [{ line_nr: 1, timestamp: '2026-06-26T12:00:00Z', msg: 'line 1' }]
              })
            }
            return Promise.resolve({ data: [] })
          }
        )

        const wrapper2 = mount(
          JobsNodesJobsForm,
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

        mockIsConnected.value = true
        await wrapper2.vm.loadNextBlob()

        mockIsConnected.value = false
        wrapper2.vm.nextBlobIndex = 2
        await wrapper2.vm.loadNextBlob()

        wrapper2.vm.nextBlobIndex = 0
        wrapper2.vm.logScrollRef = {
          scrollHeight: 100,
          scrollTop: 90,
          clientHeight: 10
        }
        await wrapper2.vm.loadNextBlob()
      }
    )
  }
)
