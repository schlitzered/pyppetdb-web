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
          append-inner-icon="mdi-key-plus"
          label="Key Model ID"
        ></v-text-field>
        <v-textarea
          v-model="formData.description"
          :readonly="formDataReadOnly"
          label="Description"
          rows="3"
          auto-grow
        ></v-textarea>
        <v-textarea
          v-model="formDataModelString"
          :readonly="formDataReadOnly"
          :rules="modelValidationRules"
          label="Model (JSON)"
          rows="10"
          auto-grow
        ></v-textarea>
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
import { reactive, ref, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'

const props = defineProps({
  modelType: {
    type: String,
    required: true,
    validator: (value) => ['static', 'dynamic'].includes(value)
  }
})

const apiError = apiErrorStore()

const route = useRoute()
const router = useRouter()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

// Determine if this is static (read-only) or dynamic (full CRUD)
const isStatic = computed(() => props.modelType === 'static')
const isDynamic = computed(() => props.modelType === 'dynamic')

// API endpoint based on model type
const apiEndpoint = computed(() => {
  if (isStatic.value) {
    return `/api/v1/hiera/key_models/static/${formData.id}`
  } else {
    return `/api/v1/hiera/key_models/dynamic/${formData.id}`
  }
})

// Route names based on model type
const searchRouteName = computed(() => {
  if (isStatic.value) {
    return 'HieraKeyModelsStaticSearch'
  } else {
    return 'HieraKeyModelsDynamicSearch'
  }
})

const crudRouteName = computed(() => {
  if (isStatic.value) {
    return 'HieraKeyModelsStaticCRUD'
  } else {
    return 'HieraKeyModelsDynamicCRUD'
  }
})

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    api.delete(apiEndpoint.value).then(() => {
      router.push({
        name: searchRouteName.value
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

// Computed property for model as string
const formDataModelString = computed({
  get() {
    if (typeof formData.model === 'object') {
      return JSON.stringify(formData.model, null, 2)
    }
    return formData.model || ''
  },
  set(value) {
    formData.model = value
  }
})

// Validation rules for JSON
const modelValidationRules = [
  (value) => {
    if (!value) return true
    try {
      JSON.parse(value)
      return true
    } catch (e) {
      return 'Invalid JSON format'
    }
  }
]

function initializeFormState() {
  // Initialize form state based on route and model type
  if (isStatic.value) {
    // Static mode: always read-only, no modify toggle, no delete button
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = false
    formButtonDeleteShow.value = false
  } else if (route.params.key_model_id !== '_new') {
    // Dynamic mode: existing record
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
    formButtonDeleteShow.value = true
  } else if (route.params.key_model_id === '_new') {
    // Dynamic mode: new record
    formInputIdReadOnly.value = false
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
  }
  formGetData()
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(() => route.params.key_model_id, () => {
  initializeFormState()
})

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Key Model: ${route.params.key_model_id}`
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

  // Only dynamic models can be submitted
  if (isStatic.value) {
    return
  }

  let method = 'post'
  let url = `/api/v1/hiera/key_models/dynamic/${formData.id}`

  // Parse JSON model
  let modelData
  try {
    modelData = JSON.parse(formData.model)
  } catch (e) {
    return
  }

  let data = {
    description: formData.description,
    model: modelData
  }

  api.request(method, url, data).then(() => {
    if (route.params.key_model_id === '_new') {
      formButtonDeleteShow.value = true
      router.push({
        name: crudRouteName.value,
        params: { key_model_id: formData.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  if (route.params.key_model_id === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['description'] = ''
    formData['model'] = ''
  } else {
    const endpoint = isStatic.value
      ? `/api/v1/hiera/key_models/static/${route.params.key_model_id}`
      : `/api/v1/hiera/key_models/dynamic/${route.params.key_model_id}`

    api.get(endpoint).then((data) => {
      if (data) {
        formData['id'] = data['id']
        formData['description'] = data['description']
        formData['model'] = data['model']
      }
    })
  }
}
</script>
