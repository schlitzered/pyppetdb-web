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
      @update:options="getTeamsTableEvent"
    >
      <template v-slot:top>
        <v-text-field
          v-model="formSearchBy.team_id"
          label="Filter Team ID"
          @update:modelValue="getTeamsSearchTeamId"
        ></v-text-field>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({ name: 'TeamsCRUD', params: { team: item.id } })
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

const formSearchBy = reactive({
  team_id: ''
})

const tableHeaders = [
  { title: 'Team ID', key: 'id', sortable: true },
  { title: 'LDAP Group', key: 'ldap_group', sortable: false }
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
    formSearchBy[key] = route.query[key]
  }
})

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

function getTeamsSearchTeamId() {
  let _event = {
    page: 1,
    itemsPerPage: tableItemsPerPage.value,
    sortBy: [...tableSortBy],
    searchBy: getParamsSearchBy()
  }
  tablePage.value = 1
  getTeams(_event)
}

function getTeamsTableEvent(event) {
  event.searchBy = getParamsSearchBy()
  event.sortBy = [...event.sortBy]
  tableSortBy.length = 0
  if (event.sortBy.length) {
    for (let item of event.sortBy) {
      tableSortBy.push(item)
    }
  }
  getTeams(event)
}

function getTeams(event) {
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
    name: 'TeamsSearch',
    query: query
  })

  api.get(`/api/v1/teams`, _params).then((data) => {
    if (data) {
      tableTotalItems.value = data.meta['result_size']
      tableItems.value = data.result
      tableLoading.value = false
    }
  })
}

function onRowClick(item, item_data) {
  router.push({
    name: 'TeamsCRUD',
    params: { team: item_data.item.id }
  })
}
</script>
