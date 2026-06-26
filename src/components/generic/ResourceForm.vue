<template>
  <div class="flex flex-col gap-6">
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

        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="field in fields"
              :key="field.key"
              :class="[
                'flex flex-col gap-1',
                field.type === 'permission-grid' ? 'col-span-full' : ''
              ]"
            >
              <label
                :for="field.key"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                {{ field.label }}
                <span v-if="field.required" class="text-rose-500">*</span>
              </label>

              <InputText
                v-if="field.type === 'text'"
                :id="field.key"
                v-model="formData[field.key]"
                :disabled="isFieldDisabled(field)"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />

              <Textarea
                v-else-if="field.type === 'textarea'"
                :id="field.key"
                v-model="formData[field.key]"
                :disabled="isFieldDisabled(field)"
                rows="4"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />

              <Password
                v-else-if="field.type === 'password'"
                :id="field.key"
                v-model="formData[field.key]"
                :disabled="isFieldDisabled(field)"
                :feedback="false"
                toggle-mask
                input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />

              <Select
                v-else-if="field.type === 'select'"
                :id="field.key"
                v-model="formData[field.key]"
                :options="field.options"
                option-label="label"
                option-value="value"
                :disabled="isFieldDisabled(field)"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />

              <div v-else-if="field.type === 'switch'" class="py-2">
                <ToggleSwitch
                  :id="field.key"
                  v-model="formData[field.key]"
                  :disabled="isFieldDisabled(field)"
                />
              </div>

              <div
                v-else-if="field.type === 'chip-list'"
                class="flex flex-wrap gap-2 py-2"
              >
                <Chip
                  v-for="item in formData[field.key]"
                  :key="item"
                  :label="item"
                  class="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono"
                />
                <span
                  v-if="
                    !formData[field.key] || formData[field.key].length === 0
                  "
                  class="text-sm text-zinc-400 italic"
                >
                  None
                </span>
              </div>

              <div
                v-else-if="field.type === 'double-password'"
                class="flex flex-col md:flex-row gap-4"
              >
                <div class="flex-1 flex flex-col gap-1">
                  <Password
                    :id="field.key"
                    v-model="formData[field.key]"
                    placeholder="Password"
                    :disabled="isFieldDisabled(field)"
                    :feedback="false"
                    toggle-mask
                    input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                  />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <Password
                    :id="field.key + '_confirm'"
                    v-model="confirmPassword[field.key]"
                    placeholder="Confirm Password"
                    :disabled="isFieldDisabled(field)"
                    :feedback="false"
                    toggle-mask
                    input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              <MultiSelect
                v-else-if="
                  field.type === 'autocomplete' && field.autocomplete?.multiple
                "
                :id="field.key"
                v-model="formData[field.key]"
                :options="suggestions[field.key] || []"
                :disabled="isFieldDisabled(field)"
                :filter="true"
                display="chip"
                class="w-full"
                placeholder="Select options"
              />

              <AutoComplete
                v-else-if="field.type === 'autocomplete'"
                :id="field.key"
                v-model="formData[field.key]"
                :suggestions="suggestions[field.key] || []"
                @complete="searchSuggestions($event, field)"
                :disabled="isFieldDisabled(field)"
                class="w-full"
              />

              <span
                v-else-if="field.type === 'readonly'"
                class="py-2 text-zinc-400 font-mono text-sm"
              >
                {{ formData[field.key] }}
              </span>

              <div
                v-else-if="field.type === 'permission-grid'"
                class="col-span-full mt-2 flex flex-col gap-3"
              >
                <div class="flex gap-2">
                  <InputText
                    v-model="permissionSearchQuery"
                    placeholder="Search permissions..."
                    class="w-full md:w-80 p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                  />
                </div>

                <DataTable
                  :value="filteredPermissions"
                  class="p-datatable-sm border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
                >
                  <Column field="name" header="Permission" sortable>
                    <template #body="slotProps">
                      <span class="font-mono text-xs">{{
                        slotProps.data.name
                      }}</span>
                    </template>
                  </Column>
                  <Column header="Enabled" class="w-24 text-center">
                    <template #body="slotProps">
                      <ToggleSwitch
                        :model-value="
                          formData[field.key].includes(slotProps.data.name)
                        "
                        @update:model-value="
                          (val) =>
                            handleTogglePermission(
                              field.key,
                              slotProps.data.name,
                              val
                            )
                        "
                        :disabled="isFieldDisabled(field)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>

              <InputNumber
                v-else-if="field.type === 'number'"
                :id="field.key"
                v-model="formData[field.key]"
                :disabled="isFieldDisabled(field)"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
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
              @click="handleDelete"
            />
            <div v-else></div>

            <div class="flex gap-3">
              <Button
                label="Cancel"
                class="p-button-text p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2"
                @click="handleCancel"
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

    <Dialog
      v-model:visible="showSecretDialog"
      header="Credential Created"
      :modal="true"
      :closable="false"
      class="w-full max-w-lg"
    >
      <div class="flex flex-col gap-4">
        <div
          class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-sm"
        >
          Please copy the secret now. You will not be able to see it again!
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            Secret-Id
          </label>
          <div class="flex gap-2 items-center">
            <InputText
              :value="createdSecretId"
              readonly
              class="w-full font-mono text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
            />
            <Button
              icon="pi pi-copy"
              class="p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              @click="copyToClipboard(createdSecretId)"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            Secret
          </label>
          <div class="flex gap-2 items-center">
            <InputText
              :value="createdSecret"
              readonly
              class="w-full font-mono text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
            />
            <Button
              icon="pi pi-copy"
              class="p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              @click="copyToClipboard(createdSecret)"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <Button
            label="Close & Continue"
            class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none px-4 py-2 font-medium"
            @click="handleCloseSecretDialog"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onMounted } from 'vue'
import { reactive } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Password from 'primevue/password'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Chip from 'primevue/chip'
import AutoComplete from 'primevue/autocomplete'
import MultiSelect from 'primevue/multiselect'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { apiErrorStore } from '@/stores/apiError'
import { useResourceQuery } from '@/composables/useResourceQuery'
import { useCreateResource } from '@/composables/useResourceMutation'
import { useUpdateResource } from '@/composables/useResourceMutation'
import { useDeleteResource } from '@/composables/useResourceMutation'
import type { ResourceDefinition } from '@/types/resources'
import type { FieldDefinition } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()
const errorStore = apiErrorStore()

const idParam = computed(() =>
  String(route.params[props.resourceDef.routeParam])
)
const isNew = computed(() => idParam.value === '_new')
const isModifyMode = ref(false)

const fields = computed(() => {
  return props.resourceDef.fields.filter((field) => {
    if (field.hidden) {
      return false
    }
    if (isNew.value && field.hiddenOnCreate) {
      return false
    }
    if (!isNew.value && field.hiddenOnEdit) {
      return false
    }
    if (props.resourceDef.name === 'users' && field.key === 'password_change') {
      if (!isModifyMode.value) {
        return false
      }
      if (formData.backend !== 'internal') {
        return false
      }
    }
    return true
  })
})

const formData = reactive<Record<string, any>>({})

const suggestions = reactive<Record<string, string[]>>({})

const permissionSearchQuery = ref('')
const confirmPassword = ref<Record<string, string>>({})
const showSecretDialog = ref(false)
const createdSecret = ref('')
const createdSecretId = ref('')

const copyToClipboard = async (val: string) => {
  try {
    await navigator.clipboard.writeText(val)
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Copied to clipboard',
      life: 2000
    })
  } catch (err) {
    console.error(err)
  }
}

const handleCloseSecretDialog = () => {
  showSecretDialog.value = false
  router.push({
    name: props.resourceDef.routeNames.search
  })
}

const filteredPermissions = computed(() => {
  const allPerms = suggestions['permissions'] || []
  if (!permissionSearchQuery.value) {
    return allPerms.map((p) => ({ name: p }))
  }
  const q = permissionSearchQuery.value.toLowerCase()
  return allPerms
    .filter((p) => p.toLowerCase().includes(q))
    .map((p) => ({ name: p }))
})

const handleTogglePermission = (
  fieldKey: string,
  permissionName: string,
  enabled: boolean
) => {
  const list = [...(formData[fieldKey] || [])]
  if (enabled) {
    if (!list.includes(permissionName)) {
      list.push(permissionName)
    }
  } else {
    const idx = list.indexOf(permissionName)
    if (idx !== -1) {
      list.splice(idx, 1)
    }
  }
  formData[fieldKey] = list
}

const isFieldDisabled = (field: FieldDefinition): boolean => {
  if (isNew.value) {
    return field.readonly === true
  }
  if (!isModifyMode.value) {
    return true
  }
  return field.readonly === true || field.readonlyOnEdit === true
}

const { fetch } = useResourceQuery(props.resourceDef)
const { create } = useCreateResource(props.resourceDef)
const { update } = useUpdateResource(props.resourceDef)
const { remove } = useDeleteResource(props.resourceDef)

const initFormData = () => {
  fields.value.forEach((field) => {
    if (
      field.type === 'chip-list' ||
      field.type === 'permission-grid' ||
      (field.type === 'autocomplete' && field.autocomplete?.multiple)
    ) {
      formData[field.key] = field.defaultValue || []
    } else if (field.type === 'switch') {
      formData[field.key] =
        field.defaultValue !== undefined ? field.defaultValue : false
    } else {
      formData[field.key] =
        field.defaultValue !== undefined ? field.defaultValue : ''
    }
  })
}

const loadMultipleAutocompleteOptions = async () => {
  for (const field of fields.value) {
    if (
      (field.type === 'autocomplete' && field.autocomplete?.multiple) ||
      field.type === 'permission-grid'
    ) {
      if (!field.autocomplete) {
        continue
      }
      try {
        let result: unknown[] = []
        if (typeof field.autocomplete.endpoint === 'function') {
          const val = field.autocomplete.endpoint(formData, '')
          if (val instanceof Promise) {
            result = await val
          } else if (Array.isArray(val)) {
            result = val
          }
        } else {
          const response = await api.get<Record<string, unknown>>(
            field.autocomplete.endpoint,
            {
              limit: 1000
            }
          )
          if (response && response.result) {
            result = response.result as unknown[]
          }
        }
        suggestions[field.key] = result.map((item: unknown) => {
          if (typeof item === 'string') return item
          const key =
            field.autocomplete!.responseField || field.autocomplete!.field
          return (
            (item as Record<string, string>)[key] ||
            (item as Record<string, string>).id ||
            (item as Record<string, string>).name ||
            ''
          )
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
}

const loadData = async () => {
  if (isNew.value || props.resourceDef.writeOnly) {
    initFormData()
    if (props.resourceDef.writeOnly && !isNew.value) {
      formData.id = idParam.value
    }
  } else {
    try {
      const data = await fetch(idParam.value, route)
      if (data) {
        Object.keys(formData).forEach((k) => delete formData[k])
        Object.assign(formData, data)
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load resource data',
        life: 3000
      })
    }
  }
  await loadMultipleAutocompleteOptions()
  fields.value.forEach((field) => {
    if (field.type === 'permission-grid') {
      const currentPermissions: string[] = formData[field.key] || []
      const availablePermissions: string[] = suggestions[field.key] || []
      if (currentPermissions.length > 0 && availablePermissions.length > 0) {
        formData[field.key] = currentPermissions.filter((p) =>
          availablePermissions.includes(p)
        )
      }
    }
  })
}

interface AutocompleteCompleteEvent {
  query: string
}

const searchSuggestions = async (
  event: AutocompleteCompleteEvent,
  field: FieldDefinition
) => {
  if (!field.autocomplete) return
  const query = event.query
  try {
    let result: unknown[] = []
    if (typeof field.autocomplete.endpoint === 'function') {
      const val = field.autocomplete.endpoint(formData, query)
      if (val instanceof Promise) {
        result = await val
      } else if (Array.isArray(val)) {
        result = val
      } else if (typeof val === 'string') {
        const response = await api.get<Record<string, unknown>>(val, {
          [field.autocomplete.field]: query
        })
        if (response && response.result) {
          result = response.result as unknown[]
        }
      }
    } else {
      const response = await api.get<Record<string, unknown>>(
        field.autocomplete.endpoint,
        {
          [field.autocomplete.field]: query
        }
      )
      if (response && response.result) {
        result = response.result as unknown[]
      }
    }
    suggestions[field.key] = result.map((item: unknown) => {
      if (typeof item === 'string') return item
      const key = field.autocomplete!.responseField || field.autocomplete!.field
      return (
        (item as Record<string, string>)[key] ||
        (item as Record<string, string>).id ||
        (item as Record<string, string>).name ||
        ''
      )
    })
  } catch (error) {
    console.error(error)
  }
}

const canDelete = computed(() => {
  if (isNew.value) return false
  const perm = props.resourceDef.permissions.delete
  if (!perm) return false
  return perm(auth.hasPermission, formData)
})

const handleSave = async () => {
  for (const field of fields.value) {
    if (field.required && isFieldDisabled(field) === false) {
      if (!formData[field.key]) {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: `${field.label} is required`,
          life: 3000
        })
        return
      }
    }
  }

  for (const field of fields.value) {
    if (field.type === 'double-password') {
      const val = formData[field.key]
      const confirmVal = confirmPassword.value[field.key]
      if (val || confirmVal) {
        if (val !== confirmVal) {
          toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Passwords do not match',
            life: 3000
          })
          return
        }
      }
    }
  }

  try {
    errorStore.setRedirect({ name: props.resourceDef.routeNames.search })
    const payload = { ...formData }
    props.resourceDef.fields.forEach((field) => {
      if (isNew.value) {
        if (field.hiddenOnCreate) {
          delete payload[field.key]
        }
      } else {
        if (field.hiddenOnEdit) {
          delete payload[field.key]
        }
      }
    })

    if (props.resourceDef.name === 'users') {
      delete payload.permissions
      delete payload.backend
      if (payload.password_change) {
        payload.password = payload.password_change
      }
      delete payload.password_change
      if (!isNew.value && !payload.password) {
        delete payload.password
      }
    }

    if (isNew.value) {
      const result = (await create(payload, route)) as any
      if (result && result.secret) {
        createdSecret.value = result.secret
        createdSecretId.value = result.id || ''
        showSecretDialog.value = true
      } else {
        toast.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Resource created successfully',
          life: 3000
        })
      }
    } else {
      await update(idParam.value, payload, route)
      isModifyMode.value = false
      confirmPassword.value = {}
      if (formData.password) formData.password = ''
      if (formData.password_change) formData.password_change = ''
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Resource updated successfully',
        life: 3000
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save resource data',
      life: 3000
    })
  }
}

const handleDelete = () => {
  errorStore.setRedirect({ name: props.resourceDef.routeNames.search })
  confirm.require({
    message: 'Are you sure you want to delete this resource?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await remove(idParam.value, route)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Resource deleted successfully',
          life: 3000
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete resource',
          life: 3000
        })
      }
    }
  })
}

const handleCancel = () => {
  if (isNew.value) {
    router.push({ name: props.resourceDef.routeNames.search })
  } else {
    isModifyMode.value = false
    confirmPassword.value = {}
    if (formData.password) formData.password = ''
    if (formData.password_change) formData.password_change = ''
    loadData()
  }
}

onMounted(() => {
  initFormData()
  loadData()
})
</script>
