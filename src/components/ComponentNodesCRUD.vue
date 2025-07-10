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
            <strong>Change Catalog:</strong>
            {{ formData.change_catalog || 'N/A' }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Change Facts:</strong> {{ formData.change_facts || 'N/A' }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Change Last:</strong> {{ formData.change_last || 'N/A' }}
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
        <v-icon class="me-2">mdi-history</v-icon>
        Report Data
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row>
          <v-col cols="12" sm="6">
            <strong>Status:</strong> {{ formData.report['status'] }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Noop:</strong> {{ formData.report['noop'] }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Noop Pending:</strong> {{ formData.report['noop_pending'] }}
          </v-col>
          <v-col cols="12" sm="6">
            <strong>Corrective Change:</strong>
            {{ formData.report['corrective_change'] }}
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-data-table
          :headers="tableReportLogsHeaders"
          :items="tableReportLogsItems"
          :items-per-page="10"
          class="elevation-1"
          density="compact"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="tableReportLogsSearchLevel"
                append-inner-icon="mdi-magnify"
                label="Search level..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
              <v-text-field
                v-model="tableReportLogsSearchMessage"
                append-inner-icon="mdi-magnify"
                label="Search message..."
                single-line
                hide-details
                clearable
                class="mx-2"
                style="max-width: 250px"
              ></v-text-field>
            </v-toolbar>
          </template>

          <template v-slot:item.key="{ item }">
            <code class="text-body-2">{{ item.key }}</code>
          </template>

          <template v-slot:item.value="{ item }">
            <span
              v-if="typeof item.value === 'string' && item.value.length > 50"
            >
              {{ item.value.substring(0, 50) }}...
              <v-tooltip activator="parent" location="top">
                <span>{{ item.value }}</span>
              </v-tooltip>
            </span>
            <span v-else>{{ formatValue(item.value) }}</span>
          </template>
        </v-data-table>
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
          :items-per-page="10"
          class="elevation-1"
          density="compact"
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
            <code class="text-body-2">{{ item.key }}</code>
          </template>

          <template v-slot:item.value="{ item }">
            <span
              v-if="typeof item.value === 'string' && item.value.length > 50"
            >
              {{ item.value.substring(0, 50) }}...
              <v-tooltip activator="parent" location="top">
                <span>{{ item.value }}</span>
              </v-tooltip>
            </span>
            <span v-else>{{ formatValue(item.value) }}</span>
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

const tableFactsSearchKey = ref('')
const tableFactsSearchValue = ref('')
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

const tableReportLogsSearchLevel = ref('')
const tableReportLogsSearchMessage = ref('')
const tableReportLogsHeaders = [
  {
    title: 'time',
    key: 'time',
    sortable: false
  },
  {
    title: 'Level',
    key: 'level',
    sortable: false
  },
  {
    title: 'Message',
    key: 'message',
    sortable: false
  },
  {
    title: 'Source',
    key: 'source',
    sortable: false
  }
]

const tableReportLogsItems = computed(() => {
  if (
    !formData.report ||
    !formData.report.logs ||
    !Array.isArray(formData.report.logs)
  ) {
    return []
  }

  return formData.report.logs.filter((log) => {
    const levelMatch =
      !tableReportLogsSearchLevel.value ||
      log.level
        .toLowerCase()
        .includes(tableReportLogsSearchLevel.value.toLowerCase())

    const messageMatch =
      !tableReportLogsSearchMessage.value ||
      log.message
        .toLowerCase()
        .includes(tableReportLogsSearchMessage.value.toLowerCase())

    return levelMatch && messageMatch
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
