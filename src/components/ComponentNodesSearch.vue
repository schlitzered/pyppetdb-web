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
                  v-model="formSearchBy.report_status"
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
                <v-text-field
                  v-model="formSearchBy.outdated_threshold"
                  label="Outdated Threshold (ISO Timestamp)"
                  placeholder="YYYY-MM-DDTHH:MM:SS"
                  :rules="[validateISOTimestamp]"
                  :error-messages="outdatedThresholdError"
                  @update:modelValue="handleOutdatedThresholdChange"
                ></v-text-field>
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

              <v-btn @click="formSearchByFactsAdd" color="primary"
                >Add Fact</v-btn
              >
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row class="mt-1">
          <v-col cols="3">
            <v-chip
              color="success"
              variant="outlined"
              size="large"
              @click="filterByStatus('^unchanged$')"
              class="cursor-pointer"
            >
              <v-icon start>mdi-check-circle</v-icon>
              Unchanged: {{ tableItemsMeta.status_unchanged }}
            </v-chip>
          </v-col>
          <v-col cols="3">
            <v-chip
              color="warning"
              variant="outlined"
              size="large"
              @click="filterByStatus('^changed$')"
              class="cursor-pointer"
            >
              <v-icon start>mdi-alert-circle</v-icon>
              Changed: {{ tableItemsMeta.status_changed }}
            </v-chip>
          </v-col>
          <v-col cols="3">
            <v-chip
              color="error"
              variant="outlined"
              size="large"
              @click="filterByStatus('^failed$')"
              class="cursor-pointer"
            >
              <v-icon start>mdi-close-circle</v-icon>
              Failed: {{ tableItemsMeta.status_failed }}
            </v-chip>
          </v-col>
          <v-col cols="3">
            <v-chip
              color="info"
              variant="outlined"
              size="large"
              class="cursor-pointer"
            >
              <v-icon start>mdi-help-circle</v-icon>
              Unreported: {{ tableItemsMeta.status_unreported }}
            </v-chip>
          </v-col>
        </v-row>
        <v-row class="mt-1">
          <v-col cols="3">
            <v-chip
              color="grey"
              variant="outlined"
              size="large"
              class="cursor-pointer"
            >
              <v-icon start>mdi-clock-alert-outline</v-icon>
              Outdated: {{ tableItemsMeta.status_outdated }}
            </v-chip>
          </v-col>
        </v-row>
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
          :href="
            router.resolve({ name: 'NodesCRUD', params: { node: item.id } })
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
import { ref } from 'vue'
import { useDataTable } from '@/common/datatable_generic'
import { factFieldProcessor } from '@/common/field_processors'
import { useRouter } from 'vue-router'

const router = useRouter()

const outdatedThresholdError = ref('')

const tableConfig = {
  apiEndpoint: '/api/v1/nodes',
  routeName: 'NodesSearch',
  fields: ['id', 'environment', 'report.status', 'disabled', 'change_report'],
  searchFormSchema: [
    { key: 'node_id', type: 'string' },
    { key: 'disabled', type: 'string' },
    { key: 'environment', type: 'string' },
    {
      key: 'report_status',
      type: 'string'
    },
    {
      key: 'outdated_threshold',
      type: 'string'
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
  tableItemsMeta,
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
  getSearchData()
}

function onRowClick(item, item_data) {
  router.push({
    name: 'NodesCRUD',
    params: { node: item_data.item.id }
  })
}

function filterByStatus(status) {
  // If the current filter matches the clicked status, clear it
  if (formSearchBy.report_status === status) {
    formSearchBy.report_status = ''
  } else {
    // Otherwise, set the new filter
    formSearchBy.report_status = status
  }
  getSearchData()
}

function validateISOTimestamp(value) {
  if (!value) return true // Empty is valid

  // ISO 8601 timestamp regex pattern
  const isoPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/

  if (!isoPattern.test(value)) {
    return 'Invalid ISO timestamp format (e.g., 2024-01-01T12:00:00Z)'
  }

  // Try to parse as Date to ensure it's valid
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return 'Invalid date/time value'
  }

  return true
}

function handleOutdatedThresholdChange(value) {
  outdatedThresholdError.value = ''

  // Only trigger search if empty or valid
  if (!value) {
    getSearchData()
    return
  }

  const validationResult = validateISOTimestamp(value)
  if (validationResult === true) {
    getSearchData()
  } else {
    outdatedThresholdError.value = validationResult
  }
}
</script>
