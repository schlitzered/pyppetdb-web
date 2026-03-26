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
                v-model="formSearchBy.cert_id"
                label="Filter Cert ID"
                @update:modelValue="getSearchData"
              ></v-text-field>
              <v-text-field
                v-model="formSearchBy.cn"
                label="Filter Common Name"
                @update:modelValue="getSearchData"
              ></v-text-field>
              <v-select
                v-model="formSearchBy.status"
                :items="tableStatusDropdownOptions"
                label="Filter Status"
                @update:modelValue="getSearchData"
              ></v-select>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.id="{ item }">
        <a
          :href="
            router.resolve({
              name: 'CAAuthoritiesCertsCRUD',
              params: { ca_id: route.params.ca_id, cert_id: item.id }
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
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tableConfig = {
  apiEndpoint: `/api/v1/ca/authorities/${route.params.ca_id}/certs`,
  routeName: 'CAAuthoritiesCertsSearch',
  fields: ['id', 'cn', 'status', 'created'],
  searchFormSchema: [
    { key: 'cert_id', type: 'string' },
    { key: 'cn', type: 'string' },
    { key: 'status', type: 'string' }
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
  getSearchDataExpPanelEvent
} = useDataTable(tableConfig)

const tableHeaders = [
  { title: 'Cert ID', key: 'id', sortable: true },
  { title: 'Common Name', key: 'cn', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created', key: 'created', sortable: false }
]

const tableStatusDropdownOptions = [
  { title: 'Unset', value: '' },
  { title: 'Requested', value: 'requested' },
  { title: 'Signed', value: 'signed' },
  { title: 'Revoked', value: 'revoked' },
  { title: 'Expired', value: 'expired' }
]

function onRowClick(item, item_data) {
  router.push({
    name: 'CAAuthoritiesCertsCRUD',
    params: { ca_id: route.params.ca_id, cert_id: item_data.item.id }
  })
}
</script>
