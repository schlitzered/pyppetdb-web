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
          append-inner-icon="mdi-key"
          label="Key ID"
        ></v-text-field>
        <v-text-field
          v-model="formData.key_model_id"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.key_model_id || 'This field is required']"
          append-inner-icon="mdi-key-variant"
          label="Key Model ID"
        ></v-text-field>
        <v-text-field
          v-model="formData.description"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-text"
          label="Description"
        ></v-text-field>
        <v-switch
          v-model="formData.deprecated"
          :readonly="formDataReadOnly"
          label="Deprecated"
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
          >Delete
        </v-btn>
        <v-btn color="primary" variant="text" @click="formSubmit">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch } from 'vue'
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
    let url = `/api/v1/hiera/keys/${formData.id}`
    api.delete(url).then(() => {
      router.push({
        name: 'HieraKeysSearch'
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

function initializeFormState() {
  if (route.params.key_id !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
  } else if (route.params.key_id === '_new') {
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
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(() => route.params.key_id, () => {
  initializeFormState()
})

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Key: ${route.params.key_id}`
}

function formReset(event) {
  event.preventDefault()
  formGetData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formSubmit(event) {
  event.preventDefault()
  let method = 'put'
  let url = `/api/v1/hiera/keys/${formData.id}`
  let data = {
    key_model_id: formData.key_model_id,
    description: formData.description,
    deprecated: formData.deprecated
  }
  if (route.params.key_id === '_new') {
    method = 'post'
  }
  api.request(method, url, data).then(() => {
    if (route.params.key_id === '_new') {
      formButtonDeleteShow.value = true
      router.push({
        name: 'HieraKeysCRUD',
        params: { key_id: formData.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  if (route.params.key_id === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['key_model_id'] = ''
    formData['description'] = ''
    formData['deprecated'] = false
  } else {
    api.get(`/api/v1/hiera/keys/${route.params.key_id}`).then((data) => {
      if (data) {
        formData['id'] = data['id']
        formData['key_model_id'] = data['key_model_id']
        formData['description'] = data['description']
        formData['deprecated'] = data['deprecated']
      }
    })
  }
}
</script>
