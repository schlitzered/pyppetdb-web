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
    </v-form>
  </v-card>
  <v-expansion-panels
    class="mt-4"
    v-model="tableExpPanFactsInject"
    @update:model-value="updateUrlQuery"
    multiple
  >
    <v-expansion-panel value="facts_inject">
      <v-expansion-panel-title>
        <v-icon class="me-2">mdi-file-edit</v-icon>
        Facts Inject
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-data-table
          :headers="
            formDataReadOnly
              ? tableFactsInjectHeadersReadOnly
              : tableFactsInjectHeaders
          "
          :items="tableFactsInjectItems"
          :items-per-page-options="[5, 10, 25, 50]"
          class="elevation-1"
          density="compact"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Inject Facts</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="tableFactsInjectSearchKey"
                @update:model-value="updateUrlQuery"
                append-inner-icon="mdi-magnify"
                label="Search keys..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
              <v-text-field
                v-model="tableFactsInjectSearchValue"
                @update:model-value="updateUrlQuery"
                append-inner-icon="mdi-magnify"
                label="Search values..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
              <v-dialog
                v-if="!formDataReadOnly"
                v-model="dialogFactsInject"
                max-width="500px"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="primary"
                    dark
                    v-bind="props"
                    prepend-icon="mdi-plus"
                  >
                    Add Inject
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formFactsInjectTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="editedFactsInject.key"
                            :readonly="editedFactsInjectIndex !== -1"
                            label="Key"
                            :rules="[(v) => !!v || 'Key is required']"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="editedFactsInject.value"
                            label="Value"
                            :rules="[(v) => !!v || 'Value is required']"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue-darken-1"
                      variant="text"
                      @click="closeFactsInject"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="blue-darken-1"
                      variant="text"
                      @click="saveFactsInject"
                    >
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-if="!formDataReadOnly" v-slot:item.actions="{ item }">
            <v-icon
              size="small"
              class="me-2"
              @click="editFactsInjectItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteFactsInjectItem(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <v-card v-if="!formDataReadOnly">
    <v-divider></v-divider>
    <v-card-actions>
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
  </v-card>
  <v-expansion-panels
    class="mt-4"
    v-if="formDataReadOnly"
    v-model="tableExpPan"
    @update:model-value="updateUrlQuery"
    multiple
  >
    <v-expansion-panel value="change">
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
    <v-expansion-panel value="facts">
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
                @update:model-value="updateUrlQuery"
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
                @update:model-value="updateUrlQuery"
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
import {
  syncExpPanelToUrl,
  syncPaginationToUrl,
  syncSimpleStringToUrl,
  syncSortToUrl
} from '@/common/url_state_sync'
import { reactive, ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'
import { useCrudReload } from '@/common/crud_generic'

const apiError = apiErrorStore()

const route = useRoute()
const router = useRouter()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

const tableFactsSearchKey = ref(route.query.search_key_facts || '')
const tableFactsSearchValue = ref(route.query.search_value_facts || '')
const tableFactsPage = ref(Number(route.query.page_facts) || 1)
const tableFactsItemsPerPage = ref(Number(route.query.limit_facts) || 10)
const tableFactsInjectSearchKey = ref(route.query.search_key_facts_inject || '')
const tableFactsInjectSearchValue = ref(
  route.query.search_value_facts_inject || ''
)
const tableFactsSortBy = reactive([])
const tableExpPanName = 'default'
const tableExpPan = ref(
  route.query['exp_pan_' + tableExpPanName]
    ? route.query['exp_pan_' + tableExpPanName].split(',')
    : []
)
const tableExpPanFactsInjectName = 'facts_inject'
const tableExpPanFactsInject = ref(
  route.query['exp_pan_' + tableExpPanFactsInjectName]
    ? route.query['exp_pan_' + tableExpPanFactsInjectName].split(',')
    : []
)

if (route.query.sort_facts) {
  if (route.query.sort_order_facts === 'ascending') {
    tableFactsSortBy.push({
      key: route.query.sort_facts,
      order: 'asc'
    })
  } else {
    tableFactsSortBy.push({
      key: route.query.sort_facts,
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

const tableFactsInjectHeadersReadOnly = [
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

const tableFactsInjectHeaders = [
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
    width: '50%'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '10%'
  }
]

function filterItemsByKeyValue(
  items,
  keySearch,
  valueSearch,
  valueFormatter = (v) => v
) {
  return items.filter((item) => {
    const keyMatch =
      !keySearch.value ||
      item.key.toLowerCase().includes(keySearch.value.toLowerCase())

    const valueMatch =
      !valueSearch.value ||
      valueFormatter(item.value)
        .toLowerCase()
        .includes(valueSearch.value.toLowerCase())

    return keyMatch && valueMatch
  })
}

const tableFactsInjectItems = computed(() => {
  if (!formData.facts_inject) return []

  const items = Object.entries(formData.facts_inject).map(([key, value]) => ({
    key,
    value
  }))

  return filterItemsByKeyValue(
    items,
    tableFactsInjectSearchKey,
    tableFactsInjectSearchValue
  )
})

const dialogFactsInject = ref(false)
const editedFactsInjectIndex = ref(-1)
const editedFactsInject = reactive({
  key: '',
  value: ''
})
const defaultFactsInject = {
  key: '',
  value: ''
}

const formFactsInjectTitle = computed(() => {
  return editedFactsInjectIndex.value === -1 ? 'New Inject' : 'Edit Inject'
})

const tableFactsItems = computed(() => {
  if (!formData.facts) return []
  return filterItemsByKeyValue(
    formData.facts,
    tableFactsSearchKey,
    tableFactsSearchValue,
    formatValue
  )
})

function dialogDeleteEvent(action) {
  dialogDeleteShow.value = false
  dialogDeleteMsg.value = ''

  if (action !== 'cancel') {
    api.delete(`/api/v1/nodes/${route.params.node}`).then(() => {
      router.push({ name: 'NodesSearch' })
    })
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(true)
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

function buildFactKeyQuery(item) {
  return { fact_id: item.key }
}

function buildFactValueQuery(item) {
  const currentFacts = Array.isArray(route.query.fact)
    ? route.query.fact
    : route.query.fact
      ? [route.query.fact]
      : []

  const newFactParam = `${item.key}:eq:str:${item.value}`
  return { fact: [newFactParam, ...currentFacts] }
}

function getFactKeyHref(item) {
  return router.resolve({
    name: 'NodesDistinctFactValues',
    query: buildFactKeyQuery(item)
  }).href
}

function onFactKeyClick(item) {
  router.push({
    name: 'NodesDistinctFactValues',
    query: buildFactKeyQuery(item)
  })
}

function getFactValueHref(item) {
  return router.resolve({
    name: 'NodesSearch',
    query: buildFactValueQuery(item)
  }).href
}

function onFactValueClick(item) {
  router.push({
    name: 'NodesSearch',
    query: buildFactValueQuery(item)
  })
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
    disabled: formData.disabled,
    facts_inject: formData.facts_inject || {}
  }
  api.request(method, url, data).then(() => {
    formDataReadOnly.value = true
    formGetNodeData()
  })
}

const { reload } = useCrudReload(formGetNodeData)
defineExpose({ reload })

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
      formData['facts_inject'] = data['facts_inject'] || {}
      formData['report'] = data['report']
    }
  })
}

function handleFactsTableUpdate(options) {
  tableFactsSortBy.splice(0, tableFactsSortBy.length, ...options.sortBy)
  updateUrlQuery()
}

function updateUrlQuery() {
  let query = {}
  syncExpPanelToUrl(query, tableExpPanName, tableExpPan.value)
  syncExpPanelToUrl(
    query,
    tableExpPanFactsInjectName,
    tableExpPanFactsInject.value
  )
  syncPaginationToUrl(
    query,
    tableFactsPage.value,
    tableFactsItemsPerPage.value,
    'facts'
  )
  syncSortToUrl(query, tableFactsSortBy, tableFactsSortBy, 'facts')
  syncSimpleStringToUrl(query, 'search_key_facts', tableFactsSearchKey.value)
  syncSimpleStringToUrl(
    query,
    'search_value_facts',
    tableFactsSearchValue.value
  )
  syncSimpleStringToUrl(
    query,
    'search_key_facts_inject',
    tableFactsInjectSearchKey.value
  )
  syncSimpleStringToUrl(
    query,
    'search_value_facts_inject',
    tableFactsInjectSearchValue.value
  )

  router.replace({
    name: route.name,
    params: route.params,
    query: query
  })
}

function editFactsInjectItem(item) {
  editedFactsInjectIndex.value = tableFactsInjectItems.value.findIndex(
    (i) => i.key === item.key
  )
  Object.assign(editedFactsInject, item)
  dialogFactsInject.value = true
}

function deleteFactsInjectItem(item) {
  if (!formData.facts_inject) return
  delete formData.facts_inject[item.key]
}

function closeFactsInject() {
  dialogFactsInject.value = false
  nextTick(() => {
    Object.assign(editedFactsInject, defaultFactsInject)
    editedFactsInjectIndex.value = -1
  })
}

function saveFactsInject() {
  if (!editedFactsInject.key || !editedFactsInject.value) return

  if (!formData.facts_inject) {
    formData.facts_inject = {}
  }

  formData.facts_inject[editedFactsInject.key] = editedFactsInject.value
  closeFactsInject()
}

onMounted(async () => {
  formGetNodeData()
  apiError.setRedirect({
    name: 'NodesSearch'
  })
})
</script>
