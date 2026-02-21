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
                v-model="formSearchBy.key_id"
                label="Filter Key ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
              <v-text-field
                v-model="formSearchBy.key_model_id"
                label="Filter Key Model ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
              <v-select
                v-model="formSearchBy.deprecated"
                :items="tableDeprecatedDropdownOptions"
                label="Filter Deprecated"
                @update:modelValue="getSearchData"
              >
              </v-select>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.deprecated="{ item }">
        <v-icon>
          {{
            item.deprecated
              ? 'mdi-checkbox-marked-outline'
              : 'mdi-checkbox-blank-outline'
          }}
        </v-icon>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({ name: 'HieraKeysCRUD', params: { key_id: item.id } })
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
  apiEndpoint: '/api/v1/hiera/keys',
  routeName: 'HieraKeysSearch',
  fields: ['id', 'key_model_id', 'description', 'deprecated'],
  searchFormSchema: [
    { key: 'key_id', type: 'string' },
    { key: 'key_model_id', type: 'string' },
    { key: 'deprecated', type: 'string' }
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
  { title: 'Key ID', key: 'id', sortable: true },
  { title: 'Key Model ID', key: 'key_model_id', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Deprecated', key: 'deprecated', sortable: false }
]

const tableDeprecatedDropdownOptions = [
  { title: 'Unset', value: '' },
  { title: 'True', value: 'true' },
  { title: 'False', value: 'false' }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'HieraKeysCRUD',
    params: { key_id: item_data.item.id }
  })
}
</script>
