import { ref, onUnmounted } from 'vue'
import api from '@/api/client'

interface WsFrame {
  op: string
  type?: string
  payload?: Record<string, unknown>
}

const logTopic = (jobRunId: string) => `jobs.node_jobs.logs:${jobRunId}`

export function useLogStream() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isError = ref(false)
  const isFinished = ref(false)

  function connect(
    jobRunId: string,
    onLogMessage?: (logs: unknown) => void,
    onJobFinished?: (body: Record<string, unknown>) => void
  ): void {
    if (socket.value) {
      socket.value.close()
    }

    isFinished.value = false
    isError.value = false

    api
      .post<{ token: string }>('/api/v1/ws/token')
      .then((response) => {
        const token = response.token
        if (!token) {
          isError.value = true
          return
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        const wsUrl = `${protocol}//${host}/api/v1/ws`

        socket.value = new WebSocket(wsUrl)

        socket.value.onopen = () => {
          isConnected.value = true
          socket.value!.send(JSON.stringify({ op: 'auth', token }))

          socket.value!.send(
            JSON.stringify({
              op: 'subscribe',
              id: 'logs',
              topic: logTopic(jobRunId)
            })
          )
        }

        socket.value.onmessage = (event: MessageEvent) => {
          const frame: WsFrame = JSON.parse(event.data)
          if (frame.op === 'error') {
            isError.value = true
          } else if (frame.op !== 'event') {
            return
          } else if (frame.type === 'jobs.node_jobs.log') {
            if (onLogMessage) {
              onLogMessage(frame.payload?.logs)
            }
          } else if (frame.type === 'jobs.node_jobs.finished') {
            isFinished.value = true
            if (onJobFinished) {
              onJobFinished(frame.payload ?? {})
            }
            socket.value!.close()
          }
        }

        socket.value.onerror = () => {
          isError.value = true
          isConnected.value = false
        }

        socket.value.onclose = () => {
          isConnected.value = false
        }
      })
      .catch(() => {
        isError.value = true
      })
  }

  function disconnect(jobRunId: string): void {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(
        JSON.stringify({ op: 'unsubscribe', topic: logTopic(jobRunId) })
      )
      socket.value.close()
    }
  }

  onUnmounted(() => {
    if (socket.value) {
      socket.value.close()
    }
  })

  return {
    isConnected,
    isError,
    isFinished,
    connect,
    disconnect
  }
}
