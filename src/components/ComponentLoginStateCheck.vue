/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template><div></div></template>
<script setup>
import { loginDataStore } from '@/store/login_data'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const loginData = loginDataStore()
const route = useRoute()
const intervalId = ref(null)

watch(
  () => route.name,
  (newName) => {
    if (newName) {
      if (!newName.startsWith('Login')) {
        if (!loginData.isLoaded) {
          loginData.fetchUserData().catch(() => {})
        }
      } else {
        loginData.reset()
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  intervalId.value = setInterval(() => {
    if (route.name && !route.name.startsWith('Login')) {
      if (loginData.isTimestampOlderThan(60)) {
        loginData.fetchUserData().catch(() => {})
      }
    }
  }, 60000) // check every 60 seconds
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>
