<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Hiera Lookup
        </h1>
      </template>
    </ResponsiveToolbar>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        class="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
      >
        <template #content>
          <form @submit.prevent="performLookup" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="lookupKeyId"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Key ID *
              </label>
              <AutoComplete
                id="lookupKeyId"
                v-model="lookupKeyId"
                :suggestions="availableKeys"
                @complete="searchKeys"
                :dropdown="true"
                :complete-on-focus="true"
                placeholder="Select or type key..."
                class="w-full"
              />
            </div>

            <div class="flex items-center gap-2 py-2">
              <ToggleSwitch id="lookupMerge" v-model="lookupMerge" />
              <label
                for="lookupMerge"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Merge Data
              </label>
            </div>

            <div v-if="factFields.length > 0" class="flex flex-col gap-3">
              <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                Facts (Optional)
              </h3>
              <div
                v-for="field in factFields"
                :key="field"
                class="flex flex-col gap-1"
              >
                <label
                  :for="field"
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >
                  {{ field }}
                </label>
                <AutoComplete
                  :id="field"
                  v-model="facts[field]"
                  :suggestions="factSuggestions[field] || []"
                  @complete="searchFactSuggestions($event, field)"
                  :dropdown="true"
                  :complete-on-focus="true"
                  placeholder="Select or type value..."
                  class="w-full"
                />
              </div>
            </div>

            <Button
              type="submit"
              label="Lookup"
              icon="pi pi-search"
              :disabled="!lookupKeyId"
              :loading="loading"
              class="w-full bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 mt-4"
            />
          </form>
        </template>
      </Card>

      <div class="lg:col-span-2 flex flex-col gap-4">
        <Card
          v-if="lookupResult"
          class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                Lookup Result
              </span>
            </div>
          </template>
          <template #content>
            <div
              class="rounded bg-zinc-950 p-4 border border-zinc-800 overflow-x-auto"
            >
              <pre
                class="font-mono text-sm text-zinc-100 whitespace-pre-wrap break-all"
                >{{ formattedResult }}</pre
              >
            </div>
          </template>
        </Card>

        <div
          v-if="lookupError"
          class="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg flex items-start gap-3"
        >
          <i class="pi pi-exclamation-circle text-lg mt-0.5"></i>
          <div>
            <h4 class="font-bold">Lookup Failed</h4>
            <p class="text-sm mt-1">{{ lookupError }}</p>
          </div>
        </div>

        <div
          v-if="!lookupResult && !lookupError"
          class="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/10"
        >
          <i
            class="pi pi-search text-4xl text-zinc-400 dark:text-zinc-600 mb-3"
          ></i>
          <span class="text-zinc-500 dark:text-zinc-400 font-medium">
            Enter a key and parameters to run Hiera lookup
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'

const lookupKeyId = ref('')
const lookupMerge = ref(false)
const facts = reactive<Record<string, string>>({})
const loading = ref(false)
const lookupResult = ref<any>(null)
const lookupError = ref<string | null>(null)

const availableKeys = ref<string[]>([])
const factFields = ref<string[]>([])
const factSuggestions = reactive<Record<string, string[]>>({})

interface AutocompleteCompleteEvent {
  query: string
}

const searchKeys = async (event: AutocompleteCompleteEvent) => {
  try {
    const params: Record<string, any> = {
      limit: 10,
      sort: 'id',
      sort_order: 'ascending'
    }
    if (event.query) {
      params.key_id = event.query
    }
    const response = await api.get<{ result: Array<{ id: string }> }>(
      '/api/v1/hiera/keys',
      params
    )
    if (response && response.result) {
      availableKeys.value = response.result.map((item) => item.id)
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchFactFields = async () => {
  try {
    const response = await api.get<{ result: Array<{ id: string }> }>(
      '/api/v1/hiera/levels',
      {
        limit: 1000
      }
    )
    if (response && response.result) {
      const placeholders = new Set<string>()
      const regex = /\{([^}]+)\}/g
      response.result.forEach((level) => {
        let match
        while ((match = regex.exec(level.id)) !== null) {
          placeholders.add(match[1])
        }
      })
      factFields.value = Array.from(placeholders).sort()
      factFields.value.forEach((field) => {
        if (!(field in facts)) {
          facts[field] = ''
        }
        factSuggestions[field] = []
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const searchFactSuggestions = async (
  event: AutocompleteCompleteEvent,
  field: string
) => {
  try {
    const params: Record<string, any> = {
      fact_id: field,
      limit: 10,
      sort_by: 'value',
      sort_order: 'ascending'
    }
    const response = await api.get<{ result: Array<{ value: any }> }>(
      '/api/v1/nodes/_distinct_fact_values',
      params,
      true
    )
    if (response && response.result) {
      const allValues = response.result.map((item) => String(item.value))
      if (event.query) {
        const queryLower = event.query.toLowerCase()
        const filtered = allValues.filter((val) =>
          val.toLowerCase().includes(queryLower)
        )
        if (!filtered.some((x) => x.toLowerCase() === queryLower)) {
          filtered.push(event.query)
        }
        factSuggestions[field] = filtered
      } else {
        factSuggestions[field] = allValues
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const performLookup = async () => {
  if (!lookupKeyId.value) return
  loading.value = true
  lookupResult.value = null
  lookupError.value = null
  const factsArray: string[] = []
  Object.entries(facts).forEach(([name, value]) => {
    if (name && value) {
      factsArray.push(`${name}:${value}`)
    }
  })
  const params: Record<string, any> = {
    merge: lookupMerge.value
  }
  if (factsArray.length > 0) {
    params.fact = factsArray
  }
  try {
    const endpoint = `/api/v1/hiera/lookup/${encodeURIComponent(lookupKeyId.value)}`
    const response = await api.get<any>(endpoint, params)
    if (response) {
      lookupResult.value = response
    }
  } catch (error: any) {
    lookupError.value = error.message || 'Failed to perform lookup'
  } finally {
    loading.value = false
  }
}

const formattedResult = computed(() => {
  if (!lookupResult.value) return ''
  return JSON.stringify(lookupResult.value.data, null, 2)
})

onMounted(() => {
  fetchFactFields()
})
</script>
