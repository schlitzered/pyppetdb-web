import { ref, onUnmounted } from 'vue'
import api from '@/api/common'

export function useLogStream() {
  const socket = ref(null)
  const isConnected = ref(false)
  const isError = ref(false)
  const isFinished = ref(false)

  function connect(jobRunId, onLogMessage, onJobFinished) {
    if (socket.value) {
      socket.value.close()
    }

    isFinished.value = false
    isError.value = false

    // 1. Get token
    api.post('/api/v1/ws/token').then((response) => {
      const token = response.token
      if (!token) {
        isError.value = true
        return
      }

      // 2. Connect to WS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      // In dev mode, we might need to point to the actual backend if proxy doesn't support WS
      // But usually vite proxy handles it if configured.
      const wsUrl = `${protocol}//${host}/api/v1/ws/logs/`
      
      socket.value = new WebSocket(wsUrl)

      socket.value.onopen = () => {
        isConnected.value = true
        // 3. Authenticate
        socket.value.send(JSON.stringify({
          msg_type: 'authenticate',
          msg_body: { token }
        }))

        // 4. Subscribe
        socket.value.send(JSON.stringify({
          msg_type: 'subscribe_job_logs',
          msg_body: { id: jobRunId }
        }))
      }

      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.msg_type === 'log_message') {
          if (onLogMessage) {
            onLogMessage(data.msg_body.logs)
          }
        } else if (data.msg_type === 'job_finished') {
          isFinished.value = true
          if (onJobFinished) {
            onJobFinished(data.msg_body)
          }
          socket.value.close()
        }
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket Error:', error)
        isError.value = true
        isConnected.value = false
      }

      socket.value.onclose = () => {
        isConnected.value = false
      }
    }).catch(err => {
      console.error('Failed to get WS token', err)
      isError.value = true
    })
  }

  function disconnect(jobRunId) {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        msg_type: 'unsubscribe_job_logs',
        msg_body: { id: jobRunId }
      }))
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
