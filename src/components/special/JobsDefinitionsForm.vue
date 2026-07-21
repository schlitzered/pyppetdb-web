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
            {{
              isNew ? 'New Job Definition' : `Job Definition ${definitionId}`
            }}
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

        <form @submit.prevent="formSubmit" class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="definition-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Definition ID *
              </label>
              <InputText
                id="definition-id"
                v-model="formData.id"
                :disabled="!isNew"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="executable"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Executable *
              </label>
              <InputText
                id="executable"
                v-model="formData.executable"
                :disabled="isFieldDisabled"
                placeholder="/usr/bin/example"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="user"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                User *
              </label>
              <InputText
                id="user"
                v-model="formData.user"
                :disabled="isFieldDisabled"
                placeholder="root"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="group"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Group *
              </label>
              <InputText
                id="group"
                v-model="formData.group"
                :disabled="isFieldDisabled"
                placeholder="root"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Params Template
            </label>
            <span class="text-xs text-zinc-400">
              Ordered list of argument placeholders passed to the executable.
            </span>
            <div class="flex flex-col gap-2 mt-1">
              <div
                v-for="(row, idx) in paramsTemplate"
                :key="idx"
                class="flex items-center gap-2"
              >
                <span class="text-xs font-mono text-zinc-400 w-6 text-right">{{
                  idx
                }}</span>
                <InputText
                  v-model="row.value"
                  :disabled="isFieldDisabled"
                  placeholder="e.g. --flag or {{ '{{' }}value{{ '}}' }}"
                  class="flex-1 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
                />
                <Button
                  type="button"
                  icon="pi pi-times"
                  class="p-button-text p-button-danger p-button-sm"
                  :disabled="isFieldDisabled"
                  @click="removeTemplateRow(idx)"
                />
              </div>
              <span
                v-if="paramsTemplate.length === 0"
                class="text-sm text-zinc-400 italic"
              >
                No template arguments
              </span>
              <div class="flex justify-start">
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="Add Argument"
                  class="p-button-text p-button-sm"
                  :disabled="isFieldDisabled"
                  @click="addTemplateRow"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Params
            </label>
            <span class="text-xs text-zinc-400">
              Default key/value parameters for this definition.
            </span>
            <KeyValueEditor
              :rows="paramsRows"
              :disabled="isFieldDisabled"
              @add="addParamRow"
              @remove="removeParamRow"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Environment Variables
            </label>
            <span class="text-xs text-zinc-400">
              Environment variables exported when the executable runs.
            </span>
            <KeyValueEditor
              :rows="envRows"
              :disabled="isFieldDisabled"
              @add="addEnvRow"
              @remove="removeEnvRow"
            />
          </div>

          <div
            class="flex justify-between items-center mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-800"
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
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import KeyValueEditor from '@/components/special/KeyValueEditor.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'

interface KeyValueRow {
  key: string
  value: string
}

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const definitionId = computed(() => String(route.params.definition_id))
const isNew = computed(() => definitionId.value === '_new')
const isModifyMode = ref(false)

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const formData = reactive({
  id: '',
  executable: '',
  user: '',
  group: ''
})

const paramsTemplate = ref<{ value: string }[]>([])
const paramsRows = ref<KeyValueRow[]>([])
const envRows = ref<KeyValueRow[]>([])

const canDelete = computed(() => {
  if (isNew.value) return false
  return auth.hasPermission(PERMISSIONS.JOBS.DEFINITION.DELETE)
})

const objectToRows = (obj: unknown): KeyValueRow[] => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.entries(obj as Record<string, unknown>).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? '' : String(value)
  }))
}

const rowsToObject = (rows: KeyValueRow[]): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const row of rows) {
    const key = row.key.trim()
    if (key) {
      out[key] = row.value
    }
  }
  return out
}

const addTemplateRow = () => paramsTemplate.value.push({ value: '' })
const removeTemplateRow = (idx: number) => paramsTemplate.value.splice(idx, 1)
const addParamRow = () => paramsRows.value.push({ key: '', value: '' })
const removeParamRow = (idx: number) => paramsRows.value.splice(idx, 1)
const addEnvRow = () => envRows.value.push({ key: '', value: '' })
const removeEnvRow = (idx: number) => envRows.value.splice(idx, 1)

const formGetDefinitionData = async () => {
  if (isNew.value) {
    formData.id = ''
    formData.executable = ''
    formData.user = ''
    formData.group = ''
    paramsTemplate.value = []
    paramsRows.value = []
    envRows.value = []
    return
  }
  try {
    const data = await api.get<Record<string, unknown>>(
      `/api/v1/jobs/definitions/${encodeURIComponent(definitionId.value)}`
    )
    if (data) {
      formData.id = String(data.id ?? '')
      formData.executable = String(data.executable ?? '')
      formData.user = String(data.user ?? '')
      formData.group = String(data.group ?? '')
      paramsTemplate.value = ((data.params_template as unknown[]) || []).map(
        (value) => ({ value: String(value) })
      )
      paramsRows.value = objectToRows(data.params)
      envRows.value = objectToRows(data.environment_variables)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load job definition data',
      life: 3000
    })
  }
}

const buildPayload = (includeId: boolean): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    executable: formData.executable.trim(),
    user: formData.user.trim(),
    group: formData.group.trim(),
    params_template: paramsTemplate.value
      .map((row) => row.value)
      .filter((value) => value.trim() !== ''),
    params: rowsToObject(paramsRows.value),
    environment_variables: rowsToObject(envRows.value)
  }
  if (includeId) {
    payload.id = formData.id.trim()
  }
  return payload
}

const validate = (): boolean => {
  const missing: string[] = []
  if (isNew.value && !formData.id.trim()) missing.push('Definition ID')
  if (!formData.executable.trim()) missing.push('Executable')
  if (!formData.user.trim()) missing.push('User')
  if (!formData.group.trim()) missing.push('Group')
  if (missing.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: `Required: ${missing.join(', ')}`,
      life: 3000
    })
    return false
  }
  return true
}

const formSubmit = async () => {
  if (!validate()) return
  try {
    if (isNew.value) {
      await api.post('/api/v1/jobs/definitions', buildPayload(true))
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Job definition created successfully',
        life: 3000
      })
      router.push({ name: 'JobsDefinitionsSearch' })
    } else {
      await api.put(
        `/api/v1/jobs/definitions/${encodeURIComponent(definitionId.value)}`,
        buildPayload(false)
      )
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Job definition updated successfully',
        life: 3000
      })
      isModifyMode.value = false
      await formGetDefinitionData()
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save job definition',
      life: 3000
    })
  }
}

const formReset = async () => {
  await formGetDefinitionData()
}

const formDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete job definition ${definitionId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(
          `/api/v1/jobs/definitions/${encodeURIComponent(definitionId.value)}`
        )
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Job definition deleted successfully',
          life: 3000
        })
        router.push({ name: 'JobsDefinitionsSearch' })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete job definition',
          life: 3000
        })
      }
    }
  })
}

const handleBack = () => {
  router.push({ name: 'JobsDefinitionsSearch' })
}

onMounted(async () => {
  await formGetDefinitionData()
})
</script>
