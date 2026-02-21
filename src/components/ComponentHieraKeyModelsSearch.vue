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
                v-model="formSearchBy.key_model_id"
                label="Filter Key Model ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({ name: crudRouteName, params: { key_model_id: item.id } })
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
import { computed } from 'vue'
import { useDataTable } from '@/common/datatable_generic'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelType: {
    type: String,
    required: true,
    validator: (value) => ['static', 'dynamic'].includes(value)
  }
})

const router = useRouter()

// Determine API endpoint and route names based on model type
const apiEndpoint = computed(() => {
  return props.modelType === 'static'
    ? '/api/v1/hiera/key_models/static'
    : '/api/v1/hiera/key_models/dynamic'
})

const searchRouteName = computed(() => {
  return props.modelType === 'static'
    ? 'HieraKeyModelsStaticSearch'
    : 'HieraKeyModelsDynamicSearch'
})

const crudRouteName = computed(() => {
  return props.modelType === 'static'
    ? 'HieraKeyModelsStaticCRUD'
    : 'HieraKeyModelsDynamicCRUD'
})

const tableConfig = {
  apiEndpoint: apiEndpoint.value,
  routeName: searchRouteName.value,
  fields: ['id', 'description', 'model'],
  searchFormSchema: [{ key: 'key_model_id', type: 'string' }]
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
  { title: 'Key Model ID', key: 'id', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Model', key: 'model', sortable: false }
]

function onRowClick(item, item_data) {
  router.push({
    name: crudRouteName.value,
    params: { key_model_id: item_data.item.id }
  })
}
</script>
