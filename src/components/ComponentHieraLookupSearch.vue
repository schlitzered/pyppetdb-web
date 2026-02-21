<template>
  <v-card>
    <v-card-text>
      <v-form ref="form" v-model="formValid">
        <v-text-field
          v-model="lookupKeyId"
          :rules="[() => !!lookupKeyId || 'Key ID is required']"
          label="Key ID"
          append-inner-icon="mdi-key"
          @keyup.enter="performLookup"
        ></v-text-field>

        <v-divider class="my-4"></v-divider>

        <h3 class="mb-3">Facts (Optional)</h3>
        <v-row v-for="(fact, index) in facts" :key="index" class="mb-2">
          <v-col cols="5">
            <v-text-field
              v-model="fact.name"
              label="Fact Name"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="fact.value"
              label="Fact Value"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-btn
              icon
              size="small"
              @click="removeFact(index)"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-btn
          @click="addFact"
          color="primary"
          variant="outlined"
          class="mb-4"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Fact
        </v-btn>

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
const facts = ref([])
const loading = ref(false)
const lookupResult = ref(null)
const lookupError = ref(null)

function addFact() {
  facts.value.push({ name: '', value: '' })
}

function removeFact(index) {
  facts.value.splice(index, 1)
}

function performLookup() {
  if (!lookupKeyId.value) return

  loading.value = true
  lookupResult.value = null
  lookupError.value = null

  // Build the facts array in the format "name:value"
  const factsArray = []
  facts.value.forEach(fact => {
    if (fact.name && fact.value) {
      factsArray.push(`${fact.name}:${fact.value}`)
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
