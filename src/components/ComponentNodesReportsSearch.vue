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
      @update:options="getNodesReportsTableEvent"
    >
      <template v-slot:top>
        <v-text-field
          v-model="formSearchBy['report_status']"
          label="Filter Report Status"
          @update:modelValue="getSearchNodeGroupId"
        ></v-text-field>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import api from '@/api/common'
import { reactive, ref } from 'vue'
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
  report_status: ''
})

const tableHeaders = [
  { title: 'Report ID', key: 'id', sortable: true },
  { title: 'Status', key: 'report.status', sortable: true },
  {
    title: 'Resources Total',
    key: 'report.metrics.resources_total',
    sortable: false
  },
  {
    title: 'Changes Total',
    key: 'report.metrics.changes_total',
    sortable: false
  },
  {
    title: 'Event Failures',
    key: 'report.metrics.events_failure',
    sortable: false
  },
  {
    title: 'Event Success',
    key: 'report.metrics.events_success',
    sortable: false
  },
  { title: 'Event Total', key: 'report.metrics.events_total', sortable: false }
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

function getParamsSearchBy() {
  let items = []
  Object.entries(formSearchBy).forEach(([key, value]) => {
    if (value) {
      items.push({
        key: key,
        value: value
      })
    }
  })
  return items
}

function getSearchNodeGroupId() {
  let _event = {
    page: 1,
    itemsPerPage: tableItemsPerPage.value,
    sortBy: [...tableSortBy],
    searchBy: getParamsSearchBy()
  }
  tablePage.value = 1
  getNodesReports(_event)
}

function getNodesReportsTableEvent(event) {
  event.searchBy = getParamsSearchBy()
  event.sortBy = [...event.sortBy]
  tableSortBy.length = 0
  if (event.sortBy.length) {
    for (let item of event.sortBy) {
      tableSortBy.push(item)
    }
  }
  getNodesReports(event)
}

function getNodesReports(event) {
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
  if (_params.page) {
    _params.page = _params.page - 1
  }

  router.replace({
    name: 'NodesReportsSearch',
    query: query
  })

  api
    .get('/api/v1/nodes/' + route.params.node + '/reports', _params)
    .then((data) => {
      if (data) {
        tableTotalItems.value = data.meta['result_size']
        tableItems.value = data.result.map((item) => {
          if (item.report && item.report.metrics) {
            const metricsDict = {}
            item.report.metrics.forEach((metric) => {
              const key = `${metric.category}_${metric.name}`
              metricsDict[key] = metric.value
            })

            return {
              ...item,
              report: {
                ...item.report,
                metrics: metricsDict
              }
            }
          }
          return item
        })
        tableLoading.value = false
      }
    })
}

function onRowClick(item, item_data) {
  router.push({
    name: 'NodesReportsCRUD',
    params: {
      node: route.params.node,
      report: item_data.item.id
    }
  })
}
</script>
