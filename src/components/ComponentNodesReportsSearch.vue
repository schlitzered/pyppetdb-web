/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <v-card>
    <v-data-table-server
      :headers="tableHeaders"
      :items-length="tableTotalItems"
      :items="tableItems"
      :items-per-page-options="tableItemsPerPageOptions"
      :loading="tableLoading"
      v-model:page="tablePage"
      v-model:items-per-page="tableItemsPerPage"
      :sort-by="tableSortBy"
      item-value="id"
      @click:row="onRowClick"
      @update:options="getSearchDataTableEvent"
    >
      <template v-slot:top>
        <v-expansion-panels
          class="mt-4"
          v-model="tableExpPan"
          @update:model-value="getSearchDataExpPanelEvent"
          multiple
        >
          <v-expansion-panel value="search">
            <v-expansion-panel-title>
              <v-icon class="me-2">mdi-history</v-icon>
              Search
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-text-field
                v-model="formSearchBy.report_status"
                label="Filter Report Status"
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({
              name: 'NodesReportsCRUD',
              params: { node: item.node_id, report: item.id }
            }).href
          "
          @click.left.prevent
        >
          {{ item.id }}
        </a>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { useDataTable } from '@/common/datatable_generic'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tableConfig = {
  apiEndpoint: `/api/v1/nodes/${route.params.node}/reports`,
  routeName: 'NodesReportsSearch',
  fields: [], // Add your desired fields here
  searchFormSchema: [{ key: 'report_status', type: 'string' }],
  dataTransformers: {
    'report.metrics': (metrics) => {
      if (Array.isArray(metrics)) {
        const metricsDict = {}
        metrics.forEach((metric) => {
          const key = `${metric.category}_${metric.name}`
          metricsDict[key] = metric.value
        })
        return metricsDict
      }
      return metrics
    }
  }
}

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
  getSearchDataExpPanelEvent,
  reload
} = useDataTable(tableConfig)

defineExpose({ reload })

const tableHeaders = [
  { title: 'Report ID', key: 'id', sortable: true },
  { title: 'Status', key: 'report.status', sortable: true },
  {
    title: 'Resources Total',
    key: 'report.metrics.resources_total',
    sortable: false
  },
  {
    title: 'Changes Total',
    key: 'report.metrics.changes_total',
    sortable: false
  },
  {
    title: 'Event Failures',
    key: 'report.metrics.events_failure',
    sortable: false
  },
  {
    title: 'Event Success',
    key: 'report.metrics.events_success',
    sortable: false
  },
  { title: 'Event Total', key: 'report.metrics.events_total', sortable: false }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'NodesReportsCRUD',
    params: {
      node: route.params.node,
      report: item_data.item.id
    }
  })
}
</script>
