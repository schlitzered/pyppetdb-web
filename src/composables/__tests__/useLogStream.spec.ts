import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { onUnmounted } from 'vue'
import { useLogStream } from '../useLogStream'
import api from '@/api/client'

vi.mock(
  '@/api/client',
  () => {
    return {
      default: {
        post: vi.fn()
      }
    }
  }
)

vi.mock(
  'vue',
  async () => {
    const original = await vi.importActual<typeof import('vue')>('vue')
    return {
      ...original,
      onUnmounted: vi.fn()
    }
  }
)

class MockWebSocket {
  url: string
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null
  readyState: number = 0
  sentMessages: string[] = []

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sentMessages.push(data)
  }

  close() {
    this.readyState = 3
    if (this.onclose) {
      this.onclose()
    }
  }

  triggerOpen() {
    this.readyState = 1
    if (this.onopen) {
      this.onopen()
    }
  }

  triggerMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({
        data: JSON.stringify(data)
      } as MessageEvent)
    }
  }

  triggerError() {
    if (this.onerror) {
      this.onerror()
    }
  }
}

(MockWebSocket as any).OPEN = 1;
(MockWebSocket as any).CLOSED = 3;

describe(
  'useLogStream',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        MockWebSocket.instances = []
        vi.stubGlobal(
          'WebSocket',
          MockWebSocket
        )
        vi.stubGlobal(
          'location',
          {
            protocol: 'http:',
            host: 'localhost:3000'
          }
        )
      }
    )

    it(
      'initializes with default state',
      () => {
        const { isConnected, isError, isFinished } = useLogStream()
        expect(
          isConnected.value
        ).toBe(false)
        expect(
          isError.value
        ).toBe(false)
        expect(
          isFinished.value
        ).toBe(false)
      }
    )

    it(
      'connects and authenticates/subscribes successfully via WebSocket',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: 'test-token' })
        const { connect, isConnected } = useLogStream()

        const onLog = vi.fn()
        const onFinished = vi.fn()

        connect(
          'job123',
          onLog,
          onFinished
        )

        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBeGreaterThan(0)
          }
        )

        const socket = MockWebSocket.instances[0]
        expect(
          socket.url
        ).toBe('ws://localhost:3000/api/v1/ws/logs/')

        socket.triggerOpen()
        expect(
          isConnected.value
        ).toBe(true)

        expect(
          socket.sentMessages.length
        ).toBe(2)
        expect(
          JSON.parse(socket.sentMessages[0])
        ).toEqual({
          msg_type: 'authenticate',
          msg_body: { token: 'test-token' }
        })
        expect(
          JSON.parse(socket.sentMessages[1])
        ).toEqual({
          msg_type: 'subscribe_job_logs',
          msg_body: { id: 'job123' }
        })
      }
    )

    it(
      'handles connection messages and finishes successfully',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: 'test-token' })
        const { connect, isFinished } = useLogStream()

        const onLog = vi.fn()
        const onFinished = vi.fn()

        connect(
          'job123',
          onLog,
          onFinished
        )

        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBeGreaterThan(0)
          }
        )

        const socket = MockWebSocket.instances[0]
        socket.triggerOpen()

        socket.triggerMessage({
          msg_type: 'log_message',
          msg_body: { logs: 'hello log' }
        })

        expect(
          onLog
        ).toHaveBeenCalledWith('hello log')

        socket.triggerMessage({
          msg_type: 'job_finished',
          msg_body: { status: 'success' }
        })

        expect(
          isFinished.value
        ).toBe(true)
        expect(
          onFinished
        ).toHaveBeenCalledWith({ status: 'success' })
      }
    )

    it(
      'handles connection token fetch error',
      async () => {
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Auth failed'))
        const { connect, isError } = useLogStream()

        connect('job123')

        await vi.waitFor(
          () => {
            expect(
              isError.value
            ).toBe(true)
          }
        )

        expect(
          isError.value
        ).toBe(true)
      }
    )

    it(
      'handles connection token missing error',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: '' })
        const { connect, isError } = useLogStream()

        connect('job123')

        await vi.waitFor(
          () => {
            expect(
              isError.value
            ).toBe(true)
          }
        )

        expect(
          isError.value
        ).toBe(true)
      }
    )

    it(
      'handles websocket connection error',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: 'test-token' })
        const { connect, isConnected, isError } = useLogStream()

        connect('job123')

        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBeGreaterThan(0)
          }
        )

        const socket = MockWebSocket.instances[0]
        socket.triggerOpen()
        socket.triggerError()

        expect(
          isError.value
        ).toBe(true)
        expect(
          isConnected.value
        ).toBe(false)
      }
    )

    it(
      'closes existing socket when connecting to a new one',
      async () => {
        vi.mocked(api.post).mockResolvedValue({ token: 'test-token' })
        const { connect } = useLogStream()

        connect('job1')
        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBe(1)
          }
        )
        const socket1 = MockWebSocket.instances[0]

        connect('job2')
        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBe(2)
          }
        )

        expect(
          socket1.readyState
        ).toBe(3)
      }
    )

    it(
      'disconnects from a running stream',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: 'test-token' })
        const { connect, disconnect, isConnected } = useLogStream()

        connect('job123')
        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBeGreaterThan(0)
          }
        )
        const socket = MockWebSocket.instances[0]
        socket.triggerOpen()

        disconnect('job123')

        expect(
          JSON.parse(socket.sentMessages[2])
        ).toEqual({
          msg_type: 'unsubscribe_job_logs',
          msg_body: { id: 'job123' }
        })
        expect(
          isConnected.value
        ).toBe(false)
      }
    )

    it(
      'closes socket on unmount',
      async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ token: 'test-token' })
        const { connect } = useLogStream()

        connect('job123')
        await vi.waitFor(
          () => {
            expect(
              MockWebSocket.instances.length
            ).toBeGreaterThan(0)
          }
        )
        const socket = MockWebSocket.instances[0]

        const onUnmountedMock = vi.mocked(onUnmounted)
        expect(
          onUnmountedMock
        ).toHaveBeenCalled()
        const cleanupCallback = onUnmountedMock.mock.calls[0][0]

        cleanupCallback()

        expect(
          socket.readyState
        ).toBe(3)
      }
    )
  }
)
