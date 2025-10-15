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
          v-model="formData.id"
          :readonly="formInputIdReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-account"
          label="User ID"
        ></v-text-field>
        <v-text-field
          v-model="formData.name"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-account"
          label="User Name"
        ></v-text-field>
        <v-text-field
          v-model="formData.email"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-mail"
          label="Email"
        ></v-text-field>
        <v-text-field
          v-model="formData.password"
          v-if="formInputPasswordChangeable"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          :append-inner-icon="formInputPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
          :type="formInputPasswordShow ? 'text' : 'password'"
          label="Password"
          @click:append-inner="formInputPasswordShow = !formInputPasswordShow"
        ></v-text-field>
        <v-switch
          v-model="formData.admin"
          :readonly="formDataReadOnly"
          label="Admin"
        ></v-switch>
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
import { reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { loginDataStore } from '@/store/login_data'
import { apiErrorStore } from '@/store/api_error'

const apiError = apiErrorStore()
const loginData = loginDataStore()

const route = useRoute()
const router = useRouter()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    let url = '/api/v1/users/' + formData.id
    api.delete(url).then(() => {
      router.push({ name: 'UsersSearch' })
    })
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)
const formInputPasswordShow = ref(false)
const formInputPasswordChangeable = ref(false)

if (loginData.getUserDataIsAdmin && route.params.user !== '_new') {
  formInputIdReadOnly.value = true
  formDataReadOnly.value = true
  formButtonEditShow.value = true
} else if (loginData.getUserDataIsAdmin && route.params.user === '_new') {
  formInputIdReadOnly.value = false
  formDataReadOnly.value = false
  formButtonDeleteShow.value = false
  formButtonEditShow.value = false
} else {
  formInputIdReadOnly.value = true
  formDataReadOnly.value = true
  formButtonEditShow.value = false
}
formGetData()

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value =
    'Are you sure you want to delete user: ' + route.params.user
}

function formReset(event) {
  event.preventDefault()
  formGetData()
  formInputPasswordShow.value = false
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formSubmit(event) {
  event.preventDefault()
  let method = 'put'
  let url = '/api/v1/users/' + formData.id
  let data = {
    admin: formData.admin,
    email: formData.email,
    name: formData.name
  }
  if (formData.password) {
    data['password'] = formData.password
  }
  if (route.params.user === '_new') {
    method = 'post'
  }
  api.request(method, url, data).then(() => {
    if (route.params.user === '_new') {
      formButtonDeleteShow.value = true
      router.push({ name: 'UsersCRUD', params: { user: formData.id } })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  formData['password'] = ''
  if (route.params.user === '_new') {
    formInputPasswordChangeable.value = true
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['admin'] = false
    formData['email'] = ''
    formData['name'] = ''
    formData['backend'] = 'internal'
  } else {
    api.get('/api/v1/users/' + route.params.user).then((data) => {
      if (data) {
        formData['id'] = data['id']
        formData['admin'] = data['admin']
        formData['backend'] = data['backend']
        formData['backend_ref'] = data['backend_ref']
        formData['email'] = data['email']
        formData['name'] = data['name']
      }
    })
  }
}
</script>
