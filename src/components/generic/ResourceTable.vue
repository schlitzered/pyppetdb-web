<template>
  <div class="flex flex-col gap-4">
    <Accordion
      v-if="resourceDef.searchFilters.length > 0"
      v-model:value="tableExpPan"
    >
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
              <InputText
                v-if="filter.type === 'text'"
                :id="filter.key"
                v-model="formSearchBy[filter.key]"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
              <Select
                v-else-if="filter.type === 'select'"
                :id="filter.key"
                v-model="formSearchBy[filter.key]"
                :options="filter.options"
                option-label="label"
                option-value="value"
                show-clear
                @change="handleSearch"
                class="p-dropdown-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
              <Select
                v-else-if="filter.type === 'boolean'"
                :id="filter.key"
                v-model="formSearchBy[filter.key]"
                :options="[
                  { label: 'Yes', value: true },
                  { label: 'No', value: false }
                ]"
                option-label="label"
                option-value="value"
                show-clear
                @change="handleSearch"
                class="p-dropdown-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div
      class="card border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900"
    >
      <DataTable
        :value="tableItems"
        lazy
        paginator
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        current-page-report-template="Showing {first} to {last} of {totalRecords} results"
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
        <Column
          v-for="col in resourceDef.tableColumns"
          :key="col.key + '-' + col.label"
          :field="col.key"
          :header="col.label"
          :sortable="col.sortable"
        >
          <template #body="slotProps">
            <router-link
              v-if="col.linkRoute"
              :to="{
                name: col.linkRoute,
                params: getLinkParams(col, slotProps.data)
              }"
              class="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline font-medium"
            >
              {{
                formatVal(
                  getNestedVal(slotProps.data, col.key),
                  col,
                  slotProps.data
                )
              }}
            </router-link>
            <span v-else>
              {{
                formatVal(
                  getNestedVal(slotProps.data, col.key),
                  col,
                  slotProps.data
                )
              }}
            </span>
          </template>
        </Column>
        <Column v-if="canDelete" header="Actions" class="w-24 text-center">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              @click="handleDeleteRow(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from '@/utils/debounce'
import { onMounted } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import type { ResourceDefinition } from '@/types/resources'
import type { TableColumn } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const {
  tableItems,
  tableLoading,
  tablePage,
  tableItemsPerPage,
  tableItemsPerPageOptions,
  tableTotalItems,
  tableSortBy,
  tableExpPan,
  formSearchBy,
  getSearchData,
  getSearchDataTableEvent,
  reload
} = useResourceListQuery({
  resourceDef: props.resourceDef
})

const canDelete = computed(() => {
  const perm = props.resourceDef.permissions.delete
  if (!perm) {
    return false
  }
  return perm(auth.hasPermission)
})

if (props.resourceDef.name === 'nodes_secrets_redactor') {
  let lastGeneratedHash = ''

  watch(
    () => formSearchBy.secret_value,
    async (newValue) => {
      if (!newValue) {
        lastGeneratedHash = ''
        formSearchBy.secret_id = ''
        return
      }
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(String(newValue))
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        lastGeneratedHash = hashHex
        formSearchBy.secret_id = hashHex
        debouncedSearch()
      } catch (err) {
        console.error(err)
      }
    }
  )

  watch(
    () => formSearchBy.secret_id,
    (newValue) => {
      if (newValue !== lastGeneratedHash) {
        formSearchBy.secret_value = ''
        lastGeneratedHash = ''
      }
    }
  )
}

const handleDeleteRow = (row: any) => {
  const rowId = row[props.resourceDef.routeParam] || row.id || row.key
  confirm.require({
    message: 'Are you sure you want to delete this resource?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const endpoint =
          typeof props.resourceDef.apiBase === 'function'
            ? props.resourceDef.apiBase(route)
            : props.resourceDef.apiBase
        await api.delete(`${endpoint}/${encodeURIComponent(rowId)}`)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Resource deleted successfully',
          life: 3000
        })
        reload()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete resource',
          life: 3000
        })
      }
    }
  })
}

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

const formatVal = (
  value: unknown,
  col: TableColumn,
  row: Record<string, unknown>
) => {
  if (col.formatter) {
    return col.formatter(value, row)
  }
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
}

const getNestedVal = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' && key in current
      ? current[key]
      : undefined
  }, obj)
}

const getLinkParams = (col: TableColumn, data: Record<string, any>) => {
  const routeParams = route.params
  let baseParams: Record<string, any> = {}

  if (col.linkParams) {
    const params: Record<string, any> = { ...routeParams }
    Object.entries(col.linkParams).forEach(([paramName, fieldName]) => {
      params[paramName] = data[fieldName]
    })
    baseParams = params
  } else {
    baseParams = {
      ...routeParams,
      [col.linkParam || 'id']: getNestedVal(data, col.key)
    }
  }

  const targetRoute = router.getRoutes().find((r) => r.name === col.linkRoute)
  if (targetRoute) {
    const paramNames: string[] = []
    const matches = targetRoute.path.matchAll(/:([a-zA-Z0-9_]+)/g)
    for (const match of matches) {
      paramNames.push(match[1])
    }
    const filteredParams: Record<string, any> = {}
    paramNames.forEach((name) => {
      if (baseParams[name] !== undefined) {
        filteredParams[name] = baseParams[name]
      }
    })
    return filteredParams
  }

  return baseParams
}

onMounted(() => {
  getSearchData()
})
</script>
