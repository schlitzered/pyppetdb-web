<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary border border-zinc-700 text-zinc-300"
            @click="handleBack"
          />
          <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {{ title }}
          </h1>
        </div>
      </template>
      <template #right>
        <div class="flex gap-2">
          <Button
            v-for="item in toolbarItems"
            :key="item.label"
            :label="item.label"
            class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            @click="handleToolbarClick(item)"
          >
            <template #icon>
              <component
                v-if="iconMap[item.icon as keyof typeof iconMap]"
                :is="iconMap[item.icon as keyof typeof iconMap]"
                class="w-4 h-4 mr-2"
              />
            </template>
          </Button>
        </div>
      </template>
    </ResponsiveToolbar>

    <ResourceForm :resource-def="resourceDef" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import ResourceForm from '@/components/generic/ResourceForm.vue'
import type { ResourceDefinition } from '@/types/resources'
import { authStore } from '@/stores/auth'
import { FileText } from '@lucide/vue'
import { Shield } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = authStore()

const iconMap = {
  FileText,
  Shield
}

const resourceDef = computed(() => route.meta.resource as ResourceDefinition)
const isNew = computed(
  () => route.params[resourceDef.value.routeParam] === '_new'
)

const title = computed(() => {
  if (isNew.value) {
    return `New ${resourceDef.value.label}`
  }
  const crudTitle = resourceDef.value.toolbar.crud.title
  if (typeof crudTitle === 'function') {
    return crudTitle(route)
  }
  return crudTitle
})

const toolbarItems = computed(() => {
  if (isNew.value || !resourceDef.value?.toolbar?.crud?.items) {
    return []
  }
  return resourceDef.value.toolbar.crud.items.filter((item) => {
    if (item.requireAdmin && !auth.getUserDataIsAdmin) {
      return false
    }
    if (item.hide && item.hide(route, auth.hasPermission)) {
      return false
    }
    return true
  })
})

const handleToolbarClick = (item: any) => {
  if (item.to) {
    const toRoute = typeof item.to === 'function' ? item.to(route) : item.to
    router.push(toRoute)
  }
}

const handleBack = () => {
  router.push({ name: resourceDef.value.routeNames.search })
}
</script>
