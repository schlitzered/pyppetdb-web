import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserData } from '@/types/auth'
import api from '@/api/client'

// The authoritative session check. A 401 on THIS endpoint means the session is
// really gone; a 401 on any other request is treated as transient (see client.ts).
export const SELF_ENDPOINT = '/api/v1/users/_self'

export const authStore = defineStore('auth', () => {
  const timestamp = ref(0)
  const userData = ref<UserData | null>(null)
  const isLoaded = ref(false)

  // ponytail: dedupe concurrent /_self calls (router guard + 401 revalidation
  // can both trigger a fetch at the same moment) so we never storm the endpoint
  let inflightFetch: Promise<UserData | undefined> | null = null

  const getUserData = computed(() => userData.value)
  const getUserDataId = computed(() => userData.value?.id ?? '')
  const getUserDataIsAdmin = computed(() => {
    if (!userData.value) return false
    return userData.value.admin === true || userData.value.admin === 1
  })
  const getUserDataPermissions = computed(
    () => userData.value?.permissions ?? []
  )

  function hasPermission(permission: string): boolean {
    if (getUserDataIsAdmin.value) return true
    return getUserDataPermissions.value.includes(permission)
  }

  function hasPermissionPattern(pattern: string): boolean {
    if (getUserDataIsAdmin.value) return true
    const regex = new RegExp(pattern)
    return getUserDataPermissions.value.some((perm) => regex.test(perm))
  }

  function getPermissionMatches(pattern: string): string[] {
    if (getUserDataIsAdmin.value) return []
    const regex = new RegExp(pattern)
    const matches: string[] = []
    for (const perm of getUserDataPermissions.value) {
      const match = regex.exec(perm)
      if (match && match[1]) {
        matches.push(match[1])
      }
    }
    return matches
  }

  function isTimestampOlderThan(seconds: number): boolean {
    return Date.now() - timestamp.value > seconds * 1000
  }

  function setTimestamp() {
    timestamp.value = Date.now()
  }

  function setUserData(data: UserData) {
    userData.value = data
    isLoaded.value = true
  }

  function resetTimestamp() {
    timestamp.value = 0
  }

  function resetUserData() {
    userData.value = null
  }

  function resetIsLoaded() {
    isLoaded.value = false
  }

  function reset() {
    // TEMP DEBUG: who is tearing down the session?
    console.warn('[auth] reset() called', new Error('reset stack').stack)
    resetTimestamp()
    resetUserData()
    resetIsLoaded()
  }

  async function fetchUserData(): Promise<UserData | undefined> {
    if (inflightFetch) return inflightFetch
    inflightFetch = (async () => {
      try {
        const data = await api.get<UserData>(SELF_ENDPOINT)
        if (data) {
          setUserData(data)
          setTimestamp()
          return data
        }
      } catch (error) {
        resetIsLoaded()
        throw error
      } finally {
        inflightFetch = null
      }
    })()
    return inflightFetch
  }

  return {
    timestamp,
    userData,
    isLoaded,
    getUserData,
    getUserDataId,
    getUserDataIsAdmin,
    getUserDataPermissions,
    hasPermission,
    hasPermissionPattern,
    getPermissionMatches,
    isTimestampOlderThan,
    setTimestamp,
    setUserData,
    resetTimestamp,
    resetUserData,
    resetIsLoaded,
    reset,
    fetchUserData
  }
})
