<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="!reportData" class="text-center p-8 text-zinc-500">
      Report not found.
    </div>

    <div v-else class="flex flex-col gap-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <template #content>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Status</span>
              <div>
                <Tag
                  :value="reportData.status"
                  :severity="getStatusSeverity(reportData.status)"
                />
              </div>
            </div>
          </template>
        </Card>

        <Card
          class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <template #content>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Noop</span>
              <span
                class="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {{ reportData.noop ? 'Yes' : 'No' }}
              </span>
            </div>
          </template>
        </Card>

        <Card
          class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <template #content>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Noop Pending</span
              >
              <span
                class="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {{ reportData.noop_pending ? 'Yes' : 'No' }}
              </span>
            </div>
          </template>
        </Card>

        <Card
          class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <template #content>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Corrective Change</span
              >
              <span
                class="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {{ reportData.corrective_change ? 'Yes' : 'No' }}
              </span>
            </div>
          </template>
        </Card>
      </div>

      <Accordion multiple :value="expansionModel">
        <AccordionPanel value="metrics">
          <AccordionHeader>Report Metrics</AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4">
              <div class="flex justify-end gap-2">
                <InputText
                  v-model="searchMetrics"
                  placeholder="Search metrics..."
                  class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 w-full max-w-xs"
                />
              </div>
              <DataTable
                :value="filteredMetrics"
                paginator
                paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                current-page-report-template="Showing {first} to {last} of {totalRecords} results"
                :rows="10"
                class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
              >
                <Column field="category" header="Category" sortable />
                <Column field="name" header="Name" sortable />
                <Column field="value" header="Value" sortable>
                  <template #body="slotProps">
                    {{ formatValue(slotProps.data.value) }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="logs">
          <AccordionHeader>Change Information</AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4">
              <div class="flex justify-end gap-2">
                <InputText
                  v-model="searchLogs"
                  placeholder="Search logs..."
                  class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 w-full max-w-xs"
                />
              </div>
              <DataTable
                :value="filteredLogs"
                paginator
                paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                current-page-report-template="Showing {first} to {last} of {totalRecords} results"
                :rows="10"
                class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
              >
                <Column field="time" header="Time" sortable>
                  <template #body="slotProps">
                    {{ new Date(slotProps.data.time).toLocaleString() }}
                  </template>
                </Column>
                <Column field="level" header="Level" sortable>
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.level"
                      :severity="getLogLevelSeverity(slotProps.data.level)"
                    />
                  </template>
                </Column>
                <Column field="message" header="Message" sortable />
                <Column field="source" header="Source" sortable />
              </DataTable>
            </div>
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="resources">
          <AccordionHeader>Resources</AccordionHeader>
          <AccordionContent>
            <div class="flex flex-col gap-4">
              <div class="flex justify-end gap-2">
                <InputText
                  v-model="searchResources"
                  placeholder="Search resources..."
                  class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 w-full max-w-xs"
                />
              </div>
              <DataTable
                :value="filteredResources"
                paginator
                paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                current-page-report-template="Showing {first} to {last} of {totalRecords} results"
                :rows="10"
                class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
              >
                <Column field="resource_type" header="Resource Type" sortable />
                <Column
                  field="resource_title"
                  header="Resource Title"
                  sortable
                />
                <Column field="skipped" header="Skipped" sortable>
                  <template #body="slotProps">
                    {{ slotProps.data.skipped ? 'Yes' : 'No' }}
                  </template>
                </Column>
                <Column
                  field="corrective_change"
                  header="Corrective Change"
                  sortable
                >
                  <template #body="slotProps">
                    {{ slotProps.data.corrective_change ? 'Yes' : 'No' }}
                  </template>
                </Column>
                <Column header="Events">
                  <template #body="slotProps">
                    <pre
                      class="text-xs font-mono bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-w-md"
                      >{{ formatEvents(slotProps.data.events) }}</pre
                    >
                  </template>
                </Column>
              </DataTable>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/client'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import type { ResourceDefinition } from '@/types/resources'

defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const loading = ref(true)
const reportData = ref<Record<string, any> | null>(null)
const expansionModel = ref<string[]>(['metrics', 'logs', 'resources'])

const searchMetrics = ref('')
const searchLogs = ref('')
const searchResources = ref('')

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'changed':
      return 'success'
    case 'unchanged':
      return 'secondary'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

const getLogLevelSeverity = (level: string) => {
  switch (level) {
    case 'info':
    case 'notice':
      return 'info'
    case 'warning':
      return 'warn'
    case 'err':
    case 'error':
    case 'alert':
    case 'emerg':
    case 'crit':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatValue = (val: any) => {
  if (val === null) {
    return 'null'
  }
  if (val === undefined) {
    return 'undefined'
  }
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

const formatEvents = (events: any) => {
  if (!events || events.length === 0) {
    return 'No events'
  }
  return JSON.stringify(events, null, 2)
}

const filteredMetrics = computed(() => {
  const metrics = reportData.value?.metrics || []
  if (!searchMetrics.value) {
    return metrics
  }
  const q = searchMetrics.value.toLowerCase()
  return metrics.filter(
    (m: any) =>
      m.category?.toLowerCase().includes(q) ||
      m.name?.toLowerCase().includes(q) ||
      formatValue(m.value).toLowerCase().includes(q)
  )
})

const filteredLogs = computed(() => {
  const logs = reportData.value?.logs || []
  if (!searchLogs.value) {
    return logs
  }
  const q = searchLogs.value.toLowerCase()
  return logs.filter(
    (l: any) =>
      l.level?.toLowerCase().includes(q) ||
      l.message?.toLowerCase().includes(q) ||
      l.source?.toLowerCase().includes(q)
  )
})

const filteredResources = computed(() => {
  const resources = reportData.value?.resources || []
  if (!searchResources.value) {
    return resources
  }
  const q = searchResources.value.toLowerCase()
  return resources.filter(
    (r: any) =>
      r.resource_type?.toLowerCase().includes(q) ||
      r.resource_title?.toLowerCase().includes(q)
  )
})

const fetchReport = async () => {
  loading.value = true
  try {
    const node = encodeURIComponent(String(route.params.node))
    const report = encodeURIComponent(String(route.params.report))
    const res = await api.get<any>(`/api/v1/nodes/${node}/reports/${report}`)
    if (res && res.report) {
      reportData.value = res.report
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>
