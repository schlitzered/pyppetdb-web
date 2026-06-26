<template>
  <div class="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
    <Card
      class="w-full max-w-md shadow-2xl border border-zinc-800 bg-zinc-900 text-zinc-100"
    >
      <template #title>
        <div class="text-center py-4">
          <h2 class="text-3xl font-extrabold text-white">PyppetDB</h2>
          <p class="text-zinc-400 mt-2 text-sm">
            Sign in to manage your Puppet environments
          </p>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="username" class="text-sm font-semibold text-zinc-300"
              >Username</label
            >
            <InputText
              id="username"
              v-model="formData.user"
              placeholder="Username"
              class="w-full bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-semibold text-zinc-300"
              >Password</label
            >
            <Password
              id="password"
              v-model="formData.password"
              :feedback="false"
              toggle-mask
              placeholder="Password"
              input-class="w-full bg-zinc-800 border-zinc-700 text-white"
              class="w-full"
            />
          </div>
          <Button
            type="submit"
            label="Sign In"
            class="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-none text-white font-semibold py-2"
          />
        </form>

        <div v-if="providers.length > 0" class="mt-6">
          <div class="relative flex py-5 items-center">
            <div class="flex-grow border-t border-zinc-800"></div>
            <span class="flex-shrink mx-4 text-zinc-500 text-xs uppercase"
              >Or continue with</span
            >
            <div class="flex-grow border-t border-zinc-800"></div>
          </div>
          <div class="flex flex-col gap-2">
            <Button
              v-for="provider in providers"
              :key="provider.name"
              as="a"
              :href="provider.url"
              :label="provider.name"
              icon="pi pi-sign-in"
              outline
              class="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import axios from 'axios'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import type { OAuthProvider } from '@/types/auth'

const auth = authStore()
const router = useRouter()

const formData = reactive({
  user: '',
  password: ''
})

const providers = ref<OAuthProvider[]>([])

const fetchProviders = async () => {
  try {
    const data = await api.get<{ result: OAuthProvider[] }>(
      '/oauth/authenticate/oauth'
    )
    if (data && data.result) {
      providers.value = data.result
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    await axios.post('/api/v1/authenticate', formData)
    const user = await auth.fetchUserData()
    if (user) {
      router.push({ name: 'Home' })
    }
  } catch {
    router.push({ name: 'LoginError' })
  }
}

onMounted(() => {
  fetchProviders()
})
</script>
