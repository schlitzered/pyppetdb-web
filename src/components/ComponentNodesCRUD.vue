<template>
  <ComponentDialogWarning
    :msg="dialogDeleteMsg"
    :show="dialogDeleteShow"
    @response="(action) => dialogDeleteEvent(action)"
  />
  <v-card>
    <v-form ref="form" v-model="formDataValid">
      <v-card-text>
        <v-switch
          v-model="formDataReadOnly"
          v-if="formButtonEditShow"
          :true-value="false"
          :false-value="true"
          label="Modify"
        ></v-switch>
        <v-text-field
          v-if="formInputIdShow"
          v-model="formData.id"
          :readonly="formInputIdReadOnly"
          append-inner-icon="mdi-account"
          label="Node ID"
        ></v-text-field>
        <v-switch
          v-model="formData.disabled"
          :disabled="formDataReadOnly"
          label="Disabled"
        ></v-switch>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="formButtonDeleteShow"
          color="red"
          variant="text"
          @click="formDelete"
          >Delete</v-btn
        >
        <v-btn color="primary" variant="text" @click="formSubmit">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
  <v-expansion-panels class="mt-4" v-if="formDataReadOnly">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon class="me-2">mdi-history</v-icon>
        Change Information
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row>
          <v-col cols="12" sm="6">
            <strong>Change Last:</strong>
            {{ formData.change_last || 'N/A' }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Change Catalog:</strong>
            {{ formData.change_catalog || 'N/A' }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Change Facts:</strong>
            {{ formData.change_facts || 'N/A' }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Change Report:</strong>
            {{ formData.change_report || 'N/A' }}
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <v-expansion-panels class="mt-4" v-if="formDataReadOnly">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon class="me-2">mdi-database</v-icon>
        Facts Data
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-data-table
          :headers="tableFactsHeaders"
          :items="tableFactsItems"
          :items-per-page-options="[5, 10, 25, 50]"
          v-model:page="tableFactsPage"
          v-model:items-per-page="tableFactsItemsPerPage"
          :sort-by="tableFactsSortBy"
          class="elevation-1"
          density="compact"
          @update:options="handleFactsTableUpdate"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="tableFactsSearchKey"
                append-inner-icon="mdi-magnify"
                label="Search keys..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
              <v-text-field
                v-model="tableFactsSearchValue"
                append-inner-icon="mdi-magnify"
                label="Search values..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
            </v-toolbar>
          </template>

          <template v-slot:item.key="{ item }">
            <a
              :href="getFactKeyHref(item)"
              @click.left.prevent="onFactKeyClick(item)"
            >
              <code class="text-body-2">{{ item.key }}</code>
            </a>
          </template>

          <template v-slot:item.value="{ item }">
            <a
              :href="getFactValueHref(item)"
              @click.left.prevent="onFactValueClick(item)"
            >
              <span
                v-if="typeof item.value === 'string' && item.value.length > 50"
              >
                {{ item.value.substring(0, 50) }}...
                <v-tooltip activator="parent" location="top">
                  <span>{{ item.value }}</span>
                </v-tooltip>
              </span>
              <span v-else>{{ formatValue(item.value) }}</span>
            </a>
          </template>
        </v-data-table>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { reactive, ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'

const apiError = apiErrorStore()

const route = useRoute()
const router = useRouter()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

const tableFactsSearchKey = ref(route.query.facts_search_key || '')
const tableFactsSearchValue = ref(route.query.facts_search_value || '')
const tableFactsPage = ref(Number(route.query.facts_page) || 1)
const tableFactsItemsPerPage = ref(Number(route.query.facts_limit) || 10)
const tableFactsSortBy = reactive([])

// Initialize facts table sort from URL
if (route.query.facts_sort) {
  if (route.query.facts_sort_order === 'ascending') {
    tableFactsSortBy.push({
      key: route.query.facts_sort,
      order: 'asc'
    })
  } else {
    tableFactsSortBy.push({
      key: route.query.facts_sort,
      order: 'desc'
    })
  }
}
const tableFactsHeaders = [
  {
    title: 'Key',
    key: 'key',
    sortable: true,
    width: '40%'
  },
  {
    title: 'Value',
    key: 'value',
    sortable: true,
    width: '60%'
  }
]

const tableFactsItems = computed(() => {
  if (!formData.facts) return []

  return formData.facts.filter((fact) => {
    const keyMatch =
      !tableFactsSearchKey.value ||
      fact.key.toLowerCase().includes(tableFactsSearchKey.value.toLowerCase())

    const valueMatch =
      !tableFactsSearchValue.value ||
      formatValue(fact.value)
        .toLowerCase()
        .includes(tableFactsSearchValue.value.toLowerCase())

    return keyMatch && valueMatch
  })
})

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    let url = `/api/v1/nodes/${route.params.node}`
    api.delete(url).then(() => {
      router.push({
        name: 'NodesSearch'
      })
    })
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)
const formInputIdShow = ref(true)

function flattenFacts(facts, prefix = '') {
  const result = []

  if (facts === null || facts === undefined) {
    return result
  }

  if (Array.isArray(facts)) {
    facts.forEach((item, index) => {
      const key = prefix ? `${prefix}.[${index}]` : `[${index}]`

      if (typeof item === 'object' && item !== null) {
        result.push(...flattenFacts(item, key))
      } else {
        result.push({ key, value: item })
      }
    })
  } else if (typeof facts === 'object') {
    Object.keys(facts).forEach((key) => {
      const value = facts[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null) {
        result.push(...flattenFacts(value, newKey))
      } else {
        result.push({ key: newKey, value })
      }
    })
  } else {
    result.push({ key: prefix || 'root', value: facts })
  }

  return result
}

function formatValue(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

// Helper function to build query for fact key navigation
function buildFactKeyQuery(item) {
  let query = {
    fact_id: item.key
  }

  // Forward existing parameters from current URL if they exist
  if (route.query.disabled) {
    query.disabled = route.query.disabled
  }
  if (route.query.environment) {
    query.environment = route.query.environment
  }
  if (route.query.report_status) {
    query.report_status = route.query.report_status
  }
  if (route.query.fact) {
    query.fact = route.query.fact
  }

  return query
}

// Helper function to build query for fact value navigation
function buildFactValueQuery(item) {
  let query = {}

  // Forward existing fact parameters from current URL
  const currentFacts = []
  if (route.query.fact) {
    if (Array.isArray(route.query.fact)) {
      currentFacts.push(...route.query.fact)
    } else {
      currentFacts.push(route.query.fact)
    }
  }

  // Create the new fact parameter based on clicked row and put it first
  const newFactParam = `${item.key}:eq:str:${item.value}`
  const allFacts = [newFactParam, ...currentFacts]

  // Add all fact parameters to query
  if (allFacts.length > 0) {
    query.fact = allFacts
  }

  // Forward other existing parameters from current URL if they exist
  if (route.query.disabled) {
    query.disabled = route.query.disabled
  }
  if (route.query.environment) {
    query.environment = route.query.environment
  }
  if (route.query.report_status) {
    query.report_status = route.query.report_status
  }

  return query
}

function getFactKeyHref(item) {
  const query = buildFactKeyQuery(item)
  return router.resolve({
    name: 'NodesDistinctFactValues',
    query: query
  }).href
}

function onFactKeyClick(item) {
  const query = buildFactKeyQuery(item)
  router.push({
    name: 'NodesDistinctFactValues',
    query: query
  })
}

function getFactValueHref(item) {
  const query = buildFactValueQuery(item)
  return router.resolve({
    name: 'NodesSearch',
    query: query
  }).href
}

function onFactValueClick(item) {
  const query = buildFactValueQuery(item)
  router.push({
    name: 'NodesSearch',
    query: query
  })
}

function formConfigure() {
  formInputIdReadOnly.value = true
  formDataReadOnly.value = true
  formButtonEditShow.value = true
}

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete node ${route.params.node}`
}

function formReset(event) {
  event.preventDefault()
  formGetNodeData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formSubmit(event) {
  event.preventDefault()
  let method = 'put'
  let url = `/api/v1/nodes/${route.params.node}`
  let data = {
    disabled: formData.disabled
  }
  api.request(method, url, data).then(() => {
    formDataReadOnly.value = true
    formGetNodeData()
  })
}

function formGetNodeData() {
  api.get(`/api/v1/nodes/${route.params.node}`).then((data) => {
    if (data) {
      formData['id'] = data['id']
      formData['disabled'] = data['disabled']
      formData['change_catalog'] = data['change_catalog']
      formData['change_facts'] = data['change_facts']
      formData['change_last'] = data['change_last']
      formData['change_report'] = data['change_report']
      formData['facts'] = flattenFacts(data['facts'])
      formData['report'] = data['report']
    }
  })
}

function handleFactsTableUpdate(options) {
  // Update local sort state from table
  tableFactsSortBy.splice(0, tableFactsSortBy.length, ...options.sortBy)
  updateUrlQuery()
}

function updateUrlQuery() {
  let query = { ...route.query }

  // Add facts table pagination parameters
  if (tableFactsPage.value !== 1) {
    query.facts_page = tableFactsPage.value
  } else {
    delete query.facts_page
  }

  if (tableFactsItemsPerPage.value !== 10) {
    query.facts_limit = tableFactsItemsPerPage.value
  } else {
    delete query.facts_limit
  }

  // Add facts table sorting parameters
  if (tableFactsSortBy.length > 0) {
    query.facts_sort = tableFactsSortBy[0].key
    query.facts_sort_order = tableFactsSortBy[0].order === 'asc' ? 'ascending' : 'descending'
  } else {
    delete query.facts_sort
    delete query.facts_sort_order
  }

  // Add facts table search parameters
  if (tableFactsSearchKey.value) {
    query.facts_search_key = tableFactsSearchKey.value
  } else {
    delete query.facts_search_key
  }

  if (tableFactsSearchValue.value) {
    query.facts_search_value = tableFactsSearchValue.value
  } else {
    delete query.facts_search_value
  }

  router.replace({
    name: route.name,
    params: route.params,
    query: query
  })
}

// Watch for facts table state changes to update URL
watch(tableFactsPage, () => {
  updateUrlQuery()
})

watch(tableFactsItemsPerPage, () => {
  updateUrlQuery()
})

watch(tableFactsSearchKey, () => {
  updateUrlQuery()
})

watch(tableFactsSearchValue, () => {
  updateUrlQuery()
})

watch(
  () => [route.params.node],
  () => {
    if (route.name === 'NodesCRUD') {
      formConfigure()
      formGetNodeData()
    }
  }
)

onMounted(async () => {
  formConfigure()
  formGetNodeData()
  apiError.setRedirect({
    name: 'NodesSearch'
  })
})
</script>
