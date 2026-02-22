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
        <v-autocomplete
          v-model="formData.level_id"
          :readonly="formInputLevelIdReadOnly"
          :rules="[validateLevelId]"
          :items="availableLevels"
          :loading="loadingLevels"
          append-inner-icon="mdi-layers"
          label="Level ID"
          @update:search="fetchAvailableLevels"
          @focus="fetchAvailableLevels('')"
        ></v-autocomplete>
        <v-text-field
          v-model="formData.id"
          :readonly="formInputDataIdReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-identifier"
          label="Data ID"
        ></v-text-field>
        <v-autocomplete
          v-model="formData.key_id"
          :readonly="formInputKeyIdReadOnly"
          :rules="[validateKeyId]"
          :items="availableKeys"
          :loading="loadingKeys"
          append-inner-icon="mdi-key"
          label="Key ID"
          @update:search="fetchAvailableKeys"
          @focus="fetchAvailableKeys('')"
        ></v-autocomplete>
        <v-text-field
          v-model.number="formData.priority"
          :readonly="formInputPriorityReadOnly"
          :rules="[() => formData.priority !== null && formData.priority !== undefined && formData.priority !== '' || 'This field is required']"
          type="number"
          append-inner-icon="mdi-numeric"
          label="Priority"
        ></v-text-field>
        <v-autocomplete
          v-for="field in factFields"
          :key="field"
          v-model="factValues[field]"
          :readonly="formInputFactsReadOnly"
          :label="`Fact: ${field}`"
          :rules="[(v) => !!cleanFactValue(v) || 'This field is required']"
          :items="getFactItems(field)"
          :loading="loadingFactSuggestions[field]"
          append-inner-icon="mdi-tag"
          @update:search="(search) => fetchFactSuggestions(field, search)"
          @focus="fetchFactSuggestions(field, '')"
        ></v-autocomplete>
        <v-textarea
          v-model="formData.dataJson"
          :readonly="formDataReadOnly || !keyModelSchema"
          :rules="[validateData]"
          append-inner-icon="mdi-code-json"
          :label="keyModelSchema ? `Data (${dataType})` : 'Data'"
          :placeholder="keyModelSchema ? defaultDataValue : 'Waiting for valid key id...'"
          rows="8"
        ></v-textarea>
        <v-alert
          v-if="keyModelId && keyModelType"
          type="info"
          density="compact"
          variant="tonal"
          class="mt-2"
        >
          Model:
          <router-link
            :to="{
              name: keyModelType === 'static' ? 'HieraKeyModelsStaticCRUD' : 'HieraKeyModelsDynamicCRUD',
              params: { key_model_id: keyModelId }
            }"
            target="_blank"
          >
            {{ keyModelId }}
          </router-link>
        </v-alert>
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
        <v-btn color="primary" variant="text" @click="formSubmit" :disabled="!formDataValid">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'
import Ajv from 'ajv'

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
    let url = `/api/v1/hiera/data/${formData.level_id}/${formData.id}/${formData.key_id}`
    api.delete(url).then(() => {
      router.push({
        name: 'HieraLevelDataSearch'
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
const formInputLevelIdReadOnly = ref(true)
const formInputDataIdReadOnly = ref(true)
const formInputKeyIdReadOnly = ref(true)
const formInputPriorityReadOnly = ref(true)
const formInputFactsReadOnly = ref(true)

// Autocomplete data
const availableLevels = ref([])
const availableKeys = ref([])
const loadingLevels = ref(false)
const loadingKeys = ref(false)

// Level data cache to avoid duplicate requests for same level_id
const levelCache = reactive({})

// Key data cache to avoid duplicate requests for same key_id
const keyCache = reactive({})

// Key model cache to avoid duplicate requests for same model id/type
const keyModelCache = reactive({})

function fetchLevelData(levelId) {
  if (!levelId) {
    return Promise.reject(new Error('Missing level id'))
  }

  const cached = levelCache[levelId]
  if (cached?.promise) {
    return cached.promise
  }

  const promise = api.get(`/api/v1/hiera/levels/${levelId}`, null, true)
  levelCache[levelId] = { promise }

  promise
    .then((data) => {
      levelCache[levelId] = { data }
    })
    .catch((error) => {
      levelCache[levelId] = { error }
      throw error
    })

  return promise
}

function fetchKeyData(keyId) {
  if (!keyId) {
    return Promise.reject(new Error('Missing key id'))
  }

  const cached = keyCache[keyId]
  if (cached?.promise) {
    return cached.promise
  }

  const promise = api.get(`/api/v1/hiera/keys/${keyId}`, null, true)
  keyCache[keyId] = { promise }

  promise
    .then((data) => {
      keyCache[keyId] = { data }
    })
    .catch((error) => {
      keyCache[keyId] = { error }
      throw error
    })

  return promise
}

function fetchKeyModelData(modelType, modelId) {
  if (!modelType || !modelId) {
    return Promise.reject(new Error('Missing key model info'))
  }

  const cacheKey = `${modelType}:${modelId}`
  const cached = keyModelCache[cacheKey]
  if (cached?.promise) {
    return cached.promise
  }

  const promise = api.get(`/api/v1/hiera/key_models/${modelType}/${modelId}`, null, true)
  keyModelCache[cacheKey] = { promise }

  promise
    .then((data) => {
      keyModelCache[cacheKey] = { data }
    })
    .catch((error) => {
      keyModelCache[cacheKey] = { error }
      throw error
    })

  return promise
}

// Fetch available levels
async function fetchAvailableLevels(search) {
  loadingLevels.value = true
  try {
    const params = {
      limit: 10,
      sort_by: 'id',
      sort_order: 'ascending'
    }
    if (search) {
      params.level_id = search
    }
    const data = await api.get('/api/v1/hiera/levels', params, true)
    if (data && data.result) {
      availableLevels.value = data.result.map(item => item.id)
    }
  } catch (e) {
    availableLevels.value = []
  } finally {
    loadingLevels.value = false
  }
}

// Fetch available keys
async function fetchAvailableKeys(search) {
  loadingKeys.value = true
  try {
    const params = {
      limit: 10,
      sort_by: 'id',
      sort_order: 'ascending'
    }
    if (search) {
      params.key_id = search
    }
    const data = await api.get('/api/v1/hiera/keys', params, true)
    if (data && data.result) {
      availableKeys.value = data.result.map(item => item.id)
    }
  } catch (e) {
    availableKeys.value = []
  } finally {
    loadingKeys.value = false
  }
}

// Extract placeholders from level_id and create fact fields
const factFields = computed(() => {
  if (!formData.level_id) return []
  const regex = /\{([^}]+)\}/g
  const fields = []
  let match
  while ((match = regex.exec(formData.level_id)) !== null) {
    fields.push(match[1])
  }
  return fields
})

// Individual fact values
const factValues = reactive({})

// Autocomplete data for fact fields
const factSuggestions = reactive({})
const factSearchTerms = reactive({})
const loadingFactSuggestions = reactive({})

// Computed suggestions that include the search term if not found
function getFactItems(factName) {
  const suggestions = factSuggestions[factName] || []
  const searchTerm = factSearchTerms[factName]

  if (!searchTerm) {
    return suggestions
  }

  if (searchTerm && !suggestions.includes(searchTerm)) {
    return [...suggestions, `${searchTerm}`]
  }

  return suggestions
}

// Fetch available fact values
async function fetchFactSuggestions(factName, search) {
  factSearchTerms[factName] = search || ''
  loadingFactSuggestions[factName] = true
  try {
    const params = {
      fact_id: factName,
      limit: 10,
      sort_by: 'value',
      sort_order: 'ascending'
    }
    if (search) {
      params.value = search
    }
    const data = await api.get('/api/v1/nodes/_distinct_fact_values', params, true)
    if (data && data.result) {
      factSuggestions[factName] = data.result.map(item => item.value)
    } else {
      factSuggestions[factName] = []
    }
  } catch (e) {
    factSuggestions[factName] = []
  } finally {
    loadingFactSuggestions[factName] = false
  }
}

// Clean up the value if it has the hint suffix
function cleanFactValue(value) {
  if (!value) return value
  const suffix = ' (not yet known in pyppetdb)'
  if (value.endsWith(suffix)) {
    return value.slice(0, -suffix.length)
  }
  return value
}

// Validate fact value (soft validation - warning only)
function validateFactValue(factName, value) {
  if (!value) {
    return 'This field is required'
  }
  return true
}

// Auto-generate data_id based on level_id and fact values
const autoGeneratedDataId = computed(() => {
  if (!formData.level_id) return ''
  let dataId = formData.level_id
  factFields.value.forEach(field => {
    const value = cleanFactValue(factValues[field]) || ''
    dataId = dataId.replace(`{${field}}`, value)
  })
  return dataId
})

// Watch for auto-generated data_id changes
watch(autoGeneratedDataId, (newValue) => {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) {
    formData.id = newValue
  }
})

// Watch for level_id changes to reset fact values and fetch priority
watch(() => formData.level_id, async (newLevelId) => {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) {
    // Clear existing fact values
    Object.keys(factValues).forEach(key => delete factValues[key])
    // Initialize new fact fields
    factFields.value.forEach(field => {
      factValues[field] = ''
    })

    // Fetch level data and auto-fill priority
    if (newLevelId && newLevelId !== '') {
      try {
        const levelData = await fetchLevelData(newLevelId)
        if (levelData && levelData.priority !== null && levelData.priority !== undefined) {
          formData.priority = levelData.priority
        }
      } catch (e) {
        // Level doesn't exist yet, validation will handle it
      }
    }
  }
})

// Key model schema for data validation
const keyModelSchema = ref(null)
const keyModelId = ref(null)
const keyModelType = ref(null) // 'static' or 'dynamic'

// Computed property to get the data type from schema
const dataType = computed(() => {
  if (!keyModelSchema.value || !keyModelSchema.value.properties || !keyModelSchema.value.properties.data) {
    return 'JSON'
  }
  const dataProperty = keyModelSchema.value.properties.data
  const type = dataProperty.type

  if (type === 'string') return 'string'
  if (type === 'integer') return 'integer'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  if (type === 'object') return 'object'

  return 'JSON'
})

// Computed default value based on data type
const defaultDataValue = computed(() => {
  const type = dataType.value

  if (type === 'string') return '""'
  if (type === 'integer' || type === 'number') return '0'
  if (type === 'boolean') return 'false'
  if (type === 'object') return '{}'

  return '{}'
})

// Watch for key_id changes to fetch associated model
watch(() => formData.key_id, async (newKeyId) => {
  if (!newKeyId || newKeyId === '') {
    keyModelSchema.value = null
    keyModelId.value = null
    keyModelType.value = null
    return
  }

  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  try {
    const keyData = await fetchKeyData(newKeyId)
    if (keyData && keyData.key_model_id) {
      keyModelId.value = keyData.key_model_id

      // Determine if static or dynamic based on prefix
      if (keyData.key_model_id.startsWith('static:')) {
        keyModelType.value = 'static'
      } else {
          keyModelType.value = 'dynamic'
        }
      try {
        const modelData = await fetchKeyModelData(keyModelType.value, keyData.key_model_id)
        if (modelData && modelData.model) {
          keyModelSchema.value = modelData.model
          if (isNew) {
            formData.dataJson = defaultDataValue.value
          }
        }
      } catch (e) {
        keyModelSchema.value = null
      }
    }
  } catch (e) {
    keyModelSchema.value = null
    keyModelId.value = null
    keyModelType.value = null
  }
})

async function validateLevelId(value) {
  if (!value) {
    return 'This field is required'
  }

  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (!isNew) {
    return true
  }

  try {
    await fetchLevelData(value)
    return true
  } catch (e) {
    return 'Level does not exist'
  }
}

async function validateKeyId(value) {
  if (!value) {
    return 'This field is required'
  }

  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (!isNew) {
    return true
  }

  try {
    await fetchKeyData(value)
    return true
  } catch (e) {
    return 'Key does not exist'
  }
}

function validateData(value) {
  if (!value) {
    return 'This field is required'
  }

  let parsed
  try {
    parsed = JSON.parse(value)
  } catch (e) {
    return 'Invalid JSON format'
  }

  // If we have a schema, validate against it
  if (keyModelSchema.value) {
    try {
      const ajv = new Ajv()
      const validate = ajv.compile(keyModelSchema.value)

      // Wrap the parsed data in {"data": <value>} for schema validation
      const wrappedData = { data: parsed }
      const valid = validate(wrappedData)

      if (!valid) {
        const schemaJson = JSON.stringify(keyModelSchema.value, null, 2)
        return `Schema validation failed: ${ajv.errorsText(validate.errors)}\n\nExpected Schema:\n${schemaJson}`
      }
    } catch (e) {
      return `Schema validation error: ${e.message}`
    }
  }

  return true
}

function initializeFormState() {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) {
    formInputLevelIdReadOnly.value = false
    formInputDataIdReadOnly.value = true
    formInputKeyIdReadOnly.value = false
    formInputPriorityReadOnly.value = true
    formInputFactsReadOnly.value = false
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
  } else {
    formInputLevelIdReadOnly.value = true
    formInputDataIdReadOnly.value = true
    formInputKeyIdReadOnly.value = true
    formInputPriorityReadOnly.value = true
    formInputFactsReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
  }
  formGetData()
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(() => [route.params.level_id, route.params.data_id, route.params.key_id], () => {
  initializeFormState()
})

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Hiera Level Data: ${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
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

  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  let facts, data
  try {
    // Build facts from individual fact fields (clean the hint suffix)
    facts = {}
    factFields.value.forEach(field => {
      facts[field] = cleanFactValue(factValues[field])
    })
    data = JSON.parse(formData.dataJson)
  } catch (e) {
    return
  }

  let method = 'put'
  let url = `/api/v1/hiera/data/${formData.level_id}/${formData.id}/${formData.key_id}`
  let requestData = {}

  if (isNew) {
    method = 'post'
    requestData = {
      priority: formData.priority,
      facts: facts,
      data: data
    }
  } else {
    requestData = {
      data: data
    }
  }

  api.request(method, url, requestData).then(() => {
    if (isNew) {
      formButtonDeleteShow.value = true
      router.push({
        name: 'HieraLevelDataCRUD',
        params: {
          level_id: formData.level_id,
          data_id: formData.id,
          key_id: formData.key_id
        }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['level_id'] = ''
    formData['id'] = ''
    formData['key_id'] = ''
    formData['priority'] = null
    formData['dataJson'] = ''
    // Clear fact values
    Object.keys(factValues).forEach(key => delete factValues[key])
  } else {
    const url = `/api/v1/hiera/data/${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
    api.get(url).then((data) => {
      if (data) {
        formData['level_id'] = data['level_id']
        formData['id'] = data['id']
        formData['key_id'] = data['key_id']
        formData['priority'] = data['priority']
        formData['dataJson'] = JSON.stringify(data['data'], null, 2)

        // Populate factValues from the facts object
        Object.keys(factValues).forEach(key => delete factValues[key])
        if (data['facts']) {
          Object.entries(data['facts']).forEach(([key, value]) => {
            factValues[key] = value
          })
        }
      }
    })
  }
}
</script>
