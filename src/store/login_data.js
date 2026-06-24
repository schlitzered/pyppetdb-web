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
import api from '@/api/common'

export const loginDataStore = defineStore('loginData', () => {
  const timestamp = ref(0)
  const userData = ref({})
  const isLoaded = ref(false)

  const isTimestampOlderThan = (seconds) => {
    const currentTimeStamp = Date.now()
    const secondsAgo = currentTimeStamp - seconds * 1000 // convert seconds to milliseconds
    return timestamp.value < secondsAgo
  }

  const getUserData = computed(() => userData.value)
  const getUserDataId = computed(() => userData.value.id)
  const getUserDataIsAdmin = computed(
    () => userData.value.admin === true || userData.value.admin === 1
  )
  const getUserDataPermissions = computed(
    () => userData.value.permissions || []
  )

  const hasPermission = (permission) => {
    if (getUserDataIsAdmin.value) {
      return true
    }
    return getUserDataPermissions.value.includes(permission)
  }

  const hasPermissionPattern = (pattern) => {
    if (getUserDataIsAdmin.value) {
      return true
    }
    const regex = new RegExp(pattern)
    return getUserDataPermissions.value.some((p) => regex.test(p))
  }

  const getPermissionMatches = (pattern) => {
    const regex = new RegExp(pattern)
    const matches = []
    getUserDataPermissions.value.forEach((p) => {
      const m = p.match(regex)
      if (m && m.length > 1) {
        matches.push(m[1])
      }
    })
    return matches
  }

  function setTimestamp() {
    timestamp.value = Date.now()
  }

  function resetTimestamp() {
    timestamp.value = 0
  }
  function resetUserData() {
    userData.value = {}
  }

  function setUserData(data) {
    userData.value = data
    isLoaded.value = true
  }

  function resetIsLoaded() {
    isLoaded.value = false
  }

  function reset() {
    resetTimestamp()
    resetUserData()
    resetIsLoaded()
  }

  async function fetchUserData() {
    try {
      const data = await api.get('/api/v1/users/_self')
      if (data) {
        setUserData(data)
        setTimestamp()
        return data
      }
    } catch (error) {
      resetIsLoaded()
      throw error
    }
  }

  return {
    timestamp,
    userData,
    isLoaded,
    isTimestampOlderThan,
    getUserData,
    getUserDataId,
    getUserDataIsAdmin,
    getUserDataPermissions,
    hasPermission,
    hasPermissionPattern,
    getPermissionMatches,
    resetTimestamp,
    resetUserData,
    setTimestamp,
    setUserData,
    resetIsLoaded,
    reset,
    fetchUserData
  }
})
