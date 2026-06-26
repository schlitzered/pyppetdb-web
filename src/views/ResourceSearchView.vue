<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {{ resourceDef.labelPlural }}
        </h1>
      </template>
      <template #right>
        <Button
          v-if="canCreate"
          icon="pi pi-plus"
          label="New"
          class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 px-4 font-medium"
          @click="handleCreate"
        />
      </template>
    </ResponsiveToolbar>

    <ResourceTable :resource-def="resourceDef" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import ResourceTable from '@/components/generic/ResourceTable.vue'
import { authStore } from '@/stores/auth'
import type { ResourceDefinition } from '@/types/resources'

const route = useRoute()
const router = useRouter()
const auth = authStore()

const resourceDef = computed(() => route.meta.resource as ResourceDefinition)

const canCreate = computed(() => {
  const perm = resourceDef.value.permissions.create
  if (!perm) return false
  return perm(auth.hasPermission)
})

const handleCreate = () => {
  const params = {
    ...route.params,
    ...(resourceDef.value.creationParams || {
      [resourceDef.value.routeParam]: '_new'
    })
  }
  router.push({
    name: resourceDef.value.routeNames.crud,
    params
  })
}
</script>
