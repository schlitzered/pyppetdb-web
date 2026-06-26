import { ref } from 'vue'
import api from '@/api/client'
import type { ResourceDefinition } from '@/types/resources'
import type { RouteLocationNormalized } from 'vue-router'

export function useResourceQuery(resourceDef: ResourceDefinition) {
  const data = ref<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  function getApiEndpoint(route: RouteLocationNormalized): string {
    if (typeof resourceDef.apiBase === 'function') {
      return resourceDef.apiBase(route)
    }
    return resourceDef.apiBase
  }

  async function fetch(
    id: string,
    route: RouteLocationNormalized
  ): Promise<Record<string, unknown> | null> {
    loading.value = true
    error.value = null
    try {
      const endpoint = `${getApiEndpoint(route)}/${encodeURIComponent(id)}`
      const result = await api.get<Record<string, unknown>>(endpoint)
      data.value = result
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    fetch,
    reset
  }
}
