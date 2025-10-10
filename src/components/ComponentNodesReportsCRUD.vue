<template>
  <v-card v-if="formDataReady">
    <v-row>
      <v-col cols="12" sm="6">
        <strong>Status:</strong> {{ formData.report['status'] }}
      </v-col>
      <v-col cols="12" sm="6">
        <strong>Noop:</strong> {{ formData.report['noop'] }}
      </v-col>
      <v-col cols="12" sm="6">
        <strong>Noop Pending:</strong> {{ formData.report['noop_pending'] }}
      </v-col>
      <v-col cols="12" sm="6">
        <strong>Corrective Change:</strong>
        {{ formData.report['corrective_change'] }}
      </v-col>
    </v-row>
    <v-expansion-panels class="mt-4" v-model="expansionModel" @update:model-value="updateUrlQuery" multiple>
      <v-expansion-panel value="metrics">
        <v-expansion-panel-title>
          <v-icon class="me-2">mdi-chart-line</v-icon>
          Report Metrics
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-data-table
            :headers="tableReportMetricsHeaders"
            :items="tableReportMetricsItems"
            v-model:page="metricsPage"
            v-model:items-per-page="metricsItemsPerPage"
            @update:options="updateUrlQuery"
            class="elevation-1"
            density="compact"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="tableReportMetricsSearchCategory"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search category..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
                <v-text-field
                  v-model="tableReportMetricsSearchName"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search name..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
                <v-text-field
                  v-model="tableReportMetricsSearchValue"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search Value..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
              </v-toolbar>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel value="logs">
        <v-expansion-panel-title>
          <v-icon class="me-2">mdi-history</v-icon>
          Change Information
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-data-table
            :headers="tableReportLogsHeaders"
            :items="tableReportLogsItems"
            v-model:page="logsPage"
            v-model:items-per-page="logsItemsPerPage"
            @update:options="updateUrlQuery"
            class="elevation-1"
            density="compact"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="tableReportLogsSearchLevel"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search level..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
                <v-text-field
                  v-model="tableReportLogsSearchMessage"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search message..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
              </v-toolbar>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel value="resources">
        <v-expansion-panel-title>
          <v-icon class="me-2">mdi-folder</v-icon>
          Resources
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-data-table
            :headers="tableReportResourcesHeaders"
            :items="tableReportResourcesItems"
            v-model:page="resourcesPage"
            v-model:items-per-page="resourcesItemsPerPage"
            class="elevation-1"
            density="compact"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="tableReportResourcesSearchResourceType"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search type..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
                <v-text-field
                  v-model="tableReportResourcesSearchResourceTitle"
                  @update:model-value="updateUrlQuery"
                  append-inner-icon="mdi-magnify"
                  label="Search title..."
                  single-line
                  hide-details
                  clearable
                  class="mx-2"
                  style="max-width: 250px"
                ></v-text-field>
              </v-toolbar>
            </template>
            <template v-slot:item.events="{ item }">
              <pre class="text-caption">{{
                formatResourcesEvents(item.events)
              }}</pre>
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'
import { syncSimpleStringToUrl } from '@/common/url_state_sync'
import { syncExpPanelToUrl} from "@/common/url_state_sync";
import { syncPaginationToUrl} from "@/common/url_state_sync";
import { syncSortToUrl} from "@/common/url_state_sync";

const apiError = apiErrorStore()

const route = useRoute()
const router = useRouter()

const metricsPage = ref(Number(route.query.page_metrics) || 1)
const metricsItemsPerPage = ref(Number(route.query.limit_metrics) || 10)
const logsPage = ref(Number(route.query.page_logs) || 1)
const logsItemsPerPage = ref(Number(route.query.limit_logs) || 10)
const resourcesPage = ref(Number(route.query.page_resources) || 1)
const resourcesItemsPerPage = ref(Number(route.query.limit_resources) || 10)

const tableExpPanName = 'default'
const expansionModel = ref(
    route.query['exp_pan_' + tableExpPanName]
        ? route.query['exp_pan_' + tableExpPanName].split(',')
        : []
)

const tableReportLogsSearchLevel = ref(route.query.logs_search_level || '')
const tableReportLogsSearchMessage = ref(route.query.logs_search_message || '')
const tableReportLogsHeaders = [
  {
    title: 'time',
    key: 'time',
    sortable: false
  },
  {
    title: 'Level',
    key: 'level',
    sortable: false
  },
  {
    title: 'Message',
    key: 'message',
    sortable: false
  },
  {
    title: 'Source',
    key: 'source',
    sortable: false
  }
]

const tableReportLogsItems = computed(() => {
  return formData.report.logs.filter((log) => {
    const levelMatch =
      !tableReportLogsSearchLevel.value ||
      log.level
        .toLowerCase()
        .includes(tableReportLogsSearchLevel.value.toLowerCase())

    const messageMatch =
      !tableReportLogsSearchMessage.value ||
      log.message
        .toLowerCase()
        .includes(tableReportLogsSearchMessage.value.toLowerCase())

    return levelMatch && messageMatch
  })
})

const tableReportMetricsSearchCategory = ref(
  route.query.metrics_search_category || ''
)
const tableReportMetricsSearchName = ref(route.query.metrics_search_name || '')
const tableReportMetricsSearchValue = ref(
  route.query.metrics_search_value || ''
)
const tableReportMetricsHeaders = [
  {
    title: 'Category',
    key: 'category',
    sortable: true
  },
  {
    title: 'Name',
    key: 'name',
    sortable: true
  },
  {
    title: 'Value',
    key: 'value',
    sortable: true
  }
]

const tableReportMetricsItems = computed(() => {
  return formData.report.metrics.filter((log) => {
    const categoryMatch =
      !tableReportMetricsSearchCategory.value ||
      log.category
        .toLowerCase()
        .includes(tableReportMetricsSearchCategory.value.toLowerCase())
    const nameMatch =
      !tableReportMetricsSearchName.value ||
      log.name
        .toLowerCase()
        .includes(tableReportMetricsSearchName.value.toLowerCase())
    let value = formatValue(log.value)
    const valueMatch =
      !tableReportMetricsSearchValue.value ||
      value
        .toLowerCase()
        .includes(tableReportMetricsSearchValue.value.toLowerCase())
    return categoryMatch && nameMatch && valueMatch
  })
})

function formatResourcesEvents(events) {
  if (!events || events.length === 0) return 'No events'
  return JSON.stringify(events, null, 2)
}

const tableReportResourcesSearchResourceType = ref(
  route.query.resources_search_type || ''
)
const tableReportResourcesSearchResourceTitle = ref(
  route.query.resources_search_title || ''
)
const tableReportResourcesHeaders = [
  {
    title: 'Resource Type',
    key: 'resource_type',
    sortable: true
  },
  {
    title: 'Resource Title',
    key: 'resource_title',
    sortable: true
  },
  {
    title: 'Skipped',
    key: 'skipped',
    sortable: true
  },
  {
    title: 'Corrective Change',
    key: 'corrective_change',
    sortable: true
  },
  {
    title: 'Events',
    key: 'events',
    sortable: false
  }
]

const tableReportResourcesItems = computed(() => {
  return formData.report.resources.filter((log) => {
    const typeMatch =
      !tableReportResourcesSearchResourceType.value ||
      log.resource_type
        .toLowerCase()
        .includes(tableReportResourcesSearchResourceType.value.toLowerCase())
    const titleMatch =
      !tableReportResourcesSearchResourceTitle.value ||
      log.resource_title
        .toLowerCase()
        .includes(tableReportResourcesSearchResourceTitle.value.toLowerCase())
    return typeMatch && titleMatch
  })
})

const formData = reactive({})
const formDataReady = ref(false)

function formatValue(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function updateUrlQuery() {
  let query = {}
  syncPaginationToUrl(query, metricsPage.value, metricsItemsPerPage.value, 'metrics')
  syncPaginationToUrl(query, logsPage.value, logsItemsPerPage.value, 'logs')
  syncPaginationToUrl(query, resourcesPage.value, resourcesItemsPerPage.value, 'resources')
  syncExpPanelToUrl(query, tableExpPanName, expansionModel.value)
  syncSimpleStringToUrl(query, 'metrics_search_category', tableReportMetricsSearchCategory.value)
  syncSimpleStringToUrl(query, 'metrics_search_name', tableReportMetricsSearchName.value)
  syncSimpleStringToUrl(query, 'metrics_search_value', tableReportMetricsSearchValue.value)
  syncSimpleStringToUrl(query, 'logs_search_level', tableReportLogsSearchLevel.value)
  syncSimpleStringToUrl(query, 'logs_search_message', tableReportLogsSearchMessage.value)
  syncSimpleStringToUrl(query, 'resources_search_type', tableReportResourcesSearchResourceType.value)
  syncSimpleStringToUrl(query, 'resources_search_title', tableReportResourcesSearchResourceTitle.value)

  router.replace({
    name: route.name,
    params: route.params,
    query: query
  })
}

function formGetData() {
  api
    .get(`/api/v1/nodes/${route.params.node}/reports/${route.params.report}`)
    .then((data) => {
      if (data) {
        formData['id'] = data['id']
        formData['node_id'] = data['node_id']
        formData['report'] = data['report']
        formData['change_last'] = data['change_last']
        formDataReady.value = true
      }
    })
}
formGetData()
</script>
