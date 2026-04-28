<template>
  <v-card>
    <v-form ref="form" v-model="formDataValid">
      <v-card-text>
        <v-row v-if="formData.id">
          <v-col cols="4">
            <v-text-field
              v-model="formData.id"
              label="Job ID"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="formData.created_at"
              label="Created At"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="formData.created_by"
              label="Created By"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-select
          v-model="formData.definition_id"
          :items="definitionChoices"
          label="Job Definition"
          :readonly="formDataReadOnly"
          @update:model-value="onDefinitionChange"
          :rules="[() => !!formData.definition_id || 'This field is required']"
        ></v-select>

        <v-divider class="my-4"></v-divider>
        <v-label class="mb-2">Node Filters (AND connected parts, OR connected blocks)</v-label>
        <div v-if="!formDataReadOnly">
          <v-card
            v-for="(filter, filterIndex) in nodeFilterBlocks"
            :key="filterIndex"
            variant="outlined"
            class="mb-4 pa-4"
          >
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-1 font-weight-bold"
                >Filter Block #{{ filterIndex + 1 }} (AND parts)</span
              >
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="red"
                @click="removeFilterBlock(filterIndex)"
                :disabled="nodeFilterBlocks.length <= 1"
              ></v-btn>
            </div>

            <div
              v-for="(part, partIndex) in filter"
              :key="partIndex"
              class="ml-4 mt-2"
            >
              <v-row align="center">
                <v-col cols="3">
                  <v-text-field v-model="part.fact" label="Fact" hide-details @update:model-value="onFilterUpdate"></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-select v-model="part.operator" :items="['eq','gt','gte','in','lt','lte','ne','nin','regex']" label="Op" hide-details @update:model-value="onFilterUpdate"></v-select>
                </v-col>
                <v-col cols="2">
                   <v-select v-model="part.type" :items="['str','int','float','bool']" label="Type" hide-details @update:model-value="onFilterUpdate"></v-select>
                </v-col>
                <v-col cols="4">
                   <v-text-field v-model="part.value" label="Value" hide-details @update:model-value="onFilterUpdate"></v-text-field>
                </v-col>
                <v-col cols="1">
                  <v-btn
                    icon="mdi-minus-circle-outline"
                    size="small"
                    variant="text"
                    color="red"
                    @click="removePart(filterIndex, partIndex)"
                    :disabled="filter.length <= 1"
                  ></v-btn>
                </v-col>
              </v-row>
            </div>
            <v-btn
              prepend-icon="mdi-plus"
              size="small"
              variant="text"
              color="primary"
              @click="addPart(filterIndex)"
              class="mt-2"
              >Add AND Part</v-btn
            >
          </v-card>
          <v-btn
            prepend-icon="mdi-plus"
            color="primary"
            variant="tonal"
            @click="addFilterBlock"
            >Add OR Block</v-btn
          >
        </div>
        <div v-else>
           <v-chip v-for="(f, i) in formData.node_filter" :key="i" class="ma-1">{{ f }}</v-chip>
        </div>

        <v-divider class="my-4"></v-divider>
        <v-label class="mb-2">Node Targeting Analysis & Run Status</v-label>
        <v-data-table
          :headers="nodeHeaders"
          :items="combinedNodes"
          :loading="nodesLoading || nodeJobStatusesLoading"
          density="compact"
          class="elevation-1 mb-4"
        >
          <template v-slot:item.node_job_id="{ item }">
            <router-link
              v-if="item.node_job_id"
              :to="{ name: 'JobsNodesJobsCRUD', params: { node_job_id: item.node_job_id } }"
            >
              {{ item.node_job_id }}
            </router-link>
            <span v-else>-</span>
          </template>
          <template v-slot:item.state="{ item }">
            <v-chip
              v-if="item.state === 'original_only'"
              color="warning"
              size="x-small"
              variant="flat"
            >
              Missing from current filter
            </v-chip>
            <v-chip
              v-else-if="item.state === 'current_only'"
              color="info"
              size="x-small"
              variant="flat"
            >
              New matching node
            </v-chip>
            <v-chip
              v-else
              color="success"
              size="x-small"
              variant="outlined"
            >
              Targeted
            </v-chip>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip
              v-if="item.status"
              :color="getStatusColor(item.status)"
              size="x-small"
            >
              {{ item.status }}
            </v-chip>
            <span v-else>-</span>
          </template>
          <template v-slot:item.remote_agent.connected="{ item }">
            <v-icon :color="item.remote_agent?.connected ? 'success' : 'error'">
              {{ item.remote_agent?.connected ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
          </template>
        </v-data-table>

        <v-divider class="my-4"></v-divider>
        <v-list-subheader v-if="Object.keys(jobParams).length">Parameters</v-list-subheader>
        <div v-for="(def, name) in jobParams" :key="'param-' + name">
           <v-text-field
             v-if="def.type !== 'bool' && def.type !== 'enum'"
             v-model="formData.parameters[name]"
             :label="name"
             :readonly="formDataReadOnly"
             :type="def.type === 'int' || def.type === 'float' ? 'number' : 'text'"
           ></v-text-field>
           <v-select
             v-else-if="def.type === 'enum'"
             v-model="formData.parameters[name]"
             :items="def.options"
             :label="name"
             :readonly="formDataReadOnly"
           ></v-select>
           <v-switch
             v-else-if="def.type === 'bool'"
             v-model="formData.parameters[name]"
             :label="name"
             :readonly="formDataReadOnly"
           ></v-switch>
        </div>

        <v-list-subheader v-if="Object.keys(jobEnvVars).length">Environment Variables</v-list-subheader>
        <div v-for="(def, name) in jobEnvVars" :key="'env-' + name">
           <v-text-field
             v-if="def.type !== 'bool' && def.type !== 'enum'"
             v-model="formData.env_vars[name]"
             :label="name"
             :readonly="formDataReadOnly"
             :type="def.type === 'int' || def.type === 'float' ? 'number' : 'text'"
           ></v-text-field>
           <v-select
             v-else-if="def.type === 'enum'"
             v-model="formData.env_vars[name]"
             :items="def.options"
             :label="name"
             :readonly="formDataReadOnly"
           ></v-select>
           <v-switch
             v-else-if="def.type === 'bool'"
             v-model="formData.env_vars[name]"
             :label="name"
             :readonly="formDataReadOnly"
           ></v-switch>
        </div>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="formSubmit" :disabled="!canSubmit">Submit</v-btn>
      </v-card-actions>
      <v-card-actions v-else>
        <v-spacer></v-spacer>
        <v-btn color="red" variant="tonal" @click="onCancelClick" prepend-icon="mdi-cancel">Cancel Job</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/api/common'
import { useCrudReload } from '@/common/crud_generic'

const route = useRoute()
const router = useRouter()

const form = ref(null)
const formData = reactive({
  id: '',
  definition_id: '',
  parameters: {},
  env_vars: {},
  node_filter: [],
  nodes: [],
  created_at: '',
  created_by: ''
})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const definitionChoices = ref([])
const jobParams = ref({})
const jobEnvVars = ref({})

const currentlyMatchingNodes = ref([])
const nodesLoading = ref(false)
const nodeJobStatuses = ref({})
const nodeJobStatusesLoading = ref(false)

const nodeHeaders = [
  { title: 'Node ID', key: 'id' },
  { title: 'Connected', key: 'remote_agent.connected' },
  { title: 'Targeting State', key: 'state' },
  { title: 'Node Job ID', key: 'node_job_id' },
  { title: 'Run Status', key: 'status' }
]

const combinedNodes = computed(() => {
  const originalNodeIds = formData.nodes || []
  const currentNodes = currentlyMatchingNodes.value || []
  const combined = []
  const processedIds = new Set()

  currentNodes.forEach(node => {
    processedIds.add(node.id)
    const statusInfo = nodeJobStatuses.value[node.id] || {}
    combined.push({
      ...node,
      state: originalNodeIds.includes(node.id) ? 'both' : 'current_only',
      node_job_id: statusInfo.id,
      status: statusInfo.status
    })
  })

  originalNodeIds.forEach(id => {
    if (!processedIds.has(id)) {
      const statusInfo = nodeJobStatuses.value[id] || {}
      combined.push({
        id: id,
        remote_agent: { connected: false },
        state: 'original_only',
        node_job_id: statusInfo.id,
        status: statusInfo.status
      })
    }
  })

  return combined
})

const nodeFilterBlocks = ref([
  [{ fact: '', operator: 'eq', type: 'str', value: '' }]
])

const canSubmit = computed(() => {
  return formData.definition_id && combinedNodes.value.filter(n => n.state !== 'original_only').length > 0
})

function getStatusColor(status) {
  switch (status) {
    case 'success': return 'success'
    case 'failed': return 'error'
    case 'running': return 'info'
    default: return 'grey'
  }
}

function onCancelClick() {
  if (confirm(`Are you sure you want to cancel job ${formData.id}?`)) {
    api.post(`/api/v1/jobs/jobs/${formData.id}/cancel`).then(() => {
      formGetData()
    })
  }
}

function initializeFormState() {
  if (route.params.job_id !== '_new') {
    formDataReadOnly.value = true
  } else {
    formDataReadOnly.value = false
  }
  formGetData()
}

initializeFormState()

watch(
  () => route.params.job_id,
  () => {
    initializeFormState()
  }
)

function formReset(event) {
  event.preventDefault()
  formGetData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formSubmit(event) {
  event.preventDefault()
  
  const formattedFilter = getFormattedFilters()

  const castValues = (values, definitions) => {
    const casted = {}
    Object.entries(values).forEach(([k, v]) => {
      const type = definitions[k]?.type
      if (type === 'int' || type === 'float') {
        casted[k] = Number(v)
      } else {
        casted[k] = v
      }
    })
    return casted
  }

  const data = {
    definition_id: formData.definition_id,
    parameters: castValues(formData.parameters, jobParams.value),
    env_vars: castValues(formData.env_vars, jobEnvVars.value),
    node_filter: formattedFilter
  }

  api.post('/api/v1/jobs/jobs', data).then((res) => {
    router.push({
      name: 'JobsCRUD',
      params: { job_id: res.id }
    })
  })
}

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

function formGetData() {
  getDefinitions()
  if (route.params.job_id === '_new') {
    formData.id = ''
    formData.definition_id = ''
    formData.parameters = {}
    formData.env_vars = {}
    formData.node_filter = []
    formData.nodes = []
    jobParams.value = {}
    jobEnvVars.value = {}
    nodeFilterBlocks.value = [[{ fact: '', operator: 'eq', type: 'str', value: '' }]]
    currentlyMatchingNodes.value = []
    nodeJobStatuses.value = {}
  } else {
    api.get(`/api/v1/jobs/jobs/${route.params.job_id}`).then((data) => {
      if (data) {
        Object.assign(formData, data)
        onDefinitionChange(data.definition_id)
        updateMatchingNodes()
        fetchNodeJobStatuses(data.id)
      }
    })
  }
}

function getDefinitions() {
  api.get('/api/v1/jobs/definitions', { limit: 1000 }).then((data) => {
    if (data) {
      definitionChoices.value = data.result.map(d => d.id)
    }
  })
}

function onDefinitionChange(defId) {
  if (!defId) return
  api.get(`/api/v1/jobs/definitions/${defId}`).then((data) => {
    if (data) {
      jobParams.value = data.params
      jobEnvVars.value = data.environment_variables
      
      if (!formDataReadOnly.value) {
        formData.parameters = {}
        Object.entries(data.params).forEach(([k, v]) => {
          formData.parameters[k] = v.type === 'bool' ? false : (v.type === 'int' || v.type === 'float' ? 0 : '')
        })
        formData.env_vars = {}
        Object.entries(data.environment_variables).forEach(([k, v]) => {
          formData.env_vars[k] = v.type === 'bool' ? false : (v.type === 'int' || v.type === 'float' ? 0 : '')
        })
      }
    }
  })
}

function addFilterBlock() {
  nodeFilterBlocks.value.push([{ fact: '', operator: 'eq', type: 'str', value: '' }])
  onFilterUpdate()
}

function removeFilterBlock(index) {
  nodeFilterBlocks.value.splice(index, 1)
  onFilterUpdate()
}

function addPart(filterIndex) {
  nodeFilterBlocks.value[filterIndex].push({ fact: '', operator: 'eq', type: 'str', value: '' })
  onFilterUpdate()
}

function removePart(filterIndex, partIndex) {
  nodeFilterBlocks.value[filterIndex].splice(partIndex, 1)
  onFilterUpdate()
}

let filterTimer = null
function onFilterUpdate() {
  if (formDataReadOnly.value) return
  clearTimeout(filterTimer)
  filterTimer = setTimeout(() => {
    updateMatchingNodes()
  }, 500)
}

function getFormattedFilters() {
  if (formDataReadOnly.value) {
    return formData.node_filter || []
  }
  const formattedFilter = []
  nodeFilterBlocks.value.forEach(block => {
    block.forEach(part => {
      if (part.fact && part.operator && part.type && part.value !== undefined) {
        formattedFilter.push(`${part.fact}:${part.operator}:${part.type}:${part.value}`)
      }
    })
  })
  return formattedFilter
}

function updateMatchingNodes() {
  const filters = getFormattedFilters()
  if (filters.length === 0) {
    currentlyMatchingNodes.value = []
    return
  }

  nodesLoading.value = true
  api.get('/api/v1/nodes', { fact: filters, limit: 1000 }).then((data) => {
    if (data) {
      currentlyMatchingNodes.value = data.result
    }
  }).finally(() => {
    nodesLoading.value = false
  })
}

function fetchNodeJobStatuses(jobId) {
  if (!jobId) return
  nodeJobStatusesLoading.value = true
  api.get('/api/v1/jobs/nodes_jobs', { job_id: jobId, limit: 1000 }).then((data) => {
    if (data && data.result) {
      const statuses = {}
      data.result.forEach(nj => {
        statuses[nj.node_id] = { id: nj.id, status: nj.status }
      })
      nodeJobStatuses.value = statuses
    }
  }).finally(() => {
    nodeJobStatusesLoading.value = false
  })
}
</script>
