<template>
  <v-card>
    <v-container>
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
      <v-row>
        <v-col cols="12" md="12">
          <h3>Fact Search Parameters</h3>
        </v-col>
      </v-row>

      <v-row v-for="(fact, index) in formSearchBy.fact" :key="index">
        <v-col cols="3">
          <v-text-field
            label="Fact Name"
            v-model="fact.fact_name"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-select
            label="Operator"
            :items="formSearchByFactsOperators"
            v-model="fact.operator"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            label="Type"
            :items="formSearchByFactsTypes"
            v-model="fact.type"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-text-field label="Value" v-model="fact.value"></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn icon @click="formSearchByFactsRemove(index)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-btn @click="formSearchByFactsAdd" color="primary">Add Fact</v-btn>

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
        <template v-slot:item.disabled="{ item }">
          <v-icon>
            {{
              item.disabled
                ? 'mdi-checkbox-marked-outline'
                : 'mdi-checkbox-blank-outline'
            }}
          </v-icon>
        </template>
      </v-data-table-server>
    </v-container>
  </v-card>
</template>

<script setup>
import api from '@/api/common'
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tableItems = ref([])
const tableLoading = ref(true)

const tablePage = ref(Number(route.query.page) ? Number(route.query.page) : 1)
const tableItemsPerPage = ref(
  Number(route.query.limit) ? Number(route.query.limit) : 10
)
const tableItemsPerPageOptions = [10, 25, 50, 100]
const tableTotalItems = ref(tablePage.value * tableItemsPerPage.value)

const tableSortBy = reactive([])

const formSearchBy = reactive({
  node_id: '',
  disabled: '',
  report: { status: '' },
  environment: '',
  fact: []
})

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
  { title: 'Change Report', key: 'change_report', sortable: true},
  { title: 'Disabled', key: 'disabled', sortable: false }
]

const tableDisabledDropdownOptions = [
  { title: 'Unset', value: '' },
  { title: 'True', value: 'true' },
  { title: 'False', value: 'false' }
]

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

Object.entries(formSearchBy).forEach(([key]) => {
  if (route.query[key]) {
    if (key === 'fact') {
      let fact_values = []
      if (Array.isArray(route.query[key])) {
        fact_values = route.query[key]
      } else {
        fact_values.push(route.query[key])
      }
      fact_values.forEach((fact_value) => {
        let fact_value_split = fact_value.split(':')
        formSearchBy.fact.push({
          fact_name: fact_value_split[0],
          operator: fact_value_split[1],
          type: fact_value_split[2],
          value: fact_value_split[3]
        })
      })
    } else {
      formSearchBy[key] = route.query[key]
    }
  }
})

function getParamsSearchBy() {
  // Helper function for recursion
  function flattenObject(obj, parentKey = '') {
    let items = []
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = parentKey ? `${parentKey}_${key}` : key
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        items = items.concat(flattenObject(value, newKey))
      } else if (key === 'fact' && value) {
        let _facts = []
        formSearchBy.fact.forEach((fact) => {
          if (fact.fact_name && fact.operator && fact.type && fact.value) {
            _facts.push(
              `${fact.fact_name}:${fact.operator}:${fact.type}:${fact.value}`
            )
          }
        })
        if (_facts.length) {
          items.push({
            key: 'fact',
            value: _facts
          })
        }
      } else if (value) {
        items.push({
          key: newKey,
          value: value
        })
      }
    })
    return items
  }

  // Use the helper function to process formSearchBy
  return flattenObject(formSearchBy)
}

function getSearchNode() {
  let _event = {
    page: 1,
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
  tableLoading.value = true
  let query = {}

  if (event.page !== 1) {
    query.page = event.page
  }

  if (event.itemsPerPage === -1) {
    tableItemsPerPage.value = 100
    event.itemsPerPage = 100
    query.limit = 100
  } else if (event.itemsPerPage !== 10) {
    query.limit = event.itemsPerPage
  }

  if (event.sortBy.length) {
    query.sort = event.sortBy[0].key
    if (event.sortBy[0].order === 'asc') {
      query.sort_order = 'ascending'
    } else {
      query.sort_order = 'descending'
    }
  } else {
    tableSortBy.length = 0
  }

  if (event.searchBy.length) {
    event.searchBy.forEach((item) => {
      query[item.key] = item.value
    })
  }

  let _params = { ...query }
  _params.fields = ['id', 'environment', 'report.status', 'disabled', 'change_report']
  if (_params.page) {
    _params.page = _params.page - 1
  }

  router.replace({
    name: 'NodesSearch',
    query: query
  })

  api.get('/api/v1/nodes', _params).then((data) => {
    if (data) {
      tableTotalItems.value = data.meta['result_size']
      tableItems.value = data.result
      tableLoading.value = false
    }
  })
}

function onRowClick(item, item_data) {
  router.push({
    name: 'NodesCRUD',
    params: { node: item_data.item.id }
  })
}

watch(
  () => formSearchBy.fact,
  () => {
    // Check if all parameters of any fact are defined
    getSearchNode()
  },
  { deep: true } // Enable deep watching for nested objects
)
</script>
