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
            {{ isNew ? 'New Node' : `Node ${formData.id}` }}
          </h1>
        </div>
      </template>
      <template #right>
        <div v-if="!isNew" class="flex gap-2">
          <Button
            label="Reports"
            icon="pi pi-file"
            class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            @click="goToReports"
          />
          <Button
            label="Certs"
            icon="pi pi-shield"
            class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            @click="goToCerts"
          />
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
                for="node-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Node ID *
              </label>
              <div class="flex gap-2">
                <InputText
                  id="node-id"
                  v-model="formData.id"
                  :disabled="!isNew"
                  class="flex-grow bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
                <Button
                  v-if="!isNew"
                  icon="pi pi-shield"
                  class="p-button-secondary p-button-outlined"
                  @click="goToCerts"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1 justify-center">
              <label
                for="disabled-toggle"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Disabled
              </label>
              <div class="py-2">
                <ToggleSwitch
                  id="disabled-toggle"
                  v-model="formData.disabled"
                  :disabled="isFieldDisabled"
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

    <Accordion v-model:value="tableExpPan" multiple class="w-full">
      <AccordionPanel value="facts_inject">
        <AccordionHeader>Facts Inject</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div
              class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div class="flex flex-col md:flex-row gap-2 flex-grow">
                <InputText
                  v-model="tableFactsInjectSearchKey"
                  placeholder="Search keys..."
                  class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
                <InputText
                  v-model="tableFactsInjectSearchValue"
                  placeholder="Search values..."
                  class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <Button
                v-if="!isFieldDisabled"
                label="Add Inject"
                icon="pi pi-plus"
                class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none p-button-sm font-medium"
                @click="openAddFactsInject"
              />
            </div>

            <DataTable
              :value="tableFactsInjectItems"
              paginator
              :rows="5"
              :rows-per-page-options="[5, 10, 25, 50]"
              class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
            >
              <Column field="key" header="Key" sortable />
              <Column field="value" header="Value" sortable />
              <Column v-if="!isFieldDisabled" header="Actions">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                      @click="editFactsInjectItem(slotProps.data)"
                    />
                    <Button
                      icon="pi pi-trash"
                      class="p-button-text p-button-sm text-rose-500"
                      @click="deleteFactsInjectItem(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel v-if="!isNew" value="change">
        <AccordionHeader>Change Information</AccordionHeader>
        <AccordionContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Change Last</span
              >
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700"
              >
                {{ formData.change_last || 'N/A' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Change Catalog</span
              >
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700"
              >
                {{ formData.change_catalog || 'N/A' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Change Facts</span
              >
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700"
              >
                {{ formData.change_facts || 'N/A' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Change Report</span
              >
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700"
              >
                {{ formData.change_report || 'N/A' }}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel v-if="!isNew" value="facts">
        <AccordionHeader>Facts Data</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col md:flex-row gap-2">
              <InputText
                v-model="tableFactsSearchKey"
                placeholder="Search keys..."
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 flex-grow"
              />
              <InputText
                v-model="tableFactsSearchValue"
                placeholder="Search values..."
                class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 flex-grow"
              />
            </div>

            <DataTable
              :value="tableFactsItems"
              paginator
              :rows="10"
              :rows-per-page-options="[5, 10, 25, 50]"
              class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded"
            >
              <Column field="key" header="Key" sortable>
                <template #body="slotProps">
                  <a
                    href="#"
                    @click.prevent="onFactKeyClick(slotProps.data.key)"
                    class="font-mono text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:underline"
                  >
                    {{ slotProps.data.key }}
                  </a>
                </template>
              </Column>
              <Column field="value" header="Value" sortable>
                <template #body="slotProps">
                  <a
                    href="#"
                    @click.prevent="
                      onFactValueClick(slotProps.data.key, slotProps.data.value)
                    "
                    class="text-sm text-zinc-800 dark:text-zinc-200 hover:underline"
                    :title="formatValue(slotProps.data.value)"
                  >
                    {{ formatValue(slotProps.data.value) }}
                  </a>
                </template>
              </Column>
            </DataTable>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel v-if="!isNew" value="remote">
        <AccordionHeader>Remote Information</AccordionHeader>
        <AccordionContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-zinc-500"
                >Connected:</span
              >
              <i
                :class="[
                  'pi text-lg',
                  formData.remote_agent?.connected
                    ? 'pi-check-circle text-emerald-500'
                    : 'pi-times-circle text-rose-500'
                ]"
              />
              <span class="text-sm font-medium">
                {{ formData.remote_agent?.connected ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Via</span>
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700"
              >
                {{ formData.remote_agent?.via || 'N/A' }}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Dialog
      v-model:visible="dialogFactsInject"
      :header="formFactsInjectTitle"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label
            for="inject-key"
            class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
          >
            Key *
          </label>
          <InputText
            id="inject-key"
            v-model="editedFactsInject.key"
            :disabled="editedFactsInjectIndex !== -1"
            class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label
            for="inject-value"
            class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
          >
            Value *
          </label>
          <InputText
            id="inject-value"
            v-model="editedFactsInject.value"
            class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            class="p-button-text p-button-secondary"
            @click="closeFactsInject"
          />
          <Button
            label="Save"
            class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none px-4 py-2 font-medium"
            @click="saveFactsInject"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { watch } from 'vue'
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
import Dialog from 'primevue/dialog'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import { syncExpPanelToUrl } from '@/composables/useUrlStateSync'
import { syncSimpleStringToUrl } from '@/composables/useUrlStateSync'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const nodeId = computed(() => String(route.params.node))
const isNew = computed(() => nodeId.value === '_new')
const isModifyMode = ref(false)

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const formData = reactive<Record<string, any>>({
  id: '',
  disabled: false,
  facts_inject: {},
  facts: [],
  change_catalog: '',
  change_facts: '',
  change_last: '',
  change_report: '',
  report_status_computed: '',
  report: null,
  remote_agent: {
    connected: false,
    via: ''
  }
})

const tableFactsSearchKey = ref(String(route.query.search_key_facts || ''))
const tableFactsSearchValue = ref(String(route.query.search_value_facts || ''))
const tableFactsInjectSearchKey = ref(
  String(route.query.search_key_facts_inject || '')
)
const tableFactsInjectSearchValue = ref(
  String(route.query.search_value_facts_inject || '')
)

const tableExpPan = ref<string[]>(
  route.query.exp_pan_default
    ? String(route.query.exp_pan_default).split(',')
    : []
)
const tableExpPanFactsInject = ref<string[]>(
  route.query.exp_pan_facts_inject
    ? String(route.query.exp_pan_facts_inject).split(',')
    : []
)

const dialogFactsInject = ref(false)
const editedFactsInjectIndex = ref(-1)
const editedFactsInject = reactive({
  key: '',
  value: ''
})

const formFactsInjectTitle = computed(() => {
  return editedFactsInjectIndex.value === -1 ? 'New Inject' : 'Edit Inject'
})

const flattenFacts = (
  facts: any,
  prefix = ''
): Array<{ key: string; value: any }> => {
  const result: Array<{ key: string; value: any }> = []
  if (facts === null || facts === undefined) {
    return result
  }
  if (Array.isArray(facts)) {
    facts.forEach((item, index) => {
      const key = prefix ? `${prefix}.[${index}]` : `[${index}]`
      if (typeof item === 'object' && item !== null) {
        result.push(...flattenFacts(item, key))
      } else {
        result.push({
          key,
          value: item
        })
      }
    })
  } else if (typeof facts === 'object') {
    Object.keys(facts).forEach((key) => {
      const value = facts[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null) {
        result.push(...flattenFacts(value, newKey))
      } else {
        result.push({
          key: newKey,
          value
        })
      }
    })
  } else {
    result.push({
      key: prefix || 'root',
      value: facts
    })
  }
  return result
}

const formatValue = (value: any): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

const filterItemsByKeyValue = (
  items: Array<{ key: string; value: any }>,
  keySearch: string,
  valueSearch: string
) => {
  return items.filter((item) => {
    const keyMatch =
      !keySearch || item.key.toLowerCase().includes(keySearch.toLowerCase())
    const valueStr =
      typeof item.value === 'string' ? item.value : JSON.stringify(item.value)
    const valueMatch =
      !valueSearch || valueStr.toLowerCase().includes(valueSearch.toLowerCase())
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
    tableFactsInjectSearchKey.value,
    tableFactsInjectSearchValue.value
  )
})

const tableFactsItems = computed(() => {
  if (!formData.facts) return []
  return filterItemsByKeyValue(
    formData.facts,
    tableFactsSearchKey.value,
    tableFactsSearchValue.value
  )
})

const formGetNodeData = async () => {
  if (isNew.value) {
    Object.keys(formData).forEach((k) => {
      delete formData[k]
    })
    formData.id = ''
    formData.disabled = false
    formData.facts_inject = {}
    formData.facts = []
    return
  }
  try {
    const data = await api.get<any>(
      `/api/v1/nodes/${encodeURIComponent(nodeId.value)}`
    )
    if (data) {
      formData.id = data.id
      formData.disabled = data.disabled
      formData.change_catalog = data.change_catalog
      formData.change_facts = data.change_facts
      formData.change_last = data.change_last
      formData.change_report = data.change_report
      formData.report_status_computed = data.report_status_computed
      formData.facts = flattenFacts(data.facts)
      formData.facts_inject = data.facts_inject || {}
      formData.report = data.report
      formData.remote_agent = data.remote_agent || {
        connected: false,
        via: ''
      }
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load node data',
      life: 3000
    })
  }
}

const formSubmit = async () => {
  const targetId = isNew.value ? formData.id : nodeId.value
  let url = `/api/v1/nodes/${encodeURIComponent(targetId)}`
  let payload = {
    disabled: formData.disabled,
    facts_inject: formData.facts_inject || {}
  }
  try {
    if (isNew.value) {
      await api.post(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Node created successfully',
        life: 3000
      })
      router.push({ name: 'NodesSearch' })
    } else {
      await api.put(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Node updated successfully',
        life: 3000
      })
      isModifyMode.value = false
      await formGetNodeData()
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save node data',
      life: 3000
    })
  }
}

const formReset = async () => {
  await formGetNodeData()
}

const canDelete = computed(() => {
  if (isNew.value) return false
  return auth.hasPermission(PERMISSIONS.NODES.DELETE)
})

const formDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete node ${nodeId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/v1/nodes/${encodeURIComponent(nodeId.value)}`)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Node deleted successfully',
          life: 3000
        })
        router.push({ name: 'NodesSearch' })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete node',
          life: 3000
        })
      }
    }
  })
}

const updateUrlQuery = () => {
  let query: Record<string, any> = {}
  syncExpPanelToUrl(query, 'default', tableExpPan.value)
  syncExpPanelToUrl(query, 'facts_inject', tableExpPanFactsInject.value)
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
    name: route.name as string,
    params: route.params,
    query: query
  })
}

watch(
  () => [
    tableExpPan.value,
    tableExpPanFactsInject.value,
    tableFactsSearchKey.value,
    tableFactsSearchValue.value,
    tableFactsInjectSearchKey.value,
    tableFactsInjectSearchValue.value
  ],
  () => {
    updateUrlQuery()
  },
  { deep: true }
)

const handleBack = () => {
  router.push({ name: 'NodesSearch' })
}

const goToReports = () => {
  router.push({
    name: 'NodesReportsSearch',
    params: { node: nodeId.value }
  })
}

const goToCerts = () => {
  router.push({
    name: 'CASpacesCertsSearch',
    params: { space_id: 'puppet-ca' },
    query: { cn: nodeId.value }
  })
}

const openAddFactsInject = () => {
  editedFactsInjectIndex.value = -1
  editedFactsInject.key = ''
  editedFactsInject.value = ''
  dialogFactsInject.value = true
}

const editFactsInjectItem = (item: any) => {
  editedFactsInjectIndex.value = tableFactsInjectItems.value.findIndex(
    (i) => i.key === item.key
  )
  Object.assign(editedFactsInject, item)
  dialogFactsInject.value = true
}

const deleteFactsInjectItem = (item: any) => {
  if (!formData.facts_inject) return
  delete formData.facts_inject[item.key]
}

const closeFactsInject = () => {
  dialogFactsInject.value = false
  editedFactsInject.key = ''
  editedFactsInject.value = ''
  editedFactsInjectIndex.value = -1
}

const saveFactsInject = () => {
  if (!editedFactsInject.key || !editedFactsInject.value) return
  if (!formData.facts_inject) {
    formData.facts_inject = {}
  }
  formData.facts_inject[editedFactsInject.key] = editedFactsInject.value
  closeFactsInject()
}

const onFactKeyClick = (key: string) => {
  router.push({
    name: 'NodesDistinctFactValues',
    query: { fact_id: key }
  })
}

const onFactValueClick = (key: string, value: any) => {
  const currentFacts = Array.isArray(route.query.fact)
    ? route.query.fact
    : route.query.fact
      ? [route.query.fact]
      : []
  const newFactParam = `${key}:eq:str:${value}`
  router.push({
    name: 'NodesSearch',
    query: { fact: [newFactParam, ...currentFacts] }
  })
}

onMounted(async () => {
  await formGetNodeData()
})
</script>
