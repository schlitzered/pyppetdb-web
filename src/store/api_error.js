import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const apiErrorStore = defineStore('apiError', () => {
  const dialogShow = ref(false)
  const dialogError = ref('')
  const dialogHTTPStatus = ref('')
  const redirect = ref({ name: 'Home' })

  const getDialogShow = computed(() => dialogShow.value)
  const getDialogError = computed(() => dialogError.value)
  const getDialogHTTPStatus = computed(() => dialogHTTPStatus.value)
  const getRedirect = computed(() => redirect.value)

  function clear() {
    dialogShow.value = false
    dialogError.value = ''
    dialogHTTPStatus.value = ''
    redirect.value = { name: 'Home' }
  }

  function set(error) {
    dialogShow.value = true
    dialogError.value = error.response.data
    dialogHTTPStatus.value = error.response.status
  }

  function setRedirect(data) {
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
    clear,
    set,
    setRedirect
  }
})
