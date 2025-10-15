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
              <v-text-field
                v-model="formSearchBy.user_id"
                label="Filter User ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.admin="{ item }">
        <v-icon>
          {{
            item.admin
              ? 'mdi-checkbox-marked-outline'
              : 'mdi-checkbox-blank-outline'
          }}
        </v-icon>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({ name: 'UsersCRUD', params: { user: item.id } })
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
import { useDataTable } from '@/common/datatable_generic'
import { useRouter } from 'vue-router'

const router = useRouter()

const tableConfig = {
  apiEndpoint: '/api/v1/users',
  routeName: 'UsersSearch',
  fields: ['id', 'name', 'admin', 'email'],
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
  tableExpPan,
  formSearchBy,
  getSearchData,
  getSearchDataTableEvent,
  getSearchDataExpPanelEvent
} = useDataTable(tableConfig)

const tableHeaders = [
  { title: 'User ID', key: 'id', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Is Admin', key: 'admin', sortable: true },
  { title: 'Email', key: 'email', sortable: true }
]

function onRowClick(item, item_data) {
  router.push({ name: 'UsersCRUD', params: { user: item_data.item.id } })
}
</script>
