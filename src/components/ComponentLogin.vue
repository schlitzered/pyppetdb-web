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
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title class="text-center">
            <span class="headline">Login</span>
          </v-card-title>
          <v-form ref="form" v-model="formValid">
            <v-divider class="mt-12"></v-divider>
            <v-card-text>
              <v-text-field
                v-model="formData.user"
                append-inner-icon="mdi-account"
                :rules="[() => !!formData.user || 'This field is required']"
                label="Username"
              ></v-text-field>
              <v-text-field
                v-model="formData.password"
                :append-inner-icon="
                  formShowPassword ? 'mdi-eye' : 'mdi-eye-off'
                "
                :type="formShowPassword ? 'text' : 'password'"
                :rules="[() => !!formData.password || 'This field is required']"
                label="Password"
                @click:append-inner="formShowPassword = !formShowPassword"
                @keydown.enter="formSubmit"
              ></v-text-field>
            </v-card-text>
            <v-divider class="mt-12"></v-divider>
            <v-card-actions>
              <v-btn variant="text" @click="formReset"> Reset </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="!formValid"
                color="primary"
                variant="text"
                @click="formSubmit"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
        <v-divider v-if="oauth.providers.length" class="mt-12"></v-divider>
        <v-card v-if="oauth.providers.length">
          <v-card-title class="text-center">
            <span class="headline">Login using oAuth</span>
          </v-card-title>
          <v-card-text>
            <v-row justify="center">
              <v-col v-for="provider in oauth.providers" :key="provider.id">
                <v-btn
                  :href="'/oauth/authenticate/oauth/' + provider.id + '/login'"
                  block
                  color="primary"
                >
                  {{ provider.id }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { reactive, ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import api from '@/api/common'
import router from '../router/routes'
import { loginDataStore } from '@/store/login_data'

const loginData = loginDataStore()
const form = ref(null)
const formData = reactive({
  user: '',
  password: ''
})
const formValid = ref(false)
const formShowPassword = ref(false)

const oauth = reactive({
  providers: []
})

const oauthFetchProviders = async () => {
  try {
    const response = await api.get('/oauth/authenticate/oauth')
    if (response.result) {
      oauth.providers = response.result
    } else {
      oauth.providers = []
    }
  } catch (error) {
    console.error(error)
  }
}

function formSubmit(event) {
  event.preventDefault()
  axios
    .post('/api/v1/authenticate', formData)
    .then(() => {
      loginData
        .fetchUserData()
        .then((data) => {
          if (data) {
            router.push({ name: 'Home' })
          }
        })
        .catch(() => {
          router.push({ name: 'LoginError' })
        })
    })
    .catch(() => {
      router.push({ name: 'LoginError' })
    })
}
function formReset(event) {
  event.preventDefault()
  formData.user = ''
  formData.password = ''
  formShowPassword.value = false
  formValid.value = false

  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

onMounted(oauthFetchProviders)
</script>
