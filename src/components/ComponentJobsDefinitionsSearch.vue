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
                v-model="formSearchBy._id"
                label="Filter Definition ID"
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
              name: 'JobsDefinitionsCRUD',
              params: { definition_id: item.id }
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
  apiEndpoint: '/api/v1/jobs/definitions',
  routeName: 'JobsDefinitionsSearch',
  fields: ['id', 'executable', 'user', 'group'],
  searchFormSchema: [{ key: '_id', type: 'string' }]
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
  { title: 'Definition ID', key: 'id', sortable: true },
  { title: 'Executable', key: 'executable', sortable: true },
  { title: 'User', key: 'user', sortable: true },
  { title: 'Group', key: 'group', sortable: true }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'JobsDefinitionsCRUD',
    params: { definition_id: item_data.item.id }
  })
}
</script>
