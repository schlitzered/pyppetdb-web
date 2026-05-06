/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
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
import { useRoute } from 'vue-router'

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
  reload
} = useDataTable(tableConfig)

defineExpose({ reload })

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
