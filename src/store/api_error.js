/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    dialogError.value = error.response?.data || 'An error occurred'
    dialogHTTPStatus.value = error.response?.status || 500
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
