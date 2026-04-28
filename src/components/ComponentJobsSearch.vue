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
                  v-model="formSearchBy._id"
                  label="Filter Job ID"
                  @update:modelValue="getSearchData"
                ></v-text-field>
                <v-text-field
                  v-model="formSearchBy.definition_id"
                  label="Filter Definition ID"
                  @update:modelValue="getSearchData"
                ></v-text-field>
                <v-text-field
                  v-model="formSearchBy.created_by"
                  label="Filter Created By"
                  @update:modelValue="getSearchData"
                ></v-text-field>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({
              name: 'JobsCRUD',
              params: { job_id: item.id }
            }).href
          "
          @click.left.prevent
        >
          {{ item.id }}
        </a>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-cancel"
          size="small"
          variant="text"
          color="red"
          @click.stop="onCancelClick(item)"
          title="Cancel Job"
        ></v-btn>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { useDataTable } from '@/common/datatable_generic'
import { useRouter } from 'vue-router'
import api from '@/api/common'

const router = useRouter()

const tableConfig = {
  apiEndpoint: '/api/v1/jobs/jobs',
  routeName: 'JobsSearch',
  fields: ['id', 'definition_id', 'created_at', 'created_by'],
  searchFormSchema: [
    { key: '_id', type: 'string' },
    { key: 'definition_id', type: 'string' },
    { key: 'created_by', type: 'string' }
  ],
  defaultSortBy: [{ key: 'created_at', order: 'desc' }]
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
  { title: 'Job ID', key: 'id', sortable: true },
  { title: 'Definition ID', key: 'definition_id', sortable: true },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Created By', key: 'created_by', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'JobsCRUD',
    params: { job_id: item_data.item.id }
  })
}

function onCancelClick(item) {
  if (confirm(`Are you sure you want to cancel job ${item.id}?`)) {
    api.post(`/api/v1/jobs/jobs/${item.id}/cancel`).then(() => {
      reload()
    })
  }
}
</script>
