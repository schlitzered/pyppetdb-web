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
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({
              name: 'UsersCredentialsCRUD',
              params: { user: item.user, credential: item.id }
            }).href
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
import { useRoute } from 'vue-router/dist/vue-router'

const router = useRouter()
const route = useRoute()

const tableConfig = {
  apiEndpoint: '/api/v1/users/' + route.params.user + '/credentials',
  routeName: 'UsersCredentialsSearch',
  fields: ['id', 'created', 'description'],
  searchFormSchema: [{ key: 'user_id', type: 'string' }]
}

const {
  tableItems,
  tableLoading,
  tablePage,
  tableItemsPerPage,
  tableItemsPerPageOptions,
  tableTotalItems,
  tableSortBy,
  getSearchDataTableEvent,
} = useDataTable(tableConfig)

const tableHeaders = [
  { title: 'User Credential ID', key: 'id', sortable: true },
  { title: 'Created', key: 'created', sortable: false },
  { title: 'Description', key: 'description', sortable: false }
]

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
