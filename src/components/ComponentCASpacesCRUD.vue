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
          append-inner-icon="mdi-folder-key"
          label="Space ID"
        ></v-text-field>
        <v-autocomplete
          v-model="formData.ca_id"
          :items="caChoices"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.ca_id || 'This field is required']"
          label="Current CA ID"
          :loading="caChoicesLoading"
        >
        </v-autocomplete>
        <v-text-field
          v-model="formData.description"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-text"
          label="Description"
        ></v-text-field>
        <v-list
          v-if="formData.ca_id_history && formData.ca_id_history.length > 0"
        >
          <v-list-subheader>CA History</v-list-subheader>
          <v-list-item
            v-for="ca in formData.ca_id_history"
            :key="ca"
            :title="ca"
          >
          </v-list-item>
        </v-list>
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
import { useRoute, useRouter } from 'vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'

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
    let url = `/api/v1/ca/spaces/${formData.id}`
    api.delete(url).then(() => {
      router.push({
        name: 'CASpacesSearch'
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

const caChoices = ref([])
const caChoicesLoading = ref(false)

function getCAChoices() {
  caChoicesLoading.value = true
  api
    .get('/api/v1/ca/authorities', { limit: 1000, fields: ['id'] })
    .then((data) => {
      if (data && data.result) {
        caChoices.value = data.result.map((ca) => ca.id)
      }
      caChoicesLoading.value = false
    })
}

function initializeFormState() {
  if (route.params.space_id !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
    formButtonDeleteShow.value = true
  } else {
    formInputIdReadOnly.value = false
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
  }
  formGetData()
  getCAChoices()
}

initializeFormState()

watch(
  () => route.params.space_id,
  () => {
    initializeFormState()
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete CA Space: ${route.params.space_id}`
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
  let url = `/api/v1/ca/spaces/${formData.id}`
  let data = {
    ca_id: formData.ca_id,
    description: formData.description
  }
  if (route.params.space_id === '_new') {
    method = 'post'
  }
  api.request(method, url, data).then(() => {
    if (route.params.space_id === '_new') {
      formButtonDeleteShow.value = true
      router.push({
        name: 'CASpacesCRUD',
        params: { space_id: formData.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  if (route.params.space_id === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['ca_id'] = ''
    formData['description'] = ''
    formData['ca_id_history'] = []
  } else {
    api.get(`/api/v1/ca/spaces/${route.params.space_id}`).then((data) => {
      if (data) {
        Object.assign(formData, data)
      }
    })
  }
}
</script>
