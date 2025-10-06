<template>
  <v-card>
    <v-container>
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
          <v-expansion-panels class="mt-4" v-model="tableExpPan" @update:model-value="getSearchData" multiple>
            <v-expansion-panel value="search">
              <v-expansion-panel-title>
                <v-icon class="me-2">mdi-history</v-icon>
                Search
              </v-expansion-panel-title>
              <v-expansion-panel-text>
          <v-row>
            <v-text-field
              v-model="formSearchBy.node_id"
              label="Filter Node ID"
              @update:modelValue="getSearchData"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.environment"
              label="Filter Environment"
              @update:modelValue="getSearchData"
            ></v-text-field>
            <v-text-field
              v-model="formSearchBy.report.status"
              label="Filter Report Status"
              @update:modelValue="getSearchData"
            ></v-text-field>
            <v-select
              v-model="formSearchBy.disabled"
              :items="tableDisabledDropdownOptions"
              label="Filter Disabled"
              @update:modelValue="getSearchData"
            >
            </v-select>
          </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel value="fact">
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
                @update:modelValue="getSearchData"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select
                label="Operator"
                :items="formSearchByFactsOperators"
                v-model="fact.operator"
                @update:modelValue="getSearchData"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-select
                label="Type"
                :items="formSearchByFactsTypes"
                v-model="fact.type"
                @update:modelValue="getSearchData"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                  label="Value"
                  v-model="fact.value"
                  @update:modelValue="getSearchData"
              ></v-text-field>
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
        <template v-slot:item.disabled="{ item }">
          <v-icon>
            {{
              item.disabled
                ? 'mdi-checkbox-marked-outline'
                : 'mdi-checkbox-blank-outline'
            }}
          </v-icon>
        </template>
        <template v-slot:item.id="{ item }">
          <a
            :href="router.resolve({ name: 'NodesCRUD', params: { node: item.id } }).href"
            @click.left.prevent
          >
            {{ item.id }}
          </a>
        </template>
      </v-data-table-server>
    </v-container>
  </v-card>
</template>

<script setup>
import { useDataTable } from '@/common/data_table_hooks'
import { factFieldProcessor } from '@/common/field_processors'
import { useRouter } from 'vue-router'

const router = useRouter()

const tableConfig = {
  apiEndpoint: '/api/v1/nodes',
  routeName: 'NodesSearch',
  fields: ['id', 'environment', 'report.status', 'disabled', 'change_report'],
  searchFormSchema: [
    { key: 'node_id', type: 'string' },
    { key: 'disabled', type: 'string' },
    { key: 'environment', type: 'string' },
    { 
      key: 'report', 
      type: 'nested',
      children: [
        { key: 'status', type: 'string' }
      ]
    },
    { 
      key: 'fact', 
      type: 'array',
      default: [],
      fromUrl: factFieldProcessor.fromUrl,
      toUrl: factFieldProcessor.toUrl
    }
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
  getSearchDataTableEvent
} = useDataTable(tableConfig)

  const tableHeaders = [
  { title: 'Node ID', key: 'id', sortable: true },
  { title: 'Environment', key: 'environment', sortable: false },
  { title: 'Report Status', key: 'report.status', sortable: true },
  { title: 'Change Report', key: 'change_report', sortable: true },
  { title: 'Disabled', key: 'disabled', sortable: false }
  ]

  const tableDisabledDropdownOptions = [
  { title: 'Unset', value: '' },
  { title: 'True', value: 'true' },
  { title: 'False', value: 'false' }
  ]

  const formSearchByFactsOperators = ['eq', 'gt', 'gte', 'in', 'lte', 'ne', 'nin', 'regex']
  const formSearchByFactsTypes = ['bool', 'int', 'float', 'str']

  function formSearchByFactsAdd() {
  formSearchBy.fact.push({ fact_name: '', operator: '', type: '', value: '' })
}

  function formSearchByFactsRemove(index) {
  formSearchBy.fact.splice(index, 1)
  getSearchData()
}

  function onRowClick(item, item_data) {
  router.push({
    name: 'NodesCRUD',
    params: { node: item_data.item.id }
  })
}
</script>
