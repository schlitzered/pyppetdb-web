/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <ComponentDialogWarning
    :msg="dialogDeleteMsg"
    :show="dialogDeleteShow"
    @response="(action) => dialogDeleteEvent(action)"
  />
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
                v-model="formSearchBy.secret_id"
                label="Filter Secret ID (Regex)"
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          size="small"
          @click="formDelete(item)"
          :disabled="
            !loginData.hasPermission(PERMISSIONS.NODES.SECRETS_REDACTOR.DELETE)
          "
          color="red"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { PERMISSIONS } from '@/common/permissions'
import { ref } from 'vue'
import { useDataTable } from '@/common/datatable_generic'
import { loginDataStore } from '@/store/login_data'
import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'
import api from '@/api/common'

const loginData = loginDataStore()

const tableConfig = {
  apiEndpoint: '/api/v1/nodes_secrets_redactor',
  routeName: 'NodesSecretsRedactorSearch',
  fields: ['id', 'created_at'],
  searchFormSchema: [{ key: 'secret_id', type: 'string' }]
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
  getSearchDataExpPanelEvent,
  reload
} = useDataTable(tableConfig)

defineExpose({ reload })

const tableHeaders = [
  { title: 'Secret ID', key: 'id', sortable: true },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: '100px' }
]

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')
const itemToDelete = ref(null)

function formDelete(item) {
  itemToDelete.value = item
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete redaction value: ${item.id}?`
}

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    itemToDelete.value = null
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    api
      .delete(`/api/v1/nodes_secrets_redactor/${itemToDelete.value.id}`)
      .then(() => {
        reload()
      })
    itemToDelete.value = null
  }
}
</script>
