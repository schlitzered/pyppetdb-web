<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Space Certificates
        </h1>
      </template>
      <template #right>
        <div class="flex gap-2">
          <Button
            label="Sign Selected"
            icon="pi pi-check"
            class="bg-emerald-600 hover:bg-emerald-700 text-white border-none py-2 px-4 font-medium"
            :disabled="!canSignSelected"
            @click="batchAction('signed')"
          />
          <Button
            label="Revoke Selected"
            icon="pi pi-ban"
            class="bg-rose-600 hover:bg-rose-700 text-white border-none py-2 px-4 font-medium"
            :disabled="!canRevokeSelected"
            @click="batchAction('revoked')"
          />
        </div>
      </template>
    </ResponsiveToolbar>

    <Accordion v-model:value="tableExpPan">
      <AccordionPanel value="filters">
        <AccordionHeader>Search Filters</AccordionHeader>
        <AccordionContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div class="flex flex-col gap-1">
              <label
                for="cert_id"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Cert ID
              </label>
              <InputText
                id="cert_id"
                v-model="formSearchBy.cert_id"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="cn"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Common Name
              </label>
              <InputText
                id="cn"
                v-model="formSearchBy.cn"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="status"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Status
              </label>
              <Select
                id="status"
                v-model="formSearchBy.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                show-clear
                @change="handleSearch"
                class="p-dropdown-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="fingerprint"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Fingerprint
              </label>
              <InputText
                id="fingerprint"
                v-model="formSearchBy.fingerprint"
                @input="debouncedSearch"
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="serial_number"
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Serial Number
              </label>
              <InputText
                id="serial_number"
                v-model="formSearchBy.serial_number"
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
        v-model:selection="selectedCerts"
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
        <Column selection-mode="multiple" header-style="width: 3rem" />

        <Column field="id" header="Cert ID" sortable>
          <template #body="slotProps">
            <router-link
              :to="{
                name: 'CASpacesCertsCRUD',
                params: {
                  space_id: route.params.space_id,
                  cert_id: slotProps.data.id
                }
              }"
              class="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline font-medium font-mono text-xs"
            >
              {{ slotProps.data.id }}
            </router-link>
          </template>
        </Column>

        <Column field="cn" header="Common Name" sortable>
          <template #body="slotProps">
            <span class="font-medium text-sm">{{ slotProps.data.cn }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status"
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </template>
        </Column>

        <Column field="created" header="Created" sortable>
          <template #body="slotProps">
            <span class="text-sm">
              {{
                slotProps.data.created
                  ? new Date(slotProps.data.created).toLocaleString()
                  : ''
              }}
            </span>
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
import { useRoute } from 'vue-router'
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
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import { debounce } from '@/utils/debounce'
import api from '@/api/client'
import { useResourceListQuery } from '@/composables/useResourceListQuery'
import type { ResourceDefinition } from '@/types/resources'

const statusOptions = [
  { label: 'Requested', value: 'requested' },
  { label: 'Signed', value: 'signed' },
  { label: 'Revoked', value: 'revoked' },
  { label: 'Expired', value: 'expired' }
]

const route = useRoute()
const confirm = useConfirm()
const toast = useToast()

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const selectedCerts = ref<any[]>([])

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

const canSignSelected = computed(() => {
  if (selectedCerts.value.length === 0) {
    return false
  }
  return selectedCerts.value.every((c) => {
    return c.status === 'requested'
  })
})

const canRevokeSelected = computed(() => {
  if (selectedCerts.value.length === 0) {
    return false
  }
  return selectedCerts.value.every((c) => {
    return c.status === 'requested' || c.status === 'signed'
  })
})

const getStatusSeverity = (status: string) => {
  if (status === 'signed') {
    return 'success'
  }
  if (status === 'requested') {
    return 'warn'
  }
  if (status === 'revoked') {
    return 'danger'
  }
  return 'secondary'
}

const batchAction = (action: 'signed' | 'revoked') => {
  confirm.require({
    message: `Are you sure you want to ${action} all selected certificates?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: action === 'revoked' ? 'p-button-danger' : 'p-button-success',
    accept: async () => {
      try {
        for (const cert of selectedCerts.value) {
          const url = `/api/v1/ca/spaces/${route.params.space_id}/certs/${cert.id}`
          await api.put(url, { status: action })
        }
        toast.add({
          severity: 'success',
          summary: 'Batch Operation Successful',
          detail: `Selected certificates have been ${action}.`,
          life: 3000
        })
        selectedCerts.value = []
        reload()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Batch Operation Failed',
          detail: 'Failed to process some certificates.',
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

onMounted(() => {
  getSearchData()
})
</script>
