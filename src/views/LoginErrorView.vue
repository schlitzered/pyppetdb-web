<template>
  <div class="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
    <Card
      class="w-full max-w-md shadow-2xl border border-zinc-800 bg-zinc-900 text-zinc-100"
    >
      <template #content>
        <div class="flex flex-col items-center gap-4 py-8 text-center">
          <div
            class="w-16 h-16 rounded-full bg-rose-950 flex items-center justify-center text-rose-500 border border-rose-800"
          >
            <XCircle class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-bold text-white mt-2">
            Authentication Failed
          </h2>
          <p class="text-zinc-400 text-sm max-w-xs">
            Either your session has expired, or the login credentials provided
            are invalid.
          </p>
          <Button
            as="router-link"
            to="/login"
            label="Continue to Login"
            class="mt-6 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 w-full"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { XCircle } from '@lucide/vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push({ name: 'Login' })
  }, 5000)
})
</script>
