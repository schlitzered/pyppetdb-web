/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-alert title="Logout">You are being logged out of the system</v-alert>
        <v-card> </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import router from '../router/routes'

import api from '@/api/common'
import { loginDataStore } from '@/store/login_data'
const loginData = loginDataStore()

onMounted(() => {
  api.delete('/api/v1/authenticate').then((data) => {
    if (data) {
      document.cookie =
        'session' +
        '=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      loginData.resetTimestamp()
      loginData.resetUserData()
      setTimeout(() => router.push({ name: 'Login' }), 1000)
    }
  })
})
</script>
