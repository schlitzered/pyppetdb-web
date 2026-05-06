/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
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
