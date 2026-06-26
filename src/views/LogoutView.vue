<template>
  <div class="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
    <Card
      class="w-full max-w-md shadow-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 text-center"
    >
      <template #content>
        <div class="flex flex-col items-center gap-4 py-8">
          <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
          <h2 class="text-xl font-semibold text-white">Logging Out...</h2>
          <p class="text-zinc-400 text-sm">
            Please wait while we secure your session
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'

const auth = authStore()
const router = useRouter()

onMounted(async () => {
  try {
    await api.delete('/api/v1/authenticate')
  } catch (error) {
    console.error(error)
  } finally {
    document.cookie =
      'session=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    auth.reset()
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 1000)
  }
})
</script>
