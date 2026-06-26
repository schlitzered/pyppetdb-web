<template>
  <div>
    <ErrorDialog />
    <div v-if="isReady">
      <AppShell v-if="showShell">
        <router-view :key="route.path" />
      </AppShell>
      <router-view v-else :key="route.path" />
    </div>
    <div
      v-else
      class="flex items-center justify-center min-h-screen bg-zinc-950"
    >
      <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onMounted } from 'vue'
import { onBeforeUnmount } from 'vue'
import { ref } from 'vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import AppShell from '@/layouts/AppShell.vue'
import ErrorDialog from '@/components/shared/ErrorDialog.vue'
import { authStore } from '@/stores/auth'

const auth = authStore()
const route = useRoute()
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)

const showShell = computed(() => {
  return route.meta.hideNav !== true
})

const isReady = computed(() => {
  if (route.name && String(route.name).startsWith('Login')) {
    return true
  }
  return auth.isLoaded
})

watch(
  () => route.name,
  (newName) => {
    if (newName) {
      if (!String(newName).startsWith('Login')) {
        if (!auth.isLoaded) {
          auth.fetchUserData().catch(() => {})
        }
      } else {
        auth.reset()
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  intervalId.value = setInterval(() => {
    if (route.name && !String(route.name).startsWith('Login')) {
      if (auth.isTimestampOlderThan(60)) {
        auth.fetchUserData().catch(() => {})
      }
    }
  }, 60000)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>
