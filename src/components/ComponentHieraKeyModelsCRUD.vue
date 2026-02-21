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
      <v-divider v-if="!formDataReadOnly || formButtonDeleteShow"></v-divider>
      <v-card-actions v-if="!formDataReadOnly || formButtonDeleteShow">
        <v-btn v-if="!formDataReadOnly" variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="formButtonDeleteShow"
          color="red"
          variant="text"
          @click="formDelete"
          >Delete
        </v-btn>
        <v-btn v-if="!formDataReadOnly" color="primary" variant="text" @click="formSubmit">Submit</v-btn>
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

// Schema validator for simplified JSON schema subset
function validateSchema(schema, path = 'root', isRoot = true) {
  // Must be an object
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return `${path}: Schema must be an object`
  }

  // Root level special validation
  if (isRoot) {
    if (!schema.properties) {
      return `${path}: Root schema must have "properties"`
    }

    const propertyNames = Object.keys(schema.properties)
    if (propertyNames.length !== 1 || propertyNames[0] !== 'data') {
      return `${path}: Root schema must have exactly one property called "data"`
    }

    // Check that data field is not an array at root level
    const dataSchema = schema.properties.data
    if (dataSchema.type === 'array') {
      return `${path}.properties.data: Root "data" field cannot be of type "array"`
    }
  }

  // If it has properties, validate them
  if (schema.properties) {
    if (typeof schema.properties !== 'object' || Array.isArray(schema.properties)) {
      return `${path}.properties: Must be an object`
    }

    // Validate each property
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const fieldPath = `${path}.properties.${fieldName}`
      const fieldError = validateFieldSchema(fieldSchema, fieldPath, false)
      if (fieldError !== true) {
        return fieldError
      }
    }
  }

  // If it has required, validate it
  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required)) {
      return `${path}.required: Must be an array`
    }
    // Check all required fields exist in properties
    if (schema.properties) {
      for (const req of schema.required) {
        if (!(req in schema.properties)) {
          return `${path}.required: Field "${req}" not found in properties`
        }
      }
    }
  }

  return true
}

function validateFieldSchema(fieldSchema, path, isRoot = false) {
  if (typeof fieldSchema !== 'object' || fieldSchema === null || Array.isArray(fieldSchema)) {
    return `${path}: Field schema must be an object`
  }

  // Check for enum
  if (fieldSchema.enum) {
    if (!Array.isArray(fieldSchema.enum)) {
      return `${path}.enum: Must be an array`
    }
    return true
  }

  // Check for pattern (must be string type)
  if (fieldSchema.pattern) {
    if (fieldSchema.type !== 'string') {
      return `${path}: Pattern can only be used with type "string"`
    }
    // Validate regex pattern
    try {
      new RegExp(fieldSchema.pattern)
    } catch (e) {
      return `${path}.pattern: Invalid regex pattern`
    }
    return true
  }

  // Check type
  const type = fieldSchema.type
  if (!type) {
    return `${path}: Missing "type" field`
  }

  const validTypes = ['string', 'integer', 'number', 'boolean', 'object', 'array']
  if (!validTypes.includes(type)) {
    return `${path}.type: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`
  }

  // Validate object type recursively
  if (type === 'object') {
    return validateSchema(fieldSchema, path, false)
  }

  // Validate array type
  if (type === 'array') {
    if (fieldSchema.items) {
      const itemError = validateFieldSchema(fieldSchema.items, `${path}.items`, false)
      if (itemError !== true) {
        return itemError
      }
    }
    if (fieldSchema.uniqueItems !== undefined && typeof fieldSchema.uniqueItems !== 'boolean') {
      return `${path}.uniqueItems: Must be a boolean`
    }
  }

  return true
}

// Validation rules for JSON
const modelValidationRules = computed(() => [
  (value) => {
    if (!value) return true

    let parsed
    try {
      parsed = JSON.parse(value)
    } catch (e) {
      return 'Invalid JSON format'
    }

    // Only validate schema structure for dynamic models
    if (isDynamic.value) {
      const schemaError = validateSchema(parsed)
      if (schemaError !== true) {
        return `Invalid schema: ${schemaError}`
      }
    }

    return true
  }
])

function initializeFormState() {
  // Initialize form state based on route and model type
  if (isStatic.value) {
    // Static mode: always read-only, no modify toggle, no delete button
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = false
    formButtonDeleteShow.value = false
  } else if (route.params.key_model_id !== '_new') {
    // Dynamic mode: existing record - read-only with delete button, no modify/submit
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = false
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
