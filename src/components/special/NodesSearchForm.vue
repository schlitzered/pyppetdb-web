<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Nodes
        </h1>
      </template>
      <template #right>
        <Button
          v-if="canCreate"
          icon="pi pi-plus"
          label="New"
          class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 px-4 font-medium"
          @click="handleCreate"
        />
      </template>
    </ResponsiveToolbar>

    <Accordion v-model:value="tableExpPan" multiple class="w-full">
      <AccordionPanel value="search">
        <AccordionHeader>Search Filters</AccordionHeader>
        <AccordionContent>
          <div
            class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2"
          >
            <div class="flex flex-col gap-1">
              <label
                for="node_id"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Node Name
              </label>
              <InputText
                id="node_id"
                v-model="formSearchBy.node_id"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label
                for="environment"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Environment
              </label>
              <InputText
                id="environment"
                v-model="formSearchBy.environment"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label
                for="disabled"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Disabled
              </label>
              <Select
                id="disabled"
                v-model="formSearchBy.disabled"
                :options="tableGenericDropdownOptions"
                option-label="label"
                option-value="value"
                show-clear
                @change="handleSearch"
                class="p-dropdown-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label
                for="outdated_threshold"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Outdated Threshold
              </label>
              <InputText
                id="outdated_threshold"
                v-model="formSearchBy.outdated_threshold"
                @input="handleThresholdInput"
                placeholder="YYYY-MM-DDTHH:MM:SS"
                class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
              <span
                v-if="outdatedThresholdError"
                class="text-xs text-rose-500 mt-1"
              >
                {{ outdatedThresholdError }}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="fact">
        <AccordionHeader>Fact Search</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-3">
            <div
              v-for="(fact, index) in formSearchBy.fact"
              :key="index"
              class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div class="md:col-span-4 flex flex-col gap-1">
                <label
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >Fact Name</label
                >
                <InputText
                  v-model="fact.fact_name"
                  @input="debouncedSearch"
                  class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div class="md:col-span-3 flex flex-col gap-1">
                <label
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >Operator</label
                >
                <Select
                  v-model="fact.operator"
                  :options="formSearchByFactsOperators"
                  @change="handleSearch"
                  class="p-dropdown-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div class="md:col-span-2 flex flex-col gap-1">
                <label
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >Type</label
                >
                <Select
                  v-model="fact.type"
                  :options="formSearchByFactsTypes"
                  @change="handleSearch"
                  class="p-dropdown-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div class="md:col-span-2 flex flex-col gap-1">
                <label
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >Value</label
                >
                <InputText
                  v-model="fact.value"
                  @input="debouncedSearch"
                  class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div class="md:col-span-1 flex justify-end">
                <Button
                  icon="pi pi-minus"
                  class="bg-rose-600 hover:bg-rose-700 text-white border-none p-2"
                  @click="formSearchByFactsRemove(index)"
                />
              </div>
            </div>
            <div>
              <Button
                label="Add Fact Filter"
                icon="pi pi-plus"
                class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                @click="formSearchByFactsAdd"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
      <button
        type="button"
        @click="toggleStatus('^unchanged$')"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left',
          isStatusActive('^unchanged$')
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500'
        ]"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-check-circle text-emerald-500"></i>
          <span>Unchanged</span>
        </div>
        <span
          class="text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-400"
        >
          {{ tableItemsMeta.status_unchanged ?? 0 }}
        </span>
      </button>

      <button
        type="button"
        @click="toggleStatus('^changed$')"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left',
          isStatusActive('^changed$')
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-700 dark:text-amber-400 font-semibold shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500'
        ]"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-circle text-amber-500"></i>
          <span>Changed</span>
        </div>
        <span
          class="text-sm font-bold bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded text-amber-800 dark:text-amber-400"
        >
          {{ tableItemsMeta.status_changed ?? 0 }}
        </span>
      </button>

      <button
        type="button"
        @click="toggleStatus('^failed$')"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left',
          isStatusActive('^failed$')
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-700 dark:text-rose-400 font-semibold shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-rose-500'
        ]"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-times-circle text-rose-500"></i>
          <span>Failed</span>
        </div>
        <span
          class="text-sm font-bold bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded text-rose-800 dark:text-rose-400"
        >
          {{ tableItemsMeta.status_failed ?? 0 }}
        </span>
      </button>

      <button
        type="button"
        @click="toggleStatus('^unreported$')"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left',
          isStatusActive('^unreported$')
            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
        ]"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-question-circle text-zinc-500 dark:text-zinc-400"></i>
          <span>Unreported</span>
        </div>
        <span
          class="text-sm font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300"
        >
          {{ tableItemsMeta.status_unreported ?? 0 }}
        </span>
      </button>

      <button
        type="button"
        @click="toggleStatus('^outdated$')"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left',
          isStatusActive('^outdated$')
            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-500 text-zinc-800 dark:text-zinc-200 font-semibold shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'
        ]"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-clock text-zinc-500"></i>
          <span>Outdated</span>
        </div>
        <span
          class="text-sm font-bold bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200"
        >
          {{ tableItemsMeta.status_outdated ?? 0 }}
        </span>
      </button>
    </div>

    <div
      class="card border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900"
    >
      <DataTable
        :value="tableItems"
        lazy
        paginator
        :rows="tableItemsPerPage"
        :total-records="tableTotalItems"
        :loading="tableLoading"
        @page="onPage"
        @sort="onSort"
        :first="(tablePage - 1) * tableItemsPerPage"
        :rows-per-page-options="tableItemsPerPageOptions"
        removable-sort
        class="p-datatable-sm"
      >
        <Column field="id" header="Node Name" sortable>
          <template #body="slotProps">
            <router-link
              :to="{
                name: 'NodesCRUD',
                params: { node: slotProps.data.id }
              }"
              class="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline font-medium"
            >
              {{ slotProps.data.id }}
            </router-link>
          </template>
        </Column>
        <Column field="environment" header="Environment" sortable />
        <Column field="report.status" header="Report Status" sortable />
        <Column field="change_report" header="Change Report" sortable />
        <Column field="disabled" header="Disabled">
          <template #body="slotProps">
            <i
              v-if="slotProps.data.disabled"
              class="pi pi-check-square text-zinc-700 dark:text-zinc-300"
            ></i>
            <i v-else class="pi pi-stop text-zinc-400"></i>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import { debounce } from '@/utils/debounce'
import { nodes } from '@/resources/nodes'

const router = useRouter()
const auth = authStore()

const outdatedThresholdError = ref('')

const tableGenericDropdownOptions = [
  { label: 'Unset', value: '' },
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' }
]

const formSearchByFactsOperators = [
  'eq',
  'gt',
  'gte',
  'in',
  'lte',
  'ne',
  'nin',
  'regex'
]
const formSearchByFactsTypes = ['bool', 'int', 'float', 'str']

const {
  tableItems,
  tableItemsMeta,
  tableLoading,
  tablePage,
  tableItemsPerPage,
  tableItemsPerPageOptions,
  tableTotalItems,
  tableSortBy,
  tableExpPan,
  formSearchBy,
  getSearchData,
  getSearchDataTableEvent
} = useResourceListQuery({
  resourceDef: nodes
})

interface PageEvent {
  page: number
  rows: number
}

interface SortEvent {
  sortField?: string | ((item: any) => string)
  sortOrder?: number | null
}

const onPage = (event: PageEvent) => {
  getSearchDataTableEvent({
    page: event.page + 1,
    itemsPerPage: event.rows,
    sortBy: tableSortBy,
    searchBy: []
  })
}

const onSort = (event: SortEvent) => {
  const fieldKey = typeof event.sortField === 'string' ? event.sortField : ''
  const sortByList = fieldKey
    ? [
        {
          key: fieldKey,
          order: event.sortOrder === 1 ? ('asc' as const) : ('desc' as const)
        }
      ]
    : []
  getSearchDataTableEvent({
    page: tablePage.value,
    itemsPerPage: tableItemsPerPage.value,
    sortBy: sortByList,
    searchBy: []
  })
}

const handleSearch = () => {
  getSearchData()
}

const debouncedSearch = debounce(handleSearch, 300)

const formSearchByFactsAdd = () => {
  if (!formSearchBy.fact) {
    formSearchBy.fact = []
  }
  formSearchBy.fact.push({
    fact_name: '',
    operator: '',
    type: '',
    value: ''
  })
}

const formSearchByFactsRemove = (index: number) => {
  formSearchBy.fact.splice(index, 1)
  getSearchData()
}

const toggleStatus = (statusRegex: string) => {
  let current = formSearchBy.report_status
    ? String(formSearchBy.report_status).split('|')
    : []
  const index = current.indexOf(statusRegex)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(statusRegex)
  }
  formSearchBy.report_status = current.join('|')
  getSearchData()
}

const isStatusActive = (statusRegex: string) => {
  if (!formSearchBy.report_status) return false
  return String(formSearchBy.report_status).split('|').includes(statusRegex)
}

const validateISOTimestamp = (value: string): boolean | string => {
  if (!value) return true
  const isoPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
  if (!isoPattern.test(value)) {
    return 'Invalid ISO timestamp format (e.g., 2024-01-01T12:00:00Z)'
  }
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return 'Invalid date/time value'
  }
  return true
}

const handleThresholdInput = (event: any) => {
  const value = event.target.value
  outdatedThresholdError.value = ''
  if (!value) {
    getSearchData()
    return
  }
  const validationResult = validateISOTimestamp(value)
  if (validationResult === true) {
    getSearchData()
  } else {
    outdatedThresholdError.value = String(validationResult)
  }
}

const canCreate = computed(() => {
  return auth.hasPermission(PERMISSIONS.NODES.CREATE)
})

const handleCreate = () => {
  router.push({
    name: 'NodesCRUD',
    params: { node: '_new' }
  })
}

onMounted(() => {
  getSearchData()
})
</script>
