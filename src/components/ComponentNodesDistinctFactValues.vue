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
        @update:options="handleTableUpdate"
      >
        <template v-slot:top>
          <v-row>
            <v-text-field
              v-model="formSearchBy.fact_id"
              label="Fact ID"
              @update:modelValue="getSearchNodesDistinctFactValues"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.environment"
              label="Filter Environment"
              @update:modelValue="getSearchNodesDistinctFactValues"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.report_status"
              label="Filter Report Status"
              @update:modelValue="getSearchNodesDistinctFactValues"
            ></v-text-field>
            <v-select
              v-model="formSearchBy.disabled"
              :items="[{ title: 'Unset', value: '' }, { title: 'True', value: 'true' }, { title: 'False', value: 'false' }]"
              label="Filter Disabled"
              @update:modelValue="getSearchNodesDistinctFactValues"
            >
            </v-select>
          </v-row>

          <v-expansion-panels class="mt-4" v-model="expansionModel">
            <v-expansion-panel value="fact-search-panel">
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
// Remove tableTotalItems since we're using client-side pagination

const tableSortBy = reactive([])

// Initialize expansion state for fact search panel
const initializeExpansionState = () => {
  const expanded = []
  if (route.query.fact_search_expanded === 'fact-search-panel') {
    expanded.push('fact-search-panel')
  }
  return expanded
}

const expansionModel = ref(initializeExpansionState())

const formSearchBy = reactive({
  fact_id: '',
  disabled: '',
  environment: '',
  report_status: '',
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
  getSearchNodesDistinctFactValues()
}

const tableHeaders = [
  { title: 'Value', key: 'value', sortable: true },
  { title: 'Count', key: 'count', sortable: true },
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

function getSearchNodesDistinctFactValues() {
  let _event = {
    searchBy: getParamsSearchBy()
  }
  getNodesDistinctFactValues(_event)
}

function getNodesDistinctFactValues(event) {
  tableLoading.value = true
  let _params = {}

  if (event.searchBy.length) {
    event.searchBy.forEach((item) => {
      _params[item.key] = item.value
    })
  }

  updateUrlQuery()

  api.get('/api/v1/nodes/_distinct_fact_values', _params).then((data) => {
    if (data) {
      tableItems.value = data.result
      tableLoading.value = false
    }
  })
}

// Helper function to build query for row navigation
function buildRowQuery(clickedValue) {
  let query = {}

  // Forward existing fact parameters from current URL
  const currentFacts = []
  if (route.query.fact) {
    if (Array.isArray(route.query.fact)) {
      currentFacts.push(...route.query.fact)
    } else {
      currentFacts.push(route.query.fact)
    }
  }

  // Create the new fact parameter based on clicked row and put it first
  const allFacts = []
  if (formSearchBy.fact_id) {
    const newFactParam = `${formSearchBy.fact_id}:eq:str:${clickedValue}`
    allFacts.push(newFactParam, ...currentFacts)
  } else {
    allFacts.push(...currentFacts)
  }

  // Add all fact parameters to query
  if (allFacts.length > 0) {
    query.fact = allFacts
  }

  // Forward additional filter parameters
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

watch(
  () => formSearchBy.fact,
  () => {
    getSearchNodesDistinctFactValues()
  },
  { deep: true }
)

// Watch for pagination and sorting changes to update URL
watch(tablePage, (newPage) => {
  updateUrlQuery()
})

watch(tableItemsPerPage, (newItemsPerPage) => {
  updateUrlQuery()
})

watch(expansionModel, () => {
  updateUrlQuery()
}, { deep: true })

function handleTableUpdate(options) {
  // Update local sort state from table
  tableSortBy.splice(0, tableSortBy.length, ...options.sortBy)
  updateUrlQuery()
}

function updateUrlQuery() {
  let query = {}

  // Add search parameters
  const searchParams = getParamsSearchBy()
  searchParams.forEach((item) => {
    query[item.key] = item.value
  })

  // Add pagination parameters
  if (tablePage.value !== 1) {
    query.page = tablePage.value
  }

  if (tableItemsPerPage.value !== 10) {
    query.limit = tableItemsPerPage.value
  }

  // Add sorting parameters
  if (tableSortBy.length > 0) {
    query.sort = tableSortBy[0].key
    query.sort_order = tableSortBy[0].order === 'asc' ? 'ascending' : 'descending'
  }

  // Add fact search expansion state
  if (expansionModel.value && expansionModel.value.includes('fact-search-panel')) {
    query.fact_search_expanded = 'fact-search-panel'
  } else {
    delete query.fact_search_expanded
  }

  router.replace({
    name: 'NodesDistinctFactValues',
    query: query
  })
}

// Load initial data
getSearchNodesDistinctFactValues()
</script>
