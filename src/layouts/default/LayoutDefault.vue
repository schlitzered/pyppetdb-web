<template>
  <v-app>
    <ComponentLoginStateCheck />
    <div v-if="isReady">
      <default-view />
    </div>
    <div v-else class="d-flex align-center justify-center fill-height">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { loginDataStore } from '@/store/login_data'
import ComponentLoginStateCheck from '@/components/ComponentLoginStateCheck.vue'
import DefaultView from './LayoutView.vue'

const route = useRoute()
const loginData = loginDataStore()

const isReady = computed(() => {
  if (route.name && route.name.startsWith('Login')) {
    return true
  }
  return loginData.isLoaded
})
</script>
