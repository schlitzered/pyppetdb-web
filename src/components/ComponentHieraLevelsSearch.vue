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
                v-model="formSearchBy.level_id"
                label="Filter Level ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
              <v-text-field
                v-model="formSearchBy.priority"
                label="Filter Priority"
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({ name: 'HieraLevelsCRUD', params: { level_id: item.id } })
              .href
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
  apiEndpoint: '/api/v1/hiera/levels',
  routeName: 'HieraLevelsSearch',
  fields: ['id', 'priority', 'description'],
  searchFormSchema: [
    { key: 'level_id', type: 'string' },
    { key: 'priority', type: 'string' }
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
  getSearchDataExpPanelEvent
} = useDataTable(tableConfig)

const tableHeaders = [
  { title: 'Level ID', key: 'id', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Description', key: 'description', sortable: false }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'HieraLevelsCRUD',
    params: { level_id: item_data.item.id }
  })
}
</script>
