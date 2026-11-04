<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Audit Log
        </h1>
      </template>
      <template #right>
        <Button
          label="Verify chain"
          icon="pi pi-shield"
          :loading="verifying"
          class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 px-4 font-medium"
          @click="verifyChain"
        />
      </template>
    </ResponsiveToolbar>

    <Message
      v-if="verifyResult"
      :severity="verifyResult.ok ? 'success' : 'error'"
      closable
      @close="verifyResult = null"
    >
      <template v-if="verifyResult.ok">
        Chain OK: {{ verifyResult.checked }} events checked (seq
        {{ verifyResult.first_seq ?? '–' }} to
        {{ verifyResult.last_seq ?? '–' }}),
        {{ verifyResult.unsealed }} unsealed.
      </template>
      <template v-else>
        Chain broken at seq {{ verifyResult.error?.seq ?? '–' }} (event
        {{ verifyResult.error?.id ?? '–' }}): {{ verifyResult.error?.reason }}.
        {{ verifyResult.checked }} events checked.
      </template>
    </Message>

    <Accordion v-model:value="tableExpPan" multiple>
      <AccordionPanel value="filters">
        <AccordionHeader>Search Filters</AccordionHeader>
        <AccordionContent>
          <div
            class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2"
          >
            <div
              v-for="filter in resourceDef.searchFilters"
              :key="filter.key"
              class="flex flex-col gap-1"
            >
              <label
                :for="filter.key"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                {{ filter.label }}
              </label>
              <AutoComplete
                v-if="filter.type === 'autocomplete'"
                v-model="formSearchBy[filter.key]"
                :input-id="filter.key"
                :suggestions="eventSuggestions"
                dropdown
                class="w-full"
                input-class="w-full p-inputtext-sm"
                @complete="searchEvents"
                @update:model-value="debouncedSearch"
              />
              <Select
                v-else-if="filter.type === 'select'"
                v-model="formSearchBy[filter.key]"
                :input-id="filter.key"
                :options="filter.options"
                option-label="label"
                option-value="value"
                show-clear
                class="p-dropdown-sm"
                @change="handleSearch"
              />
              <DatePicker
                v-else-if="filter.type === 'datetime'"
                v-model="formSearchBy[filter.key]"
                :input-id="filter.key"
                show-time
                hour-format="24"
                show-button-bar
                class="w-full"
                input-class="p-inputtext-sm"
                @update:model-value="handleSearch"
              />
              <InputText
                v-else
                :id="filter.key"
                v-model="formSearchBy[filter.key]"
                class="p-inputtext-sm"
                @input="debouncedSearch"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div
      class="card border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm"
    >
      <AuditEventTable
        :items="tableItems as unknown as AuditEvent[]"
        :loading="tableLoading"
        :total-records="tableTotalItems"
        :rows="tableItemsPerPage"
        :first="(tablePage - 1) * tableItemsPerPage"
        :sort-field="tableSortBy[0]?.key"
        :sort-order="sortOrder"
        @page="onPage"
        @sort="onSort"
        @filter="applyFilter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import AuditEventTable from '@/components/special/AuditEventTable.vue'
import api from '@/api/client'
import { debounce } from '@/utils/debounce'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import type { AuditEvent } from '@/utils/audit'
import type { ResourceDefinition } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

interface VerifyResult {
  ok: boolean
  checked: number
  first_seq: number | null
  last_seq: number | null
  unsealed: number
  error: { seq: number | null; id: string | null; reason: string } | null
}

const {
  tableItems,
  tableLoading,
  tablePage,
  tableItemsPerPage,
  tableTotalItems,
  tableSortBy,
  tableExpPan,
  formSearchBy,
  getSearchData,
  loadFromUrl,
  getSearchDataTableEvent
} = useResourceListQuery({
  resourceDef: props.resourceDef
})

const sortOrder = computed(() =>
  tableSortBy[0] ? (tableSortBy[0].order === 'asc' ? 1 : -1) : undefined
)

const onPage = (event: { page: number; rows: number }) => {
  getSearchDataTableEvent({
    page: event.page + 1,
    itemsPerPage: event.rows,
    sortBy: tableSortBy,
    searchBy: []
  })
}

const onSort = (event: { sortField?: unknown; sortOrder?: number | null }) => {
  const key = typeof event.sortField === 'string' ? event.sortField : ''
  getSearchDataTableEvent({
    page: tablePage.value,
    itemsPerPage: tableItemsPerPage.value,
    sortBy: key ? [{ key, order: event.sortOrder === 1 ? 'asc' : 'desc' }] : [],
    searchBy: []
  })
}

const handleSearch = () => {
  getSearchData()
}

const debouncedSearch = debounce(handleSearch, 300)

// clicking an actor or transaction narrows the list to it
const applyFilter = (filters: Record<string, string>) => {
  Object.assign(formSearchBy, filters)
  getSearchData()
  const panels = Array.isArray(tableExpPan.value) ? tableExpPan.value : []
  if (!panels.includes('filters')) {
    tableExpPan.value = [...panels, 'filters']
  }
}

// the catalogue needs AUDIT:CONFIG::GET; without it the field stays free text
let eventNames: string[] | null = null
const eventSuggestions = ref<string[]>([])

const searchEvents = async (event: { query: string }) => {
  if (eventNames === null) {
    try {
      const data = await api.get<{ result: { name: string }[] }>(
        '/api/v1/audit/events',
        {},
        true
      )
      eventNames = (data?.result || []).map((e) => e.name)
    } catch {
      eventNames = []
    }
  }
  const query = (event.query || '').toLowerCase()
  eventSuggestions.value = eventNames.filter((n) => n.includes(query))
}

const verifying = ref(false)
const verifyResult = ref<VerifyResult | null>(null)

const verifyChain = async () => {
  verifying.value = true
  try {
    verifyResult.value = await api.get<VerifyResult>('/api/v1/audit/verify')
  } catch {
    verifyResult.value = null
  } finally {
    verifying.value = false
  }
}

onMounted(() => {
  loadFromUrl()
})
</script>
