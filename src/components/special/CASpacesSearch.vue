<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          CA Spaces
        </h1>
      </template>
      <template #right>
        <div class="flex gap-2">
          <Button
            v-if="canCreate"
            label="New Space"
            icon="pi pi-plus"
            class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 px-4 font-medium"
            @click="goToNewSpace"
          />
        </div>
      </template>
    </ResponsiveToolbar>

    <Accordion v-model:value="tableExpPan">
      <AccordionPanel value="filters">
        <AccordionHeader>Search Filters</AccordionHeader>
        <AccordionContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div class="flex flex-col gap-1">
              <label
                for="space_id"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Space ID
              </label>
              <InputText
                id="space_id"
                v-model="formSearchBy.space_id"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="ca_id"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                CA ID
              </label>
              <InputText
                id="ca_id"
                v-model="formSearchBy.ca_id"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div
      class="card border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm"
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
        data-key="id"
      >
        <Column field="id" header="Space ID" sortable>
          <template #body="slotProps">
            <router-link
              :to="{
                name: 'CASpacesCRUD',
                params: {
                  space_id: slotProps.data.id
                }
              }"
              class="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline font-medium font-mono text-xs"
            >
              {{ slotProps.data.id }}
            </router-link>
          </template>
        </Column>

        <Column field="ca_id" header="Current CA ID" sortable>
          <template #body="slotProps">
            <span class="font-medium text-sm">{{
              slotProps.data.ca_id || 'N/A'
            }}</span>
          </template>
        </Column>

        <Column field="description" header="Description">
          <template #body="slotProps">
            <span class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ slotProps.data.description || 'N/A' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
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
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import { debounce } from '@/utils/debounce'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import type { ResourceDefinition } from '@/types/resources'

const router = useRouter()
const auth = authStore()

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

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
  getSearchDataTableEvent
} = useResourceListQuery({
  resourceDef: props.resourceDef
})

const canCreate = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.SPACES.CREATE)
})

const goToNewSpace = () => {
  router.push({
    name: 'CASpacesCRUD',
    params: {
      space_id: '_new'
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

onMounted(() => {
  getSearchData()
})
</script>
