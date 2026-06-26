<template>
  <div class="flex flex-col gap-6">
    <ResponsiveToolbar>
      <template #left>
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary border border-zinc-700 text-zinc-300"
            @click="handleBack"
          />
          <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {{ isNew ? 'New Node Group' : `Node Group ${nodeGroupId}` }}
          </h1>
        </div>
      </template>
    </ResponsiveToolbar>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <div v-if="!isNew" class="flex justify-end mb-4">
          <div class="flex items-center gap-2">
            <label
              for="modify-toggle"
              class="text-sm font-semibold text-zinc-500 dark:text-zinc-400"
            >
              Modify
            </label>
            <ToggleSwitch id="modify-toggle" v-model="isModifyMode" />
          </div>
        </div>

        <form @submit.prevent="formSubmit" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="group-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Group ID *
              </label>
              <InputText
                id="group-id"
                v-model="formData.id"
                :disabled="!isNew"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="teams"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Associated Teams
              </label>
              <AutoComplete
                id="teams"
                v-model="formData.teams"
                :suggestions="teamsChoices"
                @complete="searchTeams"
                :disabled="isFieldDisabled"
                :dropdown="true"
                :complete-on-focus="true"
                multiple
                class="w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1 mt-4">
            <label
              for="filters"
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Filters *
            </label>

            <div class="flex flex-col gap-6 mt-2">
              <div
                v-for="(rule, ruleIdx) in formData.filters"
                :key="ruleIdx"
                class="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 flex flex-col gap-4"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-sm font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    Rule Group #{{ ruleIdx + 1 }}
                  </span>
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    label="Remove Group"
                    class="p-button-text p-button-danger p-button-sm"
                    :disabled="isFieldDisabled"
                    @click="removeRuleGroup(ruleIdx)"
                  />
                </div>

                <div class="flex flex-col gap-3">
                  <div
                    v-for="(part, partIdx) in rule.part"
                    :key="partIdx"
                    class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-b border-zinc-100 dark:border-zinc-900 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div class="md:col-span-4 flex flex-col gap-1">
                      <label class="text-xs font-semibold text-zinc-500"
                        >Fact</label
                      >
                      <AutoComplete
                        v-model="part.fact"
                        :suggestions="
                          filteredFactSuggestions[ruleIdx + '-' + partIdx] || []
                        "
                        @complete="searchFacts($event, ruleIdx, partIdx)"
                        @change="onFactChange(ruleIdx, partIdx)"
                        :disabled="isFieldDisabled"
                        :dropdown="true"
                        class="w-full"
                        placeholder="Select or type a fact"
                      />
                      <span
                        v-if="factErrors[part.fact]"
                        class="text-xs text-rose-500 font-medium"
                      >
                        {{ factErrors[part.fact] }}
                      </span>
                    </div>

                    <div class="md:col-span-7 flex flex-col gap-1">
                      <label class="text-xs font-semibold text-zinc-500"
                        >Values</label
                      >
                      <MultiSelect
                        v-model="part.values"
                        :options="factTypesCache[part.fact]?.values || []"
                        :disabled="
                          isFieldDisabled ||
                          !part.fact ||
                          !!factErrors[part.fact]
                        "
                        :filter="true"
                        display="chip"
                        class="w-full"
                        placeholder="Select values"
                      />
                    </div>

                    <div class="md:col-span-1 pt-6 flex justify-end">
                      <Button
                        type="button"
                        icon="pi pi-times"
                        class="p-button-text p-button-danger p-button-sm"
                        :disabled="isFieldDisabled"
                        @click="removePart(ruleIdx, partIdx)"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex justify-start">
                  <Button
                    type="button"
                    icon="pi pi-plus"
                    label="Add Fact Condition"
                    class="p-button-text p-button-sm"
                    :disabled="isFieldDisabled"
                    @click="addPart(ruleIdx)"
                  />
                </div>
              </div>

              <div class="flex justify-start">
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="Add Rule Group"
                  class="p-button-outlined p-button-secondary p-button-sm"
                  :disabled="isFieldDisabled"
                  @click="addRuleGroup"
                />
              </div>
            </div>
          </div>

          <div
            class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <Button
              v-if="canDelete"
              label="Delete"
              icon="pi pi-trash"
              class="bg-rose-600 hover:bg-rose-700 text-white border-none px-4 py-2"
              @click="formDelete"
            />
            <div v-else></div>

            <div class="flex gap-3">
              <Button
                type="button"
                label="Reset"
                class="p-button-text p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2"
                @click="formReset"
              />
              <Button
                v-if="isNew || isModifyMode"
                type="submit"
                label="Save"
                icon="pi pi-check"
                class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none px-4 py-2 font-medium"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>

    <Accordion
      v-model:value="tableExpPan"
      v-if="!isNew"
      multiple
      class="w-full"
    >
      <AccordionPanel value="nodes">
        <AccordionHeader>Nodes</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center gap-4">
              <InputText
                v-model="nodesSearch"
                placeholder="Search nodes..."
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 w-full max-w-sm"
              />
            </div>

            <DataTable
              :value="filteredNodes"
              paginator
              paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              current-page-report-template="Showing {first} to {last} of {totalRecords} results"
              :rows="10"
              :rows-per-page-options="[10, 25, 50, 100]"
              class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
            >
              <Column field="name" header="Node Name" sortable>
                <template #body="slotProps">
                  <router-link
                    :to="{
                      name: 'NodesCRUD',
                      params: { node: slotProps.data.name }
                    }"
                    class="text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {{ slotProps.data.name }}
                  </router-link>
                </template>
              </Column>
            </DataTable>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import AutoComplete from 'primevue/autocomplete'
import MultiSelect from 'primevue/multiselect'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const nodeGroupId = computed(() => String(route.params.node_group))
const isNew = computed(() => nodeGroupId.value === '_new')
const isModifyMode = ref(false)
const tableExpPan = ref(['nodes'])

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const formData = reactive({
  id: '',
  teams: [] as string[],
  filters: [] as any[]
})

const teamsChoices = ref<string[]>([])
const nodesSearch = ref('')
const nodesTableData = ref<{ name: string }[]>([])
const availableFacts = ref<string[]>([])
const filteredFactSuggestions = reactive<Record<string, string[]>>({})
const factErrors = reactive<Record<string, string>>({})
const factTypesCache = reactive<
  Record<string, { hasNonString: boolean; values: any[] }>
>({})

const filteredNodes = computed(() => {
  if (!nodesSearch.value) return nodesTableData.value
  const query = nodesSearch.value.toLowerCase()
  return nodesTableData.value.filter((n) =>
    n.name.toLowerCase().includes(query)
  )
})

const canDelete = computed(() => {
  if (isNew.value) return false
  return auth.hasPermission(PERMISSIONS.NODES.GROUPS.DELETE)
})

const flattenObjectKeys = (obj: any, prefix = ''): string[] => {
  if (!obj || typeof obj !== 'object') return []
  let keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(fullKey)
      keys = keys.concat(flattenObjectKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const fetchFactValuesIfNeeded = async (factName: string) => {
  if (!factName) {
    return
  }
  if (!factTypesCache[factName]) {
    try {
      const data = await api.get<any>('/api/v1/nodes/_distinct_fact_values', {
        fact_id: factName,
        limit: 100,
        sort_by: 'value',
        sort_order: 'ascending'
      })
      if (data && data.result) {
        const hasNonString = data.result.some(
          (item: any) => item.value !== null && typeof item.value !== 'string'
        )
        factTypesCache[factName] = {
          hasNonString,
          values: data.result.map((item: any) => String(item.value))
        }
      } else {
        factTypesCache[factName] = {
          hasNonString: false,
          values: []
        }
      }
    } catch {
      factTypesCache[factName] = {
        hasNonString: false,
        values: []
      }
    }
  }

  const cache = factTypesCache[factName]
  if (cache && cache.hasNonString) {
    factErrors[factName] =
      `Fact "${factName}" cannot be used, since it contains non-string values.`
  } else {
    delete factErrors[factName]
  }
}

const loadExampleFacts = async () => {
  try {
    const data = await api.get<any>('/api/v1/nodes', {
      limit: 10,
      fields: ['id']
    })
    if (data && data.result && data.result.length > 0) {
      const firstNode = data.result[0]
      const nodeDetails = await api.get<any>(
        `/api/v1/nodes/${encodeURIComponent(firstNode.id)}`,
        {
          fields: ['facts', 'facts_inject']
        }
      )
      let keys: string[] = []
      if (nodeDetails) {
        if (nodeDetails.facts) {
          keys = keys.concat(flattenObjectKeys(nodeDetails.facts))
        }
        if (nodeDetails.facts_inject) {
          keys = keys.concat(flattenObjectKeys(nodeDetails.facts_inject))
        }
      }
      availableFacts.value = Array.from(new Set(keys))
    }
  } catch (error) {
    console.error(error)
  }
}

const searchFacts = (event: any, ruleIdx: number, partIdx: number) => {
  const query = (event.query || '').toLowerCase()
  const key = `${ruleIdx}-${partIdx}`
  filteredFactSuggestions[key] = availableFacts.value.filter((f) =>
    f.toLowerCase().includes(query)
  )
}

const onFactChange = async (ruleIdx: number, partIdx: number) => {
  const part = formData.filters[ruleIdx]?.part?.[partIdx]
  if (part) {
    part.values = []
  }
  const factName = part?.fact
  if (factName) {
    await fetchFactValuesIfNeeded(factName)
  }
}

const addRuleGroup = () => {
  formData.filters.push({
    part: []
  })
}

const removeRuleGroup = (ruleIdx: number) => {
  formData.filters.splice(ruleIdx, 1)
}

const addPart = (ruleIdx: number) => {
  if (!formData.filters[ruleIdx].part) {
    formData.filters[ruleIdx].part = []
  }
  formData.filters[ruleIdx].part.push({
    fact: '',
    values: []
  })
}

const removePart = (ruleIdx: number, partIdx: number) => {
  formData.filters[ruleIdx].part.splice(partIdx, 1)
}

const searchTeams = async (event: any) => {
  try {
    const params: Record<string, any> = {}
    if (event.query) {
      params.team_id = event.query
    }
    const data = await api.get<any>('/api/v1/teams', params)
    if (data && data.result) {
      teamsChoices.value = data.result.map((team: any) => team.id)
    }
  } catch (error) {
    console.error(error)
  }
}

const getTeams = async () => {
  try {
    const data = await api.get<any>('/api/v1/teams')
    if (data && data.result) {
      teamsChoices.value = data.result.map((team: any) => team.id)
    }
  } catch (error) {
    console.error(error)
  }
}

const formGetNodeGroupData = async () => {
  if (isNew.value) {
    formData.id = ''
    formData.teams = []
    formData.filters = []
    nodesTableData.value = []
    return
  }
  try {
    const data = await api.get<any>(
      `/api/v1/nodes_groups/${encodeURIComponent(nodeGroupId.value)}`
    )
    if (data) {
      formData.id = data.id
      formData.teams = data.teams || []
      formData.filters = data.filters || []
      nodesTableData.value = (data.nodes || []).map((nodeName: string) => ({
        name: nodeName
      }))
      for (const rule of formData.filters) {
        if (rule && Array.isArray(rule.part)) {
          for (const part of rule.part) {
            if (part && part.fact) {
              await fetchFactValuesIfNeeded(part.fact)
            }
          }
        }
      }
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load node group data',
      life: 3000
    })
  }
}

const formSubmit = async () => {
  let hasErrors = false
  for (const rule of formData.filters) {
    if (!rule.part || rule.part.length === 0) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Each rule group must contain at least one condition.',
        life: 3000
      })
      return
    }
    for (const part of rule.part) {
      if (!part.fact) {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Fact name cannot be empty.',
          life: 3000
        })
        return
      }
      if (!part.values || part.values.length === 0) {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: `Fact "${part.fact}" must have at least one value specified.`,
          life: 3000
        })
        return
      }
      const factName = part.fact
      await fetchFactValuesIfNeeded(factName)
      if (factTypesCache[factName]?.hasNonString) {
        factErrors[factName] =
          `Fact "${factName}" cannot be used, since it contains non-string values.`
        hasErrors = true
      }
    }
  }

  if (hasErrors || Object.keys(factErrors).length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the errors in the filters before saving.',
      life: 3000
    })
    return
  }

  const payload = {
    filters: formData.filters,
    teams: formData.teams || []
  }

  try {
    if (isNew.value) {
      await api.post(
        `/api/v1/nodes_groups/${encodeURIComponent(formData.id)}`,
        payload
      )
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Node group created successfully',
        life: 3000
      })
      router.push({ name: 'NodesGroupsSearch' })
    } else {
      await api.put(
        `/api/v1/nodes_groups/${encodeURIComponent(nodeGroupId.value)}`,
        payload
      )
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Node group updated successfully',
        life: 3000
      })
      isModifyMode.value = false
      await formGetNodeGroupData()
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save node group',
      life: 3000
    })
  }
}

const formReset = async () => {
  await formGetNodeGroupData()
}

const formDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete node group ${nodeGroupId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(
          `/api/v1/nodes_groups/${encodeURIComponent(nodeGroupId.value)}`
        )
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Node group deleted successfully',
          life: 3000
        })
        router.push({ name: 'NodesGroupsSearch' })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete node group',
          life: 3000
        })
      }
    }
  })
}

const handleBack = () => {
  router.push({ name: 'NodesGroupsSearch' })
}

onMounted(async () => {
  await getTeams()
  await formGetNodeGroupData()
  await loadExampleFacts()
})
</script>
