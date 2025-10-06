<template>
  <v-card>
    <v-container>
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
        @update:options="getNodesTableEvent"
      >
        <template v-slot:top>
          <v-row>
            <v-text-field
              v-model="formSearchBy.node_id"
              label="Filter Node ID"
              @update:modelValue="getSearchNode"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.environment"
              label="Filter Environment"
              @update:modelValue="getSearchNode"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.report.status"
              label="Filter Report Status"
              @update:modelValue="getSearchNode"
            ></v-text-field>
            <v-select
              v-model="formSearchBy.disabled"
              :items="tableDisabledDropdownOptions"
              label="Filter Disabled"
              @update:modelValue="getSearchNode"
            >
            </v-select>
          </v-row>

          <v-expansion-panels class="mt-4" v-model="expPanDefault" @update:model-value="getSearchNode" multiple>
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
                @update:modelValue="getSearchNode"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select
                label="Operator"
                :items="formSearchByFactsOperators"
                v-model="fact.operator"
                @update:modelValue="getSearchNode"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-select
                label="Type"
                :items="formSearchByFactsTypes"
                v-model="fact.type"
                @update:modelValue="getSearchNode"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                  label="Value"
                  v-model="fact.value"
                  @update:modelValue="getSearchNode"
              ></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn icon @click="formSearchByFactsRemove(index)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-btn @click="formSearchByFactsAdd" color="primary">Add Fact</v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
        <template v-slot:item.disabled="{ item }">
          <v-icon>
            {{
              item.disabled
                ? 'mdi-checkbox-marked-outline'
                : 'mdi-checkbox-blank-outline'
            }}
          </v-icon>
        </template>
        <template v-slot:item.id="{ item }">
          <a
            :href="router.resolve({ name: 'NodesCRUD', params: { node: item.id } }).href"
            @click.left.prevent
          >
            {{ item.id }}
          </a>
        </template>
      </v-data-table-server>
    </v-container>
  </v-card>
</template>

<script setup>
import api from '@/api/common'
import {syncExpPanelToUrl} from '@/common/url_state_sync'
import {syncPaginationToUrl} from '@/common/url_state_sync'
import {syncSeachByToUrl} from '@/common/url_state_sync'
import {syncSortToUrl} from '@/common/url_state_sync'

import { ref, reactive, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tableItems = ref([])
const tableLoading = ref(true)

const tablePage = ref( Number(route.query.page) || 1)
const tableItemsPerPage = ref(Number(route.query.limit) || 10)
const tableItemsPerPageOptions = [10, 25, 50, 100]
const tableTotalItems = ref(tablePage.value * tableItemsPerPage.value)

let oldUrlParams = {}

const tableSortBy = reactive([])
if (route.query.sort) {
  if (route.query.sort_order === 'ascending') {
    tableSortBy.push({
      key: route.query.sort,
      order: 'asc'
    })
  } else {
    tableSortBy.push({
      key: route.query.sort,
      order: 'desc'
    })
  }
}

const expPanDefault = ref(Array(route.query.exp_pan_default) || [])

const formSearchBy = reactive({
  node_id: '',
  disabled: '',
  report: { status: '' },
  environment: '',
  fact: []
})
if (route.query.node_id) {
  formSearchBy.node_id = route.query.node_id
}
if (route.query.disabled) {
  formSearchBy.disabled = route.query.disabled
}
if (route.query.environment) {
  formSearchBy.environment = route.query.environment
}
if (route.query.report_status) {
  formSearchBy.report.status = route.query.report_status
}
if (route.query.fact) {
  const fact_values = Array.isArray(route.query.fact)
      ? route.query.fact
      : [route.query.fact]

  fact_values.forEach((fact_value) => {
    const fact_value_split = fact_value.split(':')
    formSearchBy.fact.push({
      fact_name: fact_value_split[0],
      operator: fact_value_split[1],
      type: fact_value_split[2],
      value: fact_value_split[3]
    })
  })
}


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
  getSearchNode()
}

const tableHeaders = [
  { title: 'Node ID', key: 'id', sortable: true },
  { title: 'Environment', key: 'environment', sortable: false },
  { title: 'Report Status', key: 'report.status', sortable: true },
  { title: 'Change Report', key: 'change_report', sortable: true },
  { title: 'Disabled', key: 'disabled', sortable: false }
]

const tableDisabledDropdownOptions = [
  { title: 'Unset', value: '' },
  { title: 'True', value: 'true' },
  { title: 'False', value: 'false' }
]

function getParamsSearchBy() {
  const items = []
  
  if (formSearchBy.node_id) {
    items.push({ key: 'node_id', value: formSearchBy.node_id })
  }
  if (formSearchBy.disabled) {
    items.push({ key: 'disabled', value: formSearchBy.disabled })
  }
  if (formSearchBy.environment) {
    items.push({ key: 'environment', value: formSearchBy.environment })
  }
  if (formSearchBy.report.status) {
    items.push({ key: 'report_status', value: formSearchBy.report.status })
  }
  if (formSearchBy.fact.length > 0) {
    const facts = formSearchBy.fact
      .filter(fact => fact.fact_name && fact.operator && fact.type && fact.value)
      .map(fact => `${fact.fact_name}:${fact.operator}:${fact.type}:${fact.value}`)
    
    if (facts.length > 0) {
      items.push({ key: 'fact', value: facts })
    }
  }
  
  return items
}

function getSearchNode() {
  let _event = {
    page: tablePage.value,
    itemsPerPage: tableItemsPerPage.value,
    sortBy: [...tableSortBy],
    searchBy: getParamsSearchBy()
  }
  tablePage.value = 1
  getNodes(_event)
}

function getNodesTableEvent(event) {
  event.searchBy = getParamsSearchBy()
  event.sortBy = [...event.sortBy]
  tableSortBy.length = 0
  if (event.sortBy.length) {
    for (let item of event.sortBy) {
      tableSortBy.push(item)
    }
  }
  getNodes(event)
}

function getNodes(event) {
  let query = {}

  if (event.itemsPerPage === -1) {
    tableItemsPerPage.value = 100
    event.itemsPerPage = 100
  }
  syncPaginationToUrl(query, event.page, event.itemsPerPage)
  syncSortToUrl(query, event.sortBy, tableSortBy)
  syncSeachByToUrl(query, event.searchBy)

  let _params = { ...query }
  _params.fields = [
    'id',
    'environment',
    'report.status',
    'disabled',
    'change_report'
  ]
  if (_params.page) {
    _params.page = _params.page - 1
  }

  syncExpPanelToUrl(query,'default', expPanDefault.value)

  router.replace({
    name: 'NodesSearch',
    query: query
  })

  if (JSON.stringify(_params) === JSON.stringify(oldUrlParams)) {
    return
  }
  oldUrlParams = _params
  tableLoading.value = true

  api.get('/api/v1/nodes', _params).then((data) => {
    if (data) {
      tableTotalItems.value = data.meta['result_size']
      tableItems.value = data.result
      tableLoading.value = false
    }
  })
}

function onRowClick(item, item_data) {
  console.log(item_data)
  router.push({
    name: 'NodesCRUD',
    params: { node: item_data.item.id }
  })
}
</script>
