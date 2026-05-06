/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <ComponentDialogWarning
    :msg="dialogDeleteMsg"
    :show="dialogDeleteShow"
    @response="(action) => dialogDeleteEvent(action)"
  />
  <v-card>
    <v-form ref="form" v-model="formDataValid">
      <v-card-text>
        <v-switch
          v-model="formDataReadOnly"
          v-if="formButtonEditShow"
          :true-value="false"
          :false-value="true"
          label="Modify"
        ></v-switch>
        <v-text-field
          v-if="formInputIdShow"
          v-model="formData.id"
          :readonly="formInputIdReadOnly"
          append-inner-icon="mdi-account"
          label="Secret ID"
        ></v-text-field>
        <v-text-field
          v-if="formInputSecretShow"
          v-model="formData.secret"
          :readonly="formInputIdReadOnly"
          append-inner-icon="mdi-account"
          label="Secret: please copy the secret, it will be only shown once"
        ></v-text-field>
        <v-text-field
          v-if="formInputCreatedShow"
          v-model="formData.created"
          :readonly="formInputCreatedReadOnly"
          append-inner-icon="mdi-account"
          label="Created"
        ></v-text-field>
        <v-text-field
          v-model="formData.description"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-mail"
          label="description"
        ></v-text-field>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="formButtonDeleteShow"
          color="red"
          variant="text"
          @click="formDelete"
          >Delete</v-btn
        >
        <v-btn color="primary" variant="text" @click="formSubmit">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { PERMISSIONS } from '@/common/permissions'
import { reactive, ref, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { useCrudReload } from '@/common/crud_generic'
import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()
const loginData = loginDataStore()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    let url = `/api/v1/users/${route.params.user}/credentials/${formData.id}`
    api.delete(url).then(() => {
      router.push({
        name: 'UsersCredentialsSearch',
        params: { user: route.params.user }
      })
    })
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)

const formButtonEditShow = computed(() => {
  if (route.params.credential === '_new') return false
  if (route.params.user === '_self') return true
  return loginData.hasPermission(PERMISSIONS.USERS.CREDENTIALS.UPDATE)
})

const formButtonDeleteShow = computed(() => {
  if (route.params.credential === '_new') return false
  if (route.params.user === '_self') return true
  return loginData.hasPermission(PERMISSIONS.USERS.CREDENTIALS.DELETE)
})
const formInputIdReadOnly = ref(true)
const formInputIdShow = ref(true)
const formInputCreatedReadOnly = ref(true)
const formInputCreatedShow = ref(true)
const formInputSecretShow = ref(false)

function initializeFormState() {
  if (route.params.credential !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
  } else if (route.params.credential === '_new') {
    formDataReadOnly.value = false
    formInputCreatedShow.value = false
    formInputIdShow.value = false
  } else {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
  }
  formGetData()
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(
  () => route.params.credential,
  () => {
    initializeFormState()
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete user ${route.params.user} credential ${route.params.credential}`
}

function formReset(event) {
  event.preventDefault()
  formGetData()
  formDataValid.value = false
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

function formSubmit(event) {
  event.preventDefault()
  let method = 'put'
  let url = `/api/v1/users/${route.params.user}/credentials/${formData.id}`
  let data = {
    description: formData.description
  }
  if (route.params.credential === '_new') {
    url = '/api/v1/users/' + route.params.user + '/credentials'
    method = 'post'
  }
  api.request(method, url, data).then((data) => {
    if (route.params.credential === '_new') {
      formData.secret = data.secret
      formInputCreatedShow.value = true
      formInputIdShow.value = true
      formInputSecretShow.value = true
      router.push({
        name: 'UsersCredentialsCRUD',
        params: { user: route.params.user, credential: data.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

function formGetData() {
  if (route.params.credential === '_new') {
    formDataValid.value = false
    nextTick(() => {
      if (form.value) {
        form.value.resetValidation()
      }
    })
    formData['id'] = ''
    formData['created'] = ''
    formData['description'] = ''
  } else {
    api
      .get(
        `/api/v1/users/${route.params.user}/credentials/${route.params.credential}`
      )
      .then((data) => {
        if (data) {
          formData['id'] = data['id']
          formData['created'] = data['created']
          formData['description'] = data['description']
        }
      })
  }
}
</script>
