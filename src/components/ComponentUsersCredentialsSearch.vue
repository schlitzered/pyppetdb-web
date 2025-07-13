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
      @update:options="getUsersCredentialsTableEvent"
    ></v-data-table-server>
  </v-card>
</template>

<script setup>
import api from '@/api/common'
import { ref, reactive } from 'vue'
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

const tableHeaders = [
  { title: 'User Credential ID', key: 'id', sortable: true },
  { title: 'Created', key: 'created', sortable: false },
  { title: 'Description', key: 'description', sortable: false }
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

function getUsersCredentialsTableEvent(event) {
  event.sortBy = [...event.sortBy]
  tableSortBy.length = 0
  if (event.sortBy.length) {
    for (let item of event.sortBy) {
      tableSortBy.push(item)
    }
  }
  getUsersCredentials(event)
}

function getUsersCredentials(event) {
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

  let _params = { ...query }
  if (_params.page) {
    _params.page = _params.page - 1
  }

  router.replace({
    name: 'UsersCredentialsSearch',
    query: query
  })

  api
    .get('/api/v1/users/' + route.params.user + '/credentials', _params)
    .then((data) => {
      if (data) {
        tableTotalItems.value = data.meta['result_size']
        tableItems.value = data.result
        tableLoading.value = false
      }
    })
}

function onRowClick(item, item_data) {
  router.push({
    name: 'UsersCredentialsCRUD',
    params: {
      user: route.params.user,
      credential: item_data.item.id
    }
  })
}
</script>
