<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else class="flex flex-col gap-6">
      <Card
        class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
      >
        <template #content>
          <form @submit.prevent="handleSave" class="flex flex-col gap-6">
            <div
              v-if="formData.id"
              class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-zinc-500">Job ID</span>
                <span
                  class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  {{ formData.id }}
                </span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-zinc-500"
                  >Created At</span
                >
                <span
                  class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  {{
                    formData.created_at
                      ? new Date(formData.created_at).toLocaleString()
                      : ''
                  }}
                </span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-zinc-500"
                  >Created By</span
                >
                <span
                  class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >
                  {{ formData.created_by }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="definition_id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Job Definition *
              </label>
              <Select
                id="definition_id"
                v-model="formData.definition_id"
                :options="definitionChoices"
                :disabled="formDataReadOnly"
                @change="handleDefinitionChange"
                placeholder="Select a Job Definition"
                class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-55"
              />
            </div>

            <div class="flex flex-col gap-2">
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Node Filters (AND connected parts inside blocks, OR connected
                between blocks)
              </span>

              <div v-if="!formDataReadOnly" class="flex flex-col gap-4">
                <div
                  v-for="(filter, filterIndex) in nodeFilterBlocks"
                  :key="filterIndex"
                  class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-3"
                >
                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm font-bold text-zinc-700 dark:text-zinc-300"
                    >
                      Filter Block #{{ filterIndex + 1 }}
                    </span>
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      variant="text"
                      :disabled="nodeFilterBlocks.length <= 1"
                      @click="removeFilterBlock(filterIndex)"
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <div
                      v-for="(part, partIndex) in filter"
                      :key="partIndex"
                      class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                    >
                      <div class="md:col-span-4">
                        <AutoComplete
                          v-model="part.fact"
                          :suggestions="factSuggestions"
                          @complete="
                            searchFacts($event, filterIndex, partIndex)
                          "
                          @update:model-value="handleFilterUpdate"
                          :dropdown="true"
                          placeholder="Fact"
                          class="w-full"
                          input-class="w-full p-inputtext-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <Select
                          v-model="part.operator"
                          :options="operatorsFor(part)"
                          placeholder="Op"
                          @change="handleFilterUpdate"
                          class="w-full p-dropdown-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <Select
                          v-model="part.type"
                          :options="['str', 'int', 'float', 'bool']"
                          :disabled="!!part.kind"
                          placeholder="Type"
                          @change="handleFilterUpdate"
                          class="w-full p-dropdown-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                      <div class="md:col-span-3">
                        <MultiSelect
                          v-if="
                            usesValueChoices(part) &&
                            LIST_OPERATORS.includes(part.operator)
                          "
                          :model-value="part.value ? part.value.split(',') : []"
                          @update:model-value="
                            (v: string[]) => {
                              part.value = v.join(',')
                              handleFilterUpdate()
                            }
                          "
                          :options="part.values"
                          option-label="label"
                          option-value="value"
                          filter
                          display="chip"
                          :virtual-scroller-options="
                            part.values.length > 50
                              ? { itemSize: 32 }
                              : undefined
                          "
                          placeholder="Values"
                          class="w-full bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                        <Select
                          v-else-if="usesValueChoices(part)"
                          v-model="part.value"
                          :options="part.values"
                          option-label="label"
                          option-value="value"
                          filter
                          :virtual-scroller-options="
                            part.values.length > 50
                              ? { itemSize: 32 }
                              : undefined
                          "
                          placeholder="Value"
                          @change="handleFilterUpdate"
                          class="w-full p-dropdown-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                        <InputText
                          v-else
                          v-model="part.value"
                          :placeholder="valuePlaceholder(part)"
                          @input="handleFilterUpdate"
                          class="w-full p-inputtext-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                      <div class="md:col-span-1 flex justify-center">
                        <Button
                          icon="pi pi-minus-circle"
                          severity="danger"
                          variant="text"
                          :disabled="filter.length <= 1"
                          @click="removePart(filterIndex, partIndex)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      label="Add AND Part"
                      icon="pi pi-plus"
                      size="small"
                      variant="text"
                      @click="addPart(filterIndex)"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    label="Add OR Block"
                    icon="pi pi-plus-circle"
                    size="small"
                    variant="outlined"
                    @click="addFilterBlock"
                  />
                </div>
              </div>

              <div v-else class="flex flex-wrap gap-2">
                <div
                  v-for="(filterStr, filterIndex) in formData.node_filter"
                  :key="filterIndex"
                  class="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded font-mono text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                >
                  {{ filterStr }}
                </div>
              </div>
            </div>

            <div
              v-if="Object.keys(jobParams).length > 0"
              class="flex flex-col gap-3"
            >
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Job Parameters
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(paramDef, name) in jobParams"
                  :key="name"
                  class="flex flex-col gap-1"
                >
                  <label
                    :for="'param-' + name"
                    class="text-xs font-semibold text-zinc-500"
                  >
                    {{ name }} ({{ paramDef.type }})
                  </label>
                  <JobParamInput
                    v-model="formData.parameters[name]"
                    :input-id="'param-' + name"
                    :def="paramDef"
                    :disabled="formDataReadOnly"
                    :error="paramErrors[name]"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="Object.keys(jobEnvVars).length > 0"
              class="flex flex-col gap-3"
            >
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Environment Variables
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(envDef, name) in jobEnvVars"
                  :key="name"
                  class="flex flex-col gap-1"
                >
                  <label
                    :for="'env-' + name"
                    class="text-xs font-semibold text-zinc-500"
                  >
                    {{ name }} ({{ envDef.type }})
                  </label>
                  <JobParamInput
                    v-model="formData.env_vars[name]"
                    :input-id="'env-' + name"
                    :def="envDef"
                    :disabled="formDataReadOnly"
                    :error="envErrors[name]"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Target Nodes
              </span>

              <DataTable
                :value="combinedNodes"
                :loading="nodesLoading || nodeJobStatusesLoading"
                class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
              >
                <Column field="id" header="Node ID" sortable />
                <Column
                  field="remote_agent.connected"
                  header="Connected"
                  sortable
                >
                  <template #body="slotProps">
                    <Tag
                      :value="
                        slotProps.data.remote_agent?.connected ? 'Yes' : 'No'
                      "
                      :severity="
                        slotProps.data.remote_agent?.connected
                          ? 'success'
                          : 'danger'
                      "
                    />
                  </template>
                </Column>
                <Column field="state" header="Targeting State" sortable>
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.state"
                      :severity="
                        slotProps.data.state === 'original_only'
                          ? 'warn'
                          : 'info'
                      "
                    />
                  </template>
                </Column>
                <Column field="node_job_id" header="Node Job ID">
                  <template #body="slotProps">
                    <router-link
                      v-if="slotProps.data.node_job_id"
                      :to="{
                        name: 'JobsNodesJobsCRUD',
                        params: { node_job_id: slotProps.data.node_job_id }
                      }"
                      class="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline font-medium font-mono text-xs"
                    >
                      {{ slotProps.data.node_job_id }}
                    </router-link>
                  </template>
                </Column>
                <Column field="status" header="Run Status">
                  <template #body="slotProps">
                    <Tag
                      v-if="slotProps.data.status"
                      :value="slotProps.data.status"
                      :severity="getStatusSeverity(slotProps.data.status)"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>

            <div
              class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
            >
              <Button
                v-if="
                  formData.id && hasJobCreatePermission(formData.definition_id)
                "
                label="Cancel Job"
                severity="danger"
                icon="pi pi-times"
                class="px-4 py-2"
                @click="handleCancelJob"
              />
              <div v-else></div>

              <div class="flex gap-3">
                <Button
                  label="Cancel"
                  class="p-button-text p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2"
                  @click="handleCancel"
                />
                <Button
                  v-if="!formDataReadOnly"
                  type="submit"
                  label="Create Job"
                  icon="pi pi-check"
                  :disabled="!canSubmit"
                  class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none px-4 py-2 font-medium"
                />
              </div>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import JobParamInput from '@/components/special/JobParamInput.vue'
import type { ResourceDefinition } from '@/types/resources'
import type { JobParamDefinition } from '@/types/jobParams'

defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const auth = authStore()

const loading = ref(true)
const formDataReadOnly = ref(false)
const definitionChoices = ref<string[]>([])
const jobParams = ref<Record<string, any>>({})
const jobEnvVars = ref<Record<string, any>>({})

const currentlyMatchingNodes = ref<any[]>([])
const nodesLoading = ref(false)
const nodeJobStatuses = ref<Record<string, any>>({})
const nodeJobStatusesLoading = ref(false)

let filterTimer: any = null

const formData = reactive<Record<string, any>>({
  id: '',
  definition_id: '',
  parameters: {},
  env_vars: {},
  node_filter: [],
  nodes: [],
  created_at: '',
  created_by: '',
  status: ''
})

const nodeFilterBlocks = ref<any[]>([
  [
    {
      fact: '',
      operator: 'eq',
      type: 'str',
      value: ''
    }
  ]
])

const combinedNodes = computed(() => {
  const originalNodeIds = formData.nodes || []
  const currentNodes = currentlyMatchingNodes.value || []
  const combined: any[] = []
  const processedIds = new Set<string>()

  currentNodes.forEach((node) => {
    processedIds.add(node.id)
    const statusInfo = nodeJobStatuses.value[node.id] || {}
    combined.push({
      ...node,
      state: originalNodeIds.includes(node.id) ? 'both' : 'current_only',
      node_job_id: statusInfo.id,
      status: statusInfo.status
    })
  })

  originalNodeIds.forEach((id: string) => {
    if (!processedIds.has(id)) {
      const statusInfo = nodeJobStatuses.value[id] || {}
      combined.push({
        id: id,
        remote_agent: {
          connected: false
        },
        state: 'original_only',
        node_job_id: statusInfo.id,
        status: statusInfo.status
      })
    }
  })

  return combined
})

const hasJobCreatePermission = (definitionId: string) => {
  if (auth.hasPermission(PERMISSIONS.JOBS.JOB.CREATE)) {
    return true
  }
  if (
    definitionId &&
    auth.hasPermission(PERMISSIONS.JOBS.JOB.CREATE_SPECIFIC(definitionId))
  ) {
    return true
  }
  return false
}

// Validate a single param/env value against its definition's validators.
// Empty is treated as "not provided" (allowed); a provided value must satisfy
// the type-specific constraints.
const validateJobParamValue = (
  def: JobParamDefinition,
  value: unknown
): string | null => {
  const isEmpty = value === '' || value === null || value === undefined
  if (def.type === 'enum') {
    if (isEmpty) return null
    const options = def.options || []
    if (options.length > 0 && !options.includes(String(value))) {
      return 'Must be one of the allowed options'
    }
    return null
  }
  if (def.type === 'int' || def.type === 'float') {
    if (isEmpty) return null
    const num = Number(value)
    if (Number.isNaN(num)) return 'Must be a number'
    if (def.type === 'int' && !Number.isInteger(num)) {
      return 'Must be an integer'
    }
    if (def.min !== null && def.min !== undefined && num < def.min) {
      return `Must be ≥ ${def.min}`
    }
    if (def.max !== null && def.max !== undefined && num > def.max) {
      return `Must be ≤ ${def.max}`
    }
    return null
  }
  if (def.type === 'string' && !isEmpty && def.regex) {
    let re: RegExp
    try {
      re = new RegExp(def.regex)
    } catch {
      return null
    }
    if (!re.test(String(value))) {
      return `Must match ${def.regex}`
    }
  }
  return null
}

const buildParamErrors = (
  defs: Record<string, JobParamDefinition>,
  values: Record<string, unknown>
): Record<string, string> => {
  const errors: Record<string, string> = {}
  for (const [name, def] of Object.entries(defs)) {
    const err = validateJobParamValue(def, values[name])
    if (err) errors[name] = err
  }
  return errors
}

const paramErrors = computed(() =>
  buildParamErrors(jobParams.value, formData.parameters)
)
const envErrors = computed(() =>
  buildParamErrors(jobEnvVars.value, formData.env_vars)
)
const hasValidationErrors = computed(
  () =>
    Object.keys(paramErrors.value).length > 0 ||
    Object.keys(envErrors.value).length > 0
)

const canSubmit = computed(() => {
  const activeNodesCount = combinedNodes.value.filter(
    (n) => n.state !== 'original_only'
  ).length
  return (
    formData.definition_id &&
    activeNodesCount > 0 &&
    !hasValidationErrors.value &&
    hasJobCreatePermission(formData.definition_id)
  )
})

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'info'
    default:
      return 'secondary'
  }
}

const addFilterBlock = () => {
  nodeFilterBlocks.value.push([
    {
      fact: '',
      operator: 'eq',
      type: 'str',
      value: ''
    }
  ])
  handleFilterUpdate()
}

const removeFilterBlock = (index: number) => {
  nodeFilterBlocks.value.splice(index, 1)
  handleFilterUpdate()
}

const addPart = (filterIndex: number) => {
  nodeFilterBlocks.value[filterIndex].push({
    fact: '',
    operator: 'eq',
    type: 'str',
    value: ''
  })
  handleFilterUpdate()
}

const removePart = (filterIndex: number, partIndex: number) => {
  nodeFilterBlocks.value[filterIndex].splice(partIndex, 1)
  handleFilterUpdate()
}

type FactKind = 'str' | 'int' | 'float' | 'bool'

const ALL_OPERATORS = [
  'eq',
  'gt',
  'gte',
  'in',
  'lt',
  'lte',
  'ne',
  'nin',
  'regex'
]
const NUMERIC_OPERATORS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin']
const KIND_OPERATORS: Record<FactKind, string[]> = {
  str: ['eq', 'ne', 'in', 'nin', 'regex'],
  int: NUMERIC_OPERATORS,
  float: NUMERIC_OPERATORS,
  bool: ['eq', 'ne']
}
const RANGE_OPERATORS = ['gt', 'gte', 'lt', 'lte']
const LIST_OPERATORS = ['in', 'nin']
const CHOICE_OPERATORS = ['eq', 'ne', 'in', 'nin']

const availableFacts = ref<string[]>([])
const factSuggestions = ref<string[]>([])

// ponytail: per-instance cache, never invalidated — facts don't change
// meaningfully while someone is building a filter
const requestCache = new Map<string, Promise<any>>()
const cachedGet = (url: string, params: Record<string, any>) => {
  const key = url + JSON.stringify(params)
  if (!requestCache.has(key)) {
    requestCache.set(
      key,
      api.get<any>(url, params, true).catch((err) => {
        requestCache.delete(key)
        throw err
      })
    )
  }
  return requestCache.get(key)!
}

const loadFactNames = async () => {
  try {
    const data = await api.get<any>('/api/v1/nodes/_distinct_fact_names')
    if (data && data.result) {
      availableFacts.value = data.result
    }
  } catch (err) {
    console.error(err)
  }
}

const formatPart = (part: any) => {
  if (part.fact && part.operator && part.type && part.value !== undefined) {
    return `${part.fact}:${part.operator}:${part.type}:${part.value}`
  }
  return null
}

// the AND parts before this one; suggestions for a part only offer what
// still matches nodes selected by its predecessors
const precedingFilters = (block: any[], partIndex: number) =>
  block
    .slice(0, partIndex)
    .filter((part: any) => part.value !== '')
    .map(formatPart)
    .filter((f): f is string => f !== null)

const searchFacts = async (
  event: { query: string },
  filterIndex: number,
  partIndex: number
) => {
  const query = (event.query || '').toLowerCase()
  let names = availableFacts.value
  const context = precedingFilters(
    nodeFilterBlocks.value[filterIndex] || [],
    partIndex
  )
  if (context.length > 0) {
    try {
      const data = await cachedGet('/api/v1/nodes/_distinct_fact_names', {
        fact: context
      })
      names = data?.result || []
    } catch (err) {
      console.error(err)
    }
  }
  factSuggestions.value = names.filter((f) => f.toLowerCase().includes(query))
}

const inferKind = (values: any[]): FactKind | null => {
  if (values.length === 0) return null
  if (values.every((v) => typeof v === 'boolean')) return 'bool'
  if (values.every((v) => typeof v === 'number')) {
    return values.every(Number.isInteger) ? 'int' : 'float'
  }
  if (values.every((v) => typeof v === 'string')) return 'str'
  return null
}

const refreshPartValues = async (block: any[], partIndex: number) => {
  const part = block[partIndex]
  const fact = part.fact
  const known =
    availableFacts.value.length === 0 || availableFacts.value.includes(fact)
  if (!fact || !known) {
    part.kind = null
    part.values = []
    return
  }
  const params: Record<string, any> = { fact_id: fact }
  const context = precedingFilters(block, partIndex)
  if (context.length > 0) {
    params.fact = context
  }
  try {
    const data = await cachedGet('/api/v1/nodes/_distinct_fact_values', params)
    if (part.fact !== fact) return
    const result: { value: any; count: number }[] = data?.result || []
    part.kind = inferKind(result.map((r) => r.value))
    part.values = result.map((r) => ({
      label: `${r.value} (${r.count})`,
      value: String(r.value)
    }))
    if (part.kind) {
      part.type = part.kind
      if (!KIND_OPERATORS[part.kind as FactKind].includes(part.operator)) {
        part.operator = 'eq'
      }
    }
  } catch (err) {
    console.error(err)
  }
}

// sequential within a block: a part's type/operator may change on refresh,
// which changes the context of every part after it
const refreshFactValues = () =>
  Promise.all(
    nodeFilterBlocks.value.map(async (block: any[]) => {
      for (let i = 0; i < block.length; i++) {
        await refreshPartValues(block, i)
      }
    })
  )

const operatorsFor = (part: any) =>
  part.kind ? KIND_OPERATORS[part.kind as FactKind] : ALL_OPERATORS

const usesValueChoices = (part: any) =>
  !!part.kind &&
  part.values?.length > 0 &&
  CHOICE_OPERATORS.includes(part.operator)

const valuePlaceholder = (part: any) => {
  if (part.operator === 'regex') return 'Regex'
  if (LIST_OPERATORS.includes(part.operator)) return 'a,b,c'
  if (RANGE_OPERATORS.includes(part.operator) && part.values?.length > 0) {
    const numbers = part.values.map((v: any) => Number(v.value))
    return `${Math.min(...numbers)} … ${Math.max(...numbers)}`
  }
  return 'Value'
}

const getFormattedFilters = () => {
  if (formDataReadOnly.value) {
    return formData.node_filter || []
  }
  const formattedFilter: string[] = []
  nodeFilterBlocks.value.forEach((block: any) => {
    block.forEach((part: any) => {
      const formatted = formatPart(part)
      if (formatted) {
        formattedFilter.push(formatted)
      }
    })
  })
  return formattedFilter
}

const updateMatchingNodes = async () => {
  const filters = getFormattedFilters()
  if (filters.length === 0) {
    currentlyMatchingNodes.value = []
    return
  }

  nodesLoading.value = true
  try {
    // we only render the node id and connection state below, so only ask for those
    const data = await api.get<any>('/api/v1/nodes', {
      fact: filters,
      fields: ['id', 'remote_agent.connected'],
      limit: 1000
    })
    if (data) {
      currentlyMatchingNodes.value = data.result
    }
  } catch (err) {
    console.error(err)
  } finally {
    nodesLoading.value = false
  }
}

const handleFilterUpdate = () => {
  if (formDataReadOnly.value) {
    return
  }
  clearTimeout(filterTimer)
  filterTimer = setTimeout(async () => {
    await refreshFactValues()
    updateMatchingNodes()
  }, 500)
}

const getDefinitions = async () => {
  const isNew = String(route.params.job_id) === '_new'
  const hasGlobalCreate = auth.hasPermission(PERMISSIONS.JOBS.JOB.CREATE)

  if (isNew && !hasGlobalCreate) {
    definitionChoices.value = auth.getPermissionMatches(
      '^JOBS:JOB:(.*):CREATE$'
    )
    return
  }

  try {
    const data = await api.get<any>('/api/v1/jobs/definitions', {
      fields: ['id'],
      limit: 1000
    })
    if (data) {
      definitionChoices.value = data.result.map((d: any) => d.id)
    }
  } catch (err) {
    console.error(err)
  }
}

// Sensible initial value for a freshly selected param: bool -> false,
// numbers -> their lower bound if one is defined (so an int with min=1 starts
// at 1, not an out-of-range 0), everything else -> empty.
const defaultParamValue = (
  def: JobParamDefinition
): string | number | boolean => {
  if (def.type === 'bool') return false
  if (def.type === 'int' || def.type === 'float') {
    return typeof def.min === 'number' ? def.min : 0
  }
  return ''
}

const handleDefinitionChange = async () => {
  const defId = formData.definition_id
  if (!defId) {
    return
  }
  try {
    const data = await api.get<any>(`/api/v1/jobs/definitions/${defId}`, {
      fields: ['params', 'environment_variables']
    })
    if (data) {
      jobParams.value = data.params
      jobEnvVars.value = data.environment_variables

      if (!formDataReadOnly.value) {
        formData.parameters = {}
        Object.entries(data.params).forEach(([k, v]: [string, any]) => {
          formData.parameters[k] = defaultParamValue(v)
        })
        formData.env_vars = {}
        Object.entries(data.environment_variables).forEach(
          ([k, v]: [string, any]) => {
            formData.env_vars[k] = defaultParamValue(v)
          }
        )
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const fetchNodeJobStatuses = async (jobId: string) => {
  if (!jobId) {
    return
  }
  nodeJobStatusesLoading.value = true
  try {
    const data = await api.get<any>('/api/v1/jobs/nodes_jobs', {
      job_id: jobId,
      fields: ['id', 'node_id', 'status'],
      limit: 1000
    })
    if (data && data.result) {
      const statuses: Record<string, any> = {}
      data.result.forEach((nj: any) => {
        statuses[nj.node_id] = {
          id: nj.id,
          status: nj.status
        }
      })
      nodeJobStatuses.value = statuses
    }
  } catch (err) {
    console.error(err)
  } finally {
    nodeJobStatusesLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  await getDefinitions()

  if (String(route.params.job_id) === '_new') {
    formData.id = ''
    formData.definition_id = ''
    formData.parameters = {}
    formData.env_vars = {}
    formData.node_filter = []
    formData.nodes = []
    formData.created_at = ''
    formData.created_by = ''
    formData.status = ''
    jobParams.value = {}
    jobEnvVars.value = {}
    nodeFilterBlocks.value = [
      [
        {
          fact: '',
          operator: 'eq',
          type: 'str',
          value: ''
        }
      ]
    ]
    currentlyMatchingNodes.value = []
    nodeJobStatuses.value = {}
  } else {
    try {
      const data = await api.get<any>(
        `/api/v1/jobs/jobs/${String(route.params.job_id)}`
      )
      if (data) {
        Object.assign(formData, data)
        await handleDefinitionChange()
        await updateMatchingNodes()
        await fetchNodeJobStatuses(data.id)
      }
    } catch (err) {
      console.error(err)
    }
  }
  loading.value = false
}

const initializeFormState = () => {
  formDataReadOnly.value = String(route.params.job_id) !== '_new'
  loadData()
}

const handleSave = async () => {
  if (hasValidationErrors.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the highlighted parameter values.',
      life: 3000
    })
    return
  }

  const formattedFilter = getFormattedFilters()

  const castValues = (
    values: Record<string, any>,
    definitions: Record<string, any>
  ) => {
    const casted: Record<string, any> = {}
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

  const payload = {
    definition_id: formData.definition_id,
    parameters: castValues(formData.parameters, jobParams.value),
    env_vars: castValues(formData.env_vars, jobEnvVars.value),
    node_filter: formattedFilter
  }

  try {
    const res = await api.post<any>('/api/v1/jobs/jobs', payload)
    if (res && res.id) {
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Job created successfully',
        life: 3000
      })
      router.push({
        name: 'JobsCRUD',
        params: {
          job_id: res.id
        }
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create job',
      life: 3000
    })
  }
}

const handleCancelJob = () => {
  confirm.require({
    message: `Are you sure you want to cancel job ${formData.id}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.post<any>(`/api/v1/jobs/jobs/${formData.id}/cancel`)
        toast.add({
          severity: 'success',
          summary: 'Cancelled',
          detail: 'Job cancelled successfully',
          life: 3000
        })
        loadData()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to cancel job',
          life: 3000
        })
      }
    }
  })
}

const handleCancel = () => {
  router.push({
    name: 'JobsSearch'
  })
}

onMounted(() => {
  initializeFormState()
  loadFactNames()
})

watch(
  () => route.params.job_id,
  () => {
    initializeFormState()
  }
)
</script>
