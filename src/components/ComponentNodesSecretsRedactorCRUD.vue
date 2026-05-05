/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <v-card>
    <v-form ref="form" v-model="formDataValid" @submit.prevent="formSubmit">
      <v-card-text>
        <v-text-field
          v-model="formData.value"
          label="Secret String to Redact"
          :rules="[v => !!v || 'Value is required']"
          :type="showValue ? 'text' : 'password'"
          :append-inner-icon="showValue ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showValue = !showValue"
          hint="The string will be masked in reports and catalogs. It is encrypted on the server."
          persistent-hint
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          type="submit"
          :disabled="!formDataValid || !loginData.hasPermission('NODES:SECRETS_REDACTOR::CREATE')"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/common'
import { loginDataStore } from '@/store/login_data'

const router = useRouter()
const loginData = loginDataStore()

const form = ref(null)
const formDataValid = ref(false)
const showValue = ref(false)
const formData = reactive({
  value: ''
})

function formReset() {
  formData.value = ''
  showValue.value = false
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

function formSubmit() {
  if (!formDataValid.value) return

  api.post('/api/v1/nodes_secrets_redactor', { value: formData.value }).then(() => {
    router.push({ name: 'NodesSecretsRedactorSearch' })
  })
}
</script>
