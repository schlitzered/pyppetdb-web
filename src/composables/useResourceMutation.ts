import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import type { ResourceDefinition } from '@/types/resources'
import type { RouteLocationNormalized } from 'vue-router'

export function useCreateResource(resourceDef: ResourceDefinition) {
  const router = useRouter()
  const loading = ref(false)
  const error = ref<unknown>(null)

  function getApiEndpoint(route: RouteLocationNormalized): string {
    if (typeof resourceDef.apiBase === 'function') {
      return resourceDef.apiBase(route)
    }
    return resourceDef.apiBase
  }

  async function create(
    data: Record<string, unknown>,
    route: RouteLocationNormalized
  ): Promise<unknown> {
    loading.value = true
    error.value = null
    try {
      let endpoint = getApiEndpoint(route)
      const excludePostId = [
        'jobs/definitions',
        'jobs',
        'nodes_secrets_redactor',
        'users/credentials'
      ]
      if (resourceDef.routeParam && !excludePostId.includes(resourceDef.name)) {
        const idKey = resourceDef.name === 'nodes' ? 'node' : 'id'
        const idValue = data[idKey]
        if (idValue) {
          endpoint = `${endpoint}/${encodeURIComponent(String(idValue))}`
        }
      }
      const result = await api.post(endpoint, data)
      if (!result || !(result as any).secret) {
        router.push({
          name: resourceDef.routeNames.search
        })
      }
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    create,
    loading,
    error
  }
}

export function useUpdateResource(resourceDef: ResourceDefinition) {
  const loading = ref(false)
  const error = ref<unknown>(null)

  function getApiEndpoint(route: RouteLocationNormalized): string {
    if (typeof resourceDef.apiBase === 'function') {
      return resourceDef.apiBase(route)
    }
    return resourceDef.apiBase
  }

  async function update(
    id: string,
    data: Record<string, unknown>,
    route: RouteLocationNormalized
  ): Promise<unknown> {
    loading.value = true
    error.value = null
    try {
      const endpoint = `${getApiEndpoint(route)}/${encodeURIComponent(id)}`
      const result = await api.put(endpoint, data)
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    update,
    loading,
    error
  }
}

export function useDeleteResource(resourceDef: ResourceDefinition) {
  const router = useRouter()
  const loading = ref(false)
  const error = ref<unknown>(null)

  function getApiEndpoint(route: RouteLocationNormalized): string {
    if (typeof resourceDef.apiBase === 'function') {
      return resourceDef.apiBase(route)
    }
    return resourceDef.apiBase
  }

  async function remove(
    id: string,
    route: RouteLocationNormalized
  ): Promise<unknown> {
    loading.value = true
    error.value = null
    try {
      const endpoint = `${getApiEndpoint(route)}/${encodeURIComponent(id)}`
      const result = await api.delete(endpoint)
      router.push({ name: resourceDef.routeNames.search })
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    remove,
    loading,
    error
  }
}
