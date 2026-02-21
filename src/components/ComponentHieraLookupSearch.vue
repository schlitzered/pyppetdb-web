<template>
  <v-card>
    <v-card-text>
      <v-form ref="form" v-model="formValid">
        <v-autocomplete
          v-model="lookupKeyId"
          :rules="[() => !!lookupKeyId || 'Key ID is required']"
          :items="availableKeys"
          :loading="loadingKeys"
          label="Key ID"
          append-inner-icon="mdi-key"
          @update:search="fetchAvailableKeys"
          @focus="fetchAvailableKeys('')"
          @keyup.enter="performLookup"
        ></v-autocomplete>

        <v-divider class="my-4"></v-divider>

        <h3 class="mb-3">Facts (Optional)</h3>
        <v-progress-circular
          v-if="loadingLevels"
          indeterminate
          color="primary"
          class="mb-4"
        ></v-progress-circular>
        <v-autocomplete
          v-for="field in factFields"
          :key="field"
          :model-value="facts[field]"
          :label="`Fact: ${field}`"
          :items="getFactItems(field)"
          :loading="loadingFactSuggestions[field]"
          append-inner-icon="mdi-tag"
          clearable
          @update:search="(search) => fetchFactSuggestions(field, search)"
          @focus="fetchFactSuggestions(field, '')"
          @update:model-value="(val) => { facts[field] = cleanFactValue(val) }"
        ></v-autocomplete>

        <v-divider class="my-4"></v-divider>

        <v-btn
          @click="performLookup"
          color="primary"
          :loading="loading"
          :disabled="!lookupKeyId"
          block
        >
          <v-icon start>mdi-magnify</v-icon>
          Lookup
        </v-btn>
      </v-form>
    </v-card-text>

    <v-divider v-if="lookupResult"></v-divider>

    <v-card-text v-if="lookupResult">
      <h3 class="mb-3">Lookup Result:</h3>
      <v-card variant="outlined">
        <v-card-text>
          <pre class="lookup-result">{{ formatResult(lookupResult) }}</pre>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text v-if="lookupError">
      <v-alert
        type="error"
        variant="outlined"
      >
        {{ lookupError }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '@/api/common'

const form = ref(null)
const formValid = ref(false)
const lookupKeyId = ref('')
const facts = reactive({})
const loading = ref(false)
const lookupResult = ref(null)
const lookupError = ref(null)

// Autocomplete for keys
const availableKeys = ref([])
const loadingKeys = ref(false)

// Fact fields extracted from levels
const factFields = ref([])
const loadingLevels = ref(false)

// Autocomplete data for fact fields
const factSuggestions = reactive({})
const factSearchTerms = reactive({})
const loadingFactSuggestions = reactive({})

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
    const data = await api.get('/api/v1/hiera/keys/', params, true)
    if (data && data.result) {
      availableKeys.value = data.result.map(item => item.id)
    } else {
      availableKeys.value = []
    }
  } catch (e) {
    availableKeys.value = []
  } finally {
    loadingKeys.value = false
  }
}

// Fetch all levels and extract unique placeholders
async function fetchFactFieldsFromLevels() {
  loadingLevels.value = true
  try {
    const data = await api.get('/api/v1/hiera/levels/', { limit: 1000 }, true)
    if (data && data.result) {
      const uniquePlaceholders = new Set()
      const regex = /\{([^}]+)\}/g

      data.result.forEach(level => {
        let match
        while ((match = regex.exec(level.id)) !== null) {
          uniquePlaceholders.add(match[1])
        }
      })

      factFields.value = Array.from(uniquePlaceholders).sort()

      // Initialize fact values
      factFields.value.forEach(field => {
        if (!(field in facts)) {
          facts[field] = ''
        }
      })
    }
  } catch (e) {
    factFields.value = []
  } finally {
    loadingLevels.value = false
  }
}

// Get fact items including search term if not found
function getFactItems(factName) {
  const suggestions = factSuggestions[factName] || []
  const searchTerm = factSearchTerms[factName]

  if (!searchTerm) {
    return suggestions
  }

  // If search term exists and is not in suggestions, add it with a hint
  if (searchTerm && !suggestions.includes(searchTerm)) {
    return [...suggestions, `${searchTerm}`]
  }

  return suggestions
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

// Fetch fact fields on component mount
fetchFactFieldsFromLevels()

function performLookup() {
  if (!lookupKeyId.value) return

  loading.value = true
  lookupResult.value = null
  lookupError.value = null

  // Build the facts array in the format "name:value"
  const factsArray = []
  Object.entries(facts).forEach(([name, value]) => {
    if (name && value) {
      factsArray.push(`${name}:${value}`)
    }
  })

  // Build query parameters
  const params = {}
  if (factsArray.length > 0) {
    params.fact = factsArray
  }

  api.get(`/api/v1/hiera/lookup/${lookupKeyId.value}`, params)
    .then((data) => {
      if (data) {
        lookupResult.value = data
      }
      loading.value = false
    })
    .catch((error) => {
      lookupError.value = error.message || 'Failed to perform lookup'
      loading.value = false
    })
}

function formatResult(result) {
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2)
  }
  return result
}
</script>

<style scoped>
.lookup-result {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 0.9em;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  color: rgb(var(--v-theme-on-surface));
  padding: 12px;
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
}
</style>
