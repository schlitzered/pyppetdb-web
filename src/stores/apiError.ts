import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const apiErrorStore = defineStore('apiError', () => {
  const dialogShow = ref(false)
  const dialogError = ref<unknown>(null)
  const dialogHTTPStatus = ref<number | null>(null)
  const redirect = ref<Record<string, unknown>>({ name: 'Home' })

  const getDialogShow = computed(() => dialogShow.value)
  const getDialogError = computed(() => dialogError.value)
  const getDialogHTTPStatus = computed(() => dialogHTTPStatus.value)
  const getRedirect = computed(() => redirect.value)

  function set(error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number }
      }
      dialogError.value = axiosError.response?.data ?? null
      dialogHTTPStatus.value = axiosError.response?.status ?? null
    }
    dialogShow.value = true
  }

  function clear() {
    dialogShow.value = false
    dialogError.value = null
    dialogHTTPStatus.value = null
    redirect.value = { name: 'Home' }
  }

  function setRedirect(data: Record<string, unknown>) {
    redirect.value = data
  }

  return {
    dialogShow,
    dialogError,
    dialogHTTPStatus,
    redirect,
    getDialogShow,
    getDialogError,
    getDialogHTTPStatus,
    getRedirect,
    set,
    clear,
    setRedirect
  }
})
