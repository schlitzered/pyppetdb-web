import { ref, onUnmounted } from 'vue'
import api from '@/api/client'

interface WsMessage {
  msg_type: string
  msg_body: Record<string, unknown>
}

export function useLogStream() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isError = ref(false)
  const isFinished = ref(false)

  function connect(
    jobRunId: string,
    onLogMessage?: (logs: string) => void,
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
        const wsUrl = `${protocol}//${host}/api/v1/ws/logs/`

        socket.value = new WebSocket(wsUrl)

        socket.value.onopen = () => {
          isConnected.value = true
          socket.value!.send(
            JSON.stringify({
              msg_type: 'authenticate',
              msg_body: { token }
            })
          )

          socket.value!.send(
            JSON.stringify({
              msg_type: 'subscribe_job_logs',
              msg_body: { id: jobRunId }
            })
          )
        }

        socket.value.onmessage = (event: MessageEvent) => {
          const data: WsMessage = JSON.parse(event.data)
          if (data.msg_type === 'log_message') {
            if (onLogMessage) {
              onLogMessage(data.msg_body.logs as string)
            }
          } else if (data.msg_type === 'job_finished') {
            isFinished.value = true
            if (onJobFinished) {
              onJobFinished(data.msg_body)
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
        JSON.stringify({
          msg_type: 'unsubscribe_job_logs',
          msg_body: { id: jobRunId }
        })
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
