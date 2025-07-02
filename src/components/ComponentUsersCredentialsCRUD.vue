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
import { reactive, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'

const apiError = apiErrorStore()

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
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)
const formInputIdShow = ref(true)
const formInputCreatedReadOnly = ref(true)
const formInputCreatedShow = ref(true)
const formInputSecretShow = ref(false)

function formConfigure() {
  if (route.params.credential !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
  } else if (route.params.credential === '_new') {
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
    formInputCreatedShow.value = false
    formInputIdShow.value = false
  } else {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = false
  }
}

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete user ${route.params.user} credential ${route.params.credential}`
}

function formReset(event) {
  event.preventDefault()
  formGetUserData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
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
      formButtonDeleteShow.value = true
      router.push({
        name: 'UsersCredentialsCRUD',
        params: { user: route.params.user, credential: data.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetUserData()
    }
  })
}

function formGetUserData() {
  if (route.params.credential === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
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

watch(
  () => [route.params.user],
  () => {
    if (route.name === 'UsersCredentialsCRUD') {
      formConfigure()
      formGetUserData()
    }
  }
)

onMounted(async () => {
  formConfigure()
  formGetUserData()
  apiError.setRedirect({
    name: 'UsersCredentialsSearch',
    params: { user: route.params.user }
  })
})
</script>
