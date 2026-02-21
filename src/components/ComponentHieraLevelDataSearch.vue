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
                    v-model="formSearchBy.level_id"
                    label="Filter Level ID (regex)"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                  <v-text-field
                    v-model="formSearchBy.key_id"
                    label="Filter Key ID (regex)"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                  <v-text-field
                    v-model="formSearchBy.data_id"
                    label="Filter Data ID (regex)"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel value="fact">
              <v-expansion-panel-title>
                <v-icon class="me-2">mdi-history</v-icon>
                Fact Search
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row v-for="(fact, index) in formSearchBy.fact" :key="index">
                  <v-col cols="3">
                    <v-text-field
                      label="Fact Name"
                      v-model="fact.fact_name"
                      @update:modelValue="getSearchData"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-select
                      label="Operator"
                      :items="formSearchByFactsOperators"
                      v-model="fact.operator"
                      @update:modelValue="getSearchData"
                    ></v-select>
                  </v-col>
                  <v-col cols="2">
                    <v-select
                      label="Type"
                      :items="formSearchByFactsTypes"
                      v-model="fact.type"
                      @update:modelValue="getSearchData"
                    ></v-select>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Value"
                      v-model="fact.value"
                      @update:modelValue="getSearchData"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1">
                    <v-btn icon @click="formSearchByFactsRemove(index)">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <v-btn @click="formSearchByFactsAdd" color="primary"
                  >Add Fact</v-btn
                >
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
        <template v-slot:item.id="{ item }">
          <a
            :href="
              router.resolve({
                name: 'HieraLevelDataCRUD',
                params: {
                  level_id: item.level_id,
                  data_id: item.id,
                  key_id: item.key_id
                }
              }).href
            "
            @click.left.prevent
          >
            {{ item.id }}
          </a>
        </template>
        <template v-slot:item.facts="{ item }">
          <pre>{{ JSON.stringify(item.facts, null, 2) }}</pre>
        </template>
        <template v-slot:item.data="{ item }">
          <pre>{{ JSON.stringify(item.data, null, 2) }}</pre>
        </template>
      </v-data-table-server>
  </v-card>
</template>

<script setup>
import { useDataTable } from '@/common/datatable_generic'
import { factFieldProcessor } from '@/common/field_processors'
import { useRouter } from 'vue-router'

const router = useRouter()

const tableConfig = {
  apiEndpoint: '/api/v1/hiera/data/',
  routeName: 'HieraLevelDataSearch',
  fields: ['id', 'level_id', 'key_id', 'priority', 'facts', 'data'],
  searchFormSchema: [
    { key: 'level_id', type: 'string' },
    { key: 'key_id', type: 'string' },
    { key: 'data_id', type: 'string' },
    {
      key: 'fact',
      type: 'array',
      default: [],
      fromUrl: factFieldProcessor.fromUrl,
      toUrl: factFieldProcessor.toUrl
    }
  ]
}

const {
  tableItems,
  tableItemsMeta,
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
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Level ID', key: 'level_id', sortable: true },
  { title: 'Key ID', key: 'key_id', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Facts', key: 'facts', sortable: false },
  { title: 'Data', key: 'data', sortable: false }
]

const formSearchByFactsOperators = [
  'eq',
  'gt',
  'gte',
  'in',
  'lte',
  'ne',
  'nin',
  'regex'
]
const formSearchByFactsTypes = ['bool', 'int', 'float', 'str']

function formSearchByFactsAdd() {
  formSearchBy.fact.push({ fact_name: '', operator: '', type: '', value: '' })
}

function formSearchByFactsRemove(index) {
  formSearchBy.fact.splice(index, 1)
  getSearchData()
}

function onRowClick(item, item_data) {
  router.push({
    name: 'HieraLevelDataCRUD',
    params: {
      level_id: item_data.item.level_id,
      data_id: item_data.item.id,
      key_id: item_data.item.key_id
    }
  })
}
</script>
