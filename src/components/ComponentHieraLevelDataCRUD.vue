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
        <!-- Section 1: Top Switch -->
        <v-switch
          key="hiera-field-modify-switch"
          v-show="formButtonEditShow"
          v-model="formDataReadOnly"
          :true-value="false"
          :false-value="true"
          label="Modify"
          class="mb-4"
        ></v-switch>

        <!-- Section 2: Core Identification Fields -->
        <v-autocomplete
          key="hiera-field-level-id"
          v-model="formData.level_id"
          :readonly="formInputLevelIdReadOnly"
          :rules="[validateLevelId]"
          :items="availableLevels"
          :loading="loadingLevels"
          append-inner-icon="mdi-layers"
          label="Level ID"
          @update:search="fetchAvailableLevels"
          @focus="fetchAvailableLevels('')"
          class="mb-4"
        ></v-autocomplete>
        <v-text-field
          key="hiera-field-data-id"
          v-model="formData.id"
          :readonly="formInputDataIdReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-identifier"
          label="Data ID"
          class="mb-4"
        ></v-text-field>
        <v-autocomplete
          key="hiera-field-key-id"
          v-model="formData.key_id"
          :readonly="formInputKeyIdReadOnly"
          :rules="[validateKeyId]"
          :items="availableKeys"
          :loading="loadingKeys"
          append-inner-icon="mdi-key"
          label="Key ID"
          @update:search="fetchAvailableKeys"
          @focus="fetchAvailableKeys('')"
          class="mb-4"
        ></v-autocomplete>
        <v-text-field
          key="hiera-field-priority"
          v-model.number="formData.priority"
          :readonly="formInputPriorityReadOnly"
          :rules="[
            () =>
              (formData.priority !== null &&
                formData.priority !== undefined &&
                formData.priority !== '') ||
              'This field is required'
          ]"
          type="number"
          append-inner-icon="mdi-numeric"
          label="Priority"
          class="mb-4"
        ></v-text-field>

        <!-- Section 3: Dynamic Fact Fields -->
        <template
          v-for="field in factFields"
          :key="`hiera-fact-field-${field}`"
        >
          <v-autocomplete
            v-model="factValues[field]"
            :readonly="formInputFactsReadOnly"
            :label="`Fact: ${field}`"
            :rules="[(v) => !!cleanFactValue(v) || 'This field is required']"
            :items="getFactItems(field)"
            :loading="loadingFactSuggestions[field]"
            append-inner-icon="mdi-tag"
            @update:search="(search) => fetchFactSuggestions(field, search)"
            @focus="fetchFactSuggestions(field, '')"
            class="mb-4"
          ></v-autocomplete>
        </template>

        <!-- Section 4: Data Editor Toggle Header -->
        <div
          v-if="keyModelSchema"
          key="hiera-data-toggle-row"
          class="d-flex align-center mb-2 mt-4"
        >
          <div class="v-label theme--light">
            {{ `Data (${dataType})` }}
          </div>
          <v-spacer></v-spacer>
          <v-btn-toggle
            v-model="useSchemaForm"
            density="compact"
            mandatory
            color="primary"
            variant="outlined"
          >
            <v-btn :value="true" prepend-icon="mdi-form-select">Form</v-btn>
            <v-btn :value="false" prepend-icon="mdi-code-json">JSON</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Section 5: Schema Form View -->
        <div
          v-if="keyModelSchema && useSchemaForm"
          key="hiera-data-schema-form-container"
          class="schema-form-container pa-4 border rounded mb-4"
          :class="{ 'bg-grey-lighten-4': formDataReadOnly }"
        >
          <JsonForms
            :data="schemaFormData"
            :schema="resolvedSchema"
            :renderers="renderers"
            :readonly="formDataReadOnly"
            @change="handleSchemaFormChange"
          />
        </div>

        <!-- Section 6: Raw JSON View -->
        <v-textarea
          v-if="!useSchemaForm || !keyModelSchema"
          key="hiera-data-raw-json-textarea"
          v-model="formData.dataJson"
          :readonly="formDataReadOnly || !keyModelSchema"
          :rules="[validateData]"
          append-inner-icon="mdi-code-json"
          :label="!keyModelSchema ? 'Data' : `Data (${dataType}) - Raw JSON`"
          :placeholder="
            keyModelSchema ? defaultDataValue : 'Waiting for valid key id...'
          "
          rows="8"
          class="mb-4"
        ></v-textarea>

        <!-- Section 7: Model Information -->
        <v-alert
          v-if="keyModelId && keyModelType"
          key="hiera-data-model-alert"
          type="info"
          density="compact"
          variant="tonal"
          class="mt-4"
        >
          Model:
          <router-link
            :to="{
              name:
                keyModelType === 'static'
                  ? 'HieraKeyModelsStaticCRUD'
                  : 'HieraKeyModelsDynamicCRUD',
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
        <v-btn
          color="primary"
          variant="text"
          @click="formSubmit"
          :disabled="!formDataValid || !canCreate"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { PERMISSIONS } from '@/common/permissions'
import { reactive, ref, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ajv from 'ajv'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers } from '@jsonforms/vue-vuetify'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { useCrudReload } from '@/common/crud_generic'
import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()
const loginData = loginDataStore()

const renderers = Object.freeze(vuetifyRenderers)
const useSchemaForm = ref(true)
const schemaFormData = ref({})

// Guard to prevent circular updates
let isSyncing = false

function hasLevelDataPermission(action, keyId = null) {
  if (loginData.hasPermission(PERMISSIONS.HIERA.LEVEL_DATA[action])) {
    return true
  }
  if (
    keyId &&
    loginData.hasPermission(
      PERMISSIONS.HIERA.LEVEL_DATA[action + '_SPECIFIC'](keyId)
    )
  ) {
    return true
  }
  return false
}

// Helper to normalize schema for better JsonForms rendering
// Specifically handles "anyOf": [{type: "X"}, {type: "null"}] patterns
// and transforms them into standard types that renderers understand better
function normalizeSchema(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema
  }

  // Deep clone to avoid mutating the original ref
  const newSchema = JSON.parse(JSON.stringify(schema))

  const walk = (s) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return

    const nullableFields = new Set()

    // Handle properties and identify which ones are nullable
    if (s.properties) {
      for (const [key, propSchema] of Object.entries(s.properties)) {
        let isNullable = false
        if (Array.isArray(propSchema.anyOf)) {
          isNullable = propSchema.anyOf.some((branch) => branch.type === 'null')
        } else if (Array.isArray(propSchema.type)) {
          isNullable = propSchema.type.includes('null')
        }

        if (isNullable) {
          nullableFields.add(key)
        }
        walk(propSchema)
      }
    }

    // Remove nullable fields from required array at this level
    if (s.required && Array.isArray(s.required)) {
      s.required = s.required.filter((field) => !nullableFields.has(field))
      if (s.required.length === 0) {
        delete s.required
      }
    }

    // Handle anyOf with null for the current level
    if (Array.isArray(s.anyOf)) {
      const nonNullTypes = s.anyOf.filter((branch) => branch.type !== 'null')
      const hasNull = s.anyOf.some((branch) => branch.type === 'null')

      if (hasNull && nonNullTypes.length === 1) {
        const actual = nonNullTypes[0]
        delete s.anyOf

        // Preserve metadata
        const title = s.title
        const description = s.description
        const defValue = s.default

        Object.assign(s, actual)

        if (title) s.title = title
        if (description) s.description = description
        if (defValue !== undefined) s.default = defValue

        // Support nullability in a way that doesn't trigger the "AnyOf" selection UI
        if (Array.isArray(s.enum)) {
          // For enums, use oneOf with const values for a clean dropdown with a null option
          s.oneOf = s.enum.map((v) => ({
            const: v,
            title: v === null ? 'null' : String(v)
          }))
          if (!s.oneOf.some((o) => o.const === null)) {
            s.oneOf.push({ const: null, title: 'null' })
          }
          delete s.enum
          delete s.type
        } else if (
          s.type &&
          !['object', 'array'].includes(s.type) &&
          !Array.isArray(s.type)
        ) {
          // For simple primitives, nullable type array is usually handled well
          s.type = [s.type, 'null']
        }
        // Note: we leave objects and arrays as type: 'object'/'array' to keep their renderers happy
      }
    }

    // Recurse
    if (s.properties) {
      Object.values(s.properties).forEach(walk)
    }
    if (s.items) {
      walk(s.items)
    }
    if (s.$defs) {
      Object.values(s.$defs).forEach(walk)
    }
  }

  walk(newSchema)
  return newSchema
}

// Computed schema that includes $defs for resolving references
const resolvedSchema = computed(() => {
  if (
    !keyModelSchema.value ||
    !keyModelSchema.value.properties ||
    !keyModelSchema.value.properties.data
  ) {
    return null
  }

  console.log('--- SCHEMA DEBUG DUMP ---')
  console.log(
    'Original Server Schema:\n',
    JSON.stringify(keyModelSchema.value, null, 2)
  )

  let baseSchema = keyModelSchema.value.properties.data
  let finalSchema = null

  // If the root is a reference, resolve it to provide a stable base schema to JsonForms
  if (baseSchema.$ref && baseSchema.$ref.startsWith('#/$defs/')) {
    const defName = baseSchema.$ref.split('/').pop()
    if (keyModelSchema.value.$defs && keyModelSchema.value.$defs[defName]) {
      finalSchema = {
        ...keyModelSchema.value.$defs[defName],
        $defs: keyModelSchema.value.$defs
      }
    }
  }

  if (!finalSchema) {
    // Fallback: merge $defs into the sub-schema
    finalSchema = {
      ...baseSchema,
      $defs: keyModelSchema.value.$defs
    }
  }

  const result = normalizeSchema(finalSchema)
  console.log(
    'Transformed Schema (for JsonForms):\n',
    JSON.stringify(result, null, 2)
  )
  console.log('-------------------------')

  return result
})

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

const formButtonEditShow = computed(() => {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) return false
  return hasLevelDataPermission('UPDATE', formData.key_id)
})

const formButtonDeleteShow = computed(() => {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) return false
  return hasLevelDataPermission('DELETE', formData.key_id)
})

const canCreate = computed(() => {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (!isNew) return true

  return hasLevelDataPermission('CREATE', formData.key_id)
})

const formInputLevelIdReadOnly = ref(true)
const formInputDataIdReadOnly = ref(true)
const formInputKeyIdReadOnly = ref(true)
const formInputPriorityReadOnly = ref(true)
const formInputFactsReadOnly = ref(true)

// Sync formData.dataJson to schemaFormData
watch(
  () => formData.dataJson,
  (newVal) => {
    if (isSyncing) return
    try {
      if (newVal) {
        const parsed = JSON.parse(newVal)
        // Only update if it's different to avoid circular updates
        if (JSON.stringify(parsed) !== JSON.stringify(schemaFormData.value)) {
          isSyncing = true
          schemaFormData.value = parsed
          nextTick(() => {
            isSyncing = false
          })
        }
      }
    } catch {
      // Ignore invalid JSON during typing
    }
  }
)

// Handle changes from JsonForms
function handleSchemaFormChange(event) {
  if (isSyncing) return

  const jsonString = JSON.stringify(event.data, null, 2)
  if (formData.dataJson !== jsonString) {
    isSyncing = true
    formData.dataJson = jsonString
    // Use spread only for objects to ensure a new reference, but handle primitives directly
    if (typeof event.data === 'object' && event.data !== null) {
      schemaFormData.value = Array.isArray(event.data)
        ? [...event.data]
        : { ...event.data }
    } else {
      schemaFormData.value = event.data
    }
    nextTick(() => {
      isSyncing = false
    })
  }
}

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

  const promise = api.get(
    `/api/v1/hiera/key_models/${modelType}/${modelId}`,
    null,
    true
  )
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
      availableLevels.value = data.result.map((item) => item.id)
    }
  } catch {
    availableLevels.value = []
  } finally {
    loadingLevels.value = false
  }
}

// Fetch available keys
async function fetchAvailableKeys(search) {
  loadingKeys.value = true
  try {
    const isNewLevel = route.params.level_id === '_new'
    const isNewData = route.params.data_id === '_new'
    const isNewKey = route.params.key_id === '_new'
    const isNew = isNewLevel && isNewData && isNewKey

    const hasGlobalCreate = loginData.hasPermission(
      PERMISSIONS.HIERA.LEVEL_DATA.CREATE
    )
    if (isNew && !hasGlobalCreate) {
      const allowedKeys = loginData.getPermissionMatches(
        '^HIERA:LEVEL_DATA:(.*):CREATE$'
      )
      if (search) {
        availableKeys.value = allowedKeys.filter((k) =>
          k.toLowerCase().includes(search.toLowerCase())
        )
      } else {
        availableKeys.value = allowedKeys
      }
      return
    }

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
      availableKeys.value = data.result.map((item) => item.id)
    }
  } catch {
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
    const data = await api.get(
      '/api/v1/nodes/_distinct_fact_values',
      params,
      true
    )
    if (data && data.result) {
      factSuggestions[factName] = data.result.map((item) => item.value)
    } else {
      factSuggestions[factName] = []
    }
  } catch {
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

// Auto-generate data_id based on level_id and fact values
const autoGeneratedDataId = computed(() => {
  if (!formData.level_id) return ''
  let dataId = formData.level_id
  factFields.value.forEach((field) => {
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
watch(
  () => formData.level_id,
  async (newLevelId) => {
    const isNewLevel = route.params.level_id === '_new'
    const isNewData = route.params.data_id === '_new'
    const isNewKey = route.params.key_id === '_new'
    const isNew = isNewLevel && isNewData && isNewKey

    if (isNew) {
      // Clear existing fact values
      Object.keys(factValues).forEach((key) => delete factValues[key])
      // Initialize new fact fields
      factFields.value.forEach((field) => {
        factValues[field] = ''
      })

      // Fetch level data and auto-fill priority
      if (newLevelId && newLevelId !== '') {
        try {
          const levelData = await fetchLevelData(newLevelId)
          if (
            levelData &&
            levelData.priority !== null &&
            levelData.priority !== undefined
          ) {
            formData.priority = levelData.priority
          }
        } catch {
          // Level doesn't exist yet, validation will handle it
        }
      }
    }
  }
)

// Key model schema for data validation
const keyModelSchema = ref(null)
const keyModelId = ref(null)
const keyModelType = ref(null) // 'static' or 'dynamic'

// Computed property to get the data type from schema
const dataType = computed(() => {
  if (
    !keyModelSchema.value ||
    !keyModelSchema.value.properties ||
    !keyModelSchema.value.properties.data
  ) {
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
watch(
  () => formData.key_id,
  async (newKeyId) => {
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
          const modelData = await fetchKeyModelData(
            keyModelType.value,
            keyData.key_model_id
          )
          if (modelData && modelData.model) {
            keyModelSchema.value = modelData.model
            if (isNew) {
              formData.dataJson = defaultDataValue.value
            }
          }
        } catch {
          keyModelSchema.value = null
        }
      }
    } catch {
      keyModelSchema.value = null
      keyModelId.value = null
      keyModelType.value = null
    }
  }
)

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
  } catch {
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
  } catch {
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
  } catch {
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
  } else {
    formInputLevelIdReadOnly.value = true
    formInputDataIdReadOnly.value = true
    formInputKeyIdReadOnly.value = true
    formInputPriorityReadOnly.value = true
    formInputFactsReadOnly.value = true
    formDataReadOnly.value = true
  }
  formGetData()
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(
  () => [route.params.level_id, route.params.data_id, route.params.key_id],
  () => {
    initializeFormState()
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Hiera Level Data: ${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
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

  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  let facts, data
  try {
    // Build facts from individual fact fields (clean the hint suffix)
    facts = {}
    factFields.value.forEach((field) => {
      facts[field] = cleanFactValue(factValues[field])
    })
    data = JSON.parse(formData.dataJson)
  } catch {
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

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

function formGetData() {
  const isNewLevel = route.params.level_id === '_new'
  const isNewData = route.params.data_id === '_new'
  const isNewKey = route.params.key_id === '_new'
  const isNew = isNewLevel && isNewData && isNewKey

  if (isNew) {
    formDataValid.value = false
    nextTick(() => {
      if (form.value) {
        form.value.resetValidation()
      }
    })
    formData['level_id'] = ''
    formData['id'] = ''
    formData['key_id'] = ''
    formData['priority'] = null
    formData['dataJson'] = ''
    // Clear fact values
    Object.keys(factValues).forEach((key) => delete factValues[key])
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
        Object.keys(factValues).forEach((key) => delete factValues[key])
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
