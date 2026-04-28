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
              <v-row>
                <v-text-field
                  v-model="formSearchBy.job_id"
                  label="Filter Job ID"
                  @update:modelValue="getSearchData"
                ></v-text-field>
                <v-text-field
                  v-model="formSearchBy.node_id"
                  label="Filter Node ID"
                  @update:modelValue="getSearchData"
                ></v-text-field>
                <v-select
                  v-model="formSearchBy.status"
                  :items="['scheduled', 'running', 'success', 'failed']"
                  label="Filter Status"
                  clearable
                  @update:modelValue="getSearchData"
                ></v-select>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({
              name: 'JobsNodesJobsCRUD',
              params: { node_job_id: item.id }
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
import { useRouter } from 'vue-router'

const router = useRouter()

const tableConfig = {
  apiEndpoint: '/api/v1/jobs/nodes_jobs',
  routeName: 'JobsNodesJobsSearch',
  fields: ['id', 'job_id', 'node_id', 'status'],
  searchFormSchema: [
    { key: 'job_id', type: 'string' },
    { key: 'node_id', type: 'string' },
    { key: 'status', type: 'string' }
  ]
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
  { title: 'Node Job ID', key: 'id', sortable: true },
  { title: 'Job ID', key: 'job_id', sortable: true },
  { title: 'Node ID', key: 'node_id', sortable: true },
  { title: 'Status', key: 'status', sortable: true }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'JobsNodesJobsCRUD',
    params: { node_job_id: item_data.item.id }
  })
}
</script>
