<template>
  <v-card>
    <v-container>
      <v-data-table
        :headers="tableHeaders"
        :items="tableItems"
        :items-per-page-options="tableItemsPerPageOptions"
        :loading="tableLoading"
        v-model:page="tablePage"
        v-model:items-per-page="tableItemsPerPage"
        :sort-by="tableSortBy"
        item-value="value"
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
                    v-model="formSearchBy.fact_id"
                    label="Fact ID"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                  <v-text-field
                    v-model="formSearchBy.environment"
                    label="Filter Environment"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                  <v-text-field
                    v-model="formSearchBy.report_status"
                    label="Filter Report Status"
                    @update:modelValue="getSearchData"
                  ></v-text-field>
                  <v-select
                    v-model="formSearchBy.disabled"
                    :items="[
                      { title: 'Unset', value: '' },
                      { title: 'True', value: 'true' },
                      { title: 'False', value: 'false' }
                    ]"
                    label="Filter Disabled"
                    @update:modelValue="getSearchData"
                  >
                  </v-select>
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

                <v-btn @click="formSearchByFactsAdd" color="primary">
                  Add Fact
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
        <template v-slot:item.value="{ item }">
          <a
            :href="getRowHref(item)"
            @click.left.prevent="onRowClick(null, { item })"
          >
            {{ item.value }}
          </a>
        </template>
      </v-data-table>
    </v-container>
  </v-card>
</template>

<script setup>
import { useDataTable } from '@/common/datatable_generic'
import { factFieldProcessor } from '@/common/field_processors'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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

const tableConfig = {
  apiEndpoint: '/api/v1/nodes/_distinct_fact_values',
  routeName: 'NodesDistinctFactValues',
  dataTableType: 'client',
  tableExpPanName: 'fact_search',
  searchFormSchema: [
    { key: 'fact_id', type: 'string' },
    { key: 'environment', type: 'string' },
    { key: 'report_status', type: 'string' },
    { key: 'disabled', type: 'string' },
    {
      key: 'fact',
      type: 'array',
      processor: factFieldProcessor,
      default: []
    }
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
} = useDataTable(tableConfig)

const tableHeaders = [
  { title: 'Value', key: 'value', sortable: true },
  { title: 'Count', key: 'count', sortable: true }
]

function formSearchByFactsAdd() {
  formSearchBy.fact.push({ fact_name: '', operator: '', type: '', value: '' })
}

function formSearchByFactsRemove(index) {
  formSearchBy.fact.splice(index, 1)
  getSearchData()
}

function buildRowQuery(clickedValue) {
  let query = {}

  const currentFacts = []
  if (route.query.fact) {
    if (Array.isArray(route.query.fact)) {
      currentFacts.push(...route.query.fact)
    } else {
      currentFacts.push(route.query.fact)
    }
  }

  const allFacts = []
  if (formSearchBy.fact_id) {
    const newFactParam = `${formSearchBy.fact_id}:eq:str:${clickedValue}`
    allFacts.push(newFactParam, ...currentFacts)
  } else {
    allFacts.push(...currentFacts)
  }

  if (allFacts.length > 0) {
    query.fact = allFacts
  }

  if (formSearchBy.disabled) {
    query.disabled = formSearchBy.disabled
  }
  if (formSearchBy.environment) {
    query.environment = formSearchBy.environment
  }
  if (formSearchBy.report_status) {
    query.report_status = formSearchBy.report_status
  }

  return query
}

function getRowHref(item) {
  const query = buildRowQuery(item.value)
  return router.resolve({
    name: 'NodesSearch',
    query: query
  }).href
}

function onRowClick(item, item_data) {
  const query = buildRowQuery(item_data.item.value)
  router.push({
    name: 'NodesSearch',
    query: query
  })
}
</script>
