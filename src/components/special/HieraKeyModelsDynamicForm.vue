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
            {{ title }}
          </h1>
        </div>
      </template>
    </ResponsiveToolbar>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Model ID *</label
              >
              <InputText
                id="id"
                v-model="formData.id"
                :disabled="!isNew"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="description"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Description</label
              >
              <InputText
                id="description"
                v-model="formData.description"
                :disabled="!isNew"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1 mt-4">
            <label
              for="model"
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >Model Schema (JSON format) *</label
            >
            <MonacoEditor
              id="model"
              v-model="jsonValueStr"
              :readonly="!isNew"
              class="w-full"
            />
            <span
              v-if="validationError"
              class="text-xs text-rose-500 font-medium mt-1"
            >
              {{ validationError }}
            </span>
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
                v-if="isNew"
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
import { computed } from 'vue'
import { onMounted } from 'vue'
import { reactive } from 'vue'
import { ref } from 'vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import MonacoEditor from '@/components/shared/MonacoEditor.vue'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import type { ResourceDefinition } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const isStatic = computed(
  () => props.resourceDef.name === 'hiera/key_models/static'
)

const isNew = computed(
  () =>
    !isStatic.value &&
    (route.params.key_model_id === '_new' || !route.params.key_model_id)
)

const title = computed(() => {
  if (isStatic.value) {
    return `Static Key Model ${route.params.key_model_id}`
  }
  return isNew.value
    ? 'New Dynamic Key Model'
    : `Dynamic Key Model ${route.params.key_model_id}`
})

const handleBack = () => {
  router.push({
    name: props.resourceDef.routeNames.search
  })
}

const formData = reactive<Record<string, any>>({
  id: '',
  description: '',
  model: null
})

const jsonValueStr = ref('')
const validationError = ref<string | null>(null)

const validateSchema = (
  schema: any,
  path = 'root',
  isRoot = true
): boolean | string => {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return `${path}: Schema must be an object`
  }

  if (isRoot) {
    if (!schema.properties) {
      return `${path}: Root schema must have "properties"`
    }

    const propertyNames = Object.keys(schema.properties)
    if (propertyNames.length !== 1 || propertyNames[0] !== 'data') {
      return `${path}: Root schema must have exactly one property called "data"`
    }

    const dataSchema = schema.properties.data
    if (dataSchema.type === 'array') {
      return `${path}.properties.data: Root "data" field cannot be of type "array"`
    }
  }

  if (schema.properties) {
    if (
      typeof schema.properties !== 'object' ||
      Array.isArray(schema.properties)
    ) {
      return `${path}.properties: Must be an object`
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const fieldPath = `${path}.properties.${fieldName}`
      const fieldError = validateFieldSchema(fieldSchema, fieldPath)
      if (fieldError !== true) {
        return fieldError
      }
    }
  }

  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required)) {
      return `${path}.required: Must be an array`
    }
    if (schema.properties) {
      for (const req of schema.required) {
        if (!(req in schema.properties)) {
          return `${path}.required: Field "${req}" not found in properties`
        }
      }
    }
  }

  return true
}

const validateFieldSchema = (
  fieldSchema: any,
  path: string
): boolean | string => {
  if (
    typeof fieldSchema !== 'object' ||
    fieldSchema === null ||
    Array.isArray(fieldSchema)
  ) {
    return `${path}: Field schema must be an object`
  }

  if (fieldSchema.enum) {
    if (!Array.isArray(fieldSchema.enum)) {
      return `${path}.enum: Must be an array`
    }
    return true
  }

  if (fieldSchema.pattern) {
    if (fieldSchema.type !== 'string') {
      return `${path}: Pattern can only be used with type "string"`
    }
    try {
      new RegExp(fieldSchema.pattern)
    } catch {
      return `${path}.pattern: Invalid regex pattern`
    }
    return true
  }

  const type = fieldSchema.type
  if (!type) {
    return `${path}: Missing "type" field`
  }

  const validTypes = [
    'string',
    'integer',
    'number',
    'boolean',
    'object',
    'array'
  ]
  if (!validTypes.includes(type)) {
    return `${path}.type: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`
  }

  if (type === 'object') {
    return validateSchema(fieldSchema, path, false)
  }

  if (type === 'array') {
    if (fieldSchema.items) {
      const itemError = validateFieldSchema(fieldSchema.items, `${path}.items`)
      if (itemError !== true) {
        return itemError
      }
    }
    if (
      fieldSchema.uniqueItems !== undefined &&
      typeof fieldSchema.uniqueItems !== 'boolean'
    ) {
      return `${path}.uniqueItems: Must be a boolean`
    }
  }

  return true
}

watch(jsonValueStr, (newVal) => {
  if (!newVal) {
    validationError.value = null
    return
  }
  try {
    const parsed = JSON.parse(newVal)
    const err = validateSchema(parsed)
    if (err !== true) {
      validationError.value = String(err)
    } else {
      validationError.value = null
    }
  } catch {
    validationError.value = 'Invalid JSON format'
  }
})

const loadData = async () => {
  if (isNew.value) {
    formData.id = ''
    formData.description = ''
    formData.model = null
    jsonValueStr.value = ''
  } else {
    try {
      const endpoint = `${props.resourceDef.apiBase}/${encodeURIComponent(String(route.params.key_model_id))}`
      const res = await api.get<Record<string, unknown>>(endpoint)
      if (res) {
        Object.assign(formData, res)
        jsonValueStr.value = JSON.stringify(res.model, null, 2)
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load key model data',
        life: 3000
      })
    }
  }
}

const canDelete = computed(() => {
  if (isNew.value) return false
  const deletePerm = props.resourceDef.permissions.delete
  if (!deletePerm) return false
  return deletePerm(auth.hasPermission)
})

const handleSave = async () => {
  if (!formData.id) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Model ID is required',
      life: 3000
    })
    return
  }
  if (validationError.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: validationError.value,
      life: 5000
    })
    return
  }
  let modelData = null
  try {
    if (jsonValueStr.value) {
      modelData = JSON.parse(jsonValueStr.value)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Model schema must be valid JSON',
      life: 3000
    })
    return
  }

  try {
    const endpoint = `${props.resourceDef.apiBase}/${encodeURIComponent(String(formData.id))}`
    await api.post(endpoint, {
      description: formData.description,
      model: modelData
    })
    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: 'Dynamic key model created successfully',
      life: 3000
    })
    router.push({
      name: props.resourceDef.routeNames.search
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save dynamic key model data',
      life: 3000
    })
  }
}

const handleDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this dynamic key model?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const endpoint = `${props.resourceDef.apiBase}/${encodeURIComponent(String(route.params.key_model_id))}`
        await api.delete(endpoint)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Dynamic key model deleted successfully',
          life: 3000
        })
        router.push({
          name: props.resourceDef.routeNames.search
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete dynamic key model',
          life: 3000
        })
      }
    }
  })
}

const handleCancel = () => {
  router.push({
    name: props.resourceDef.routeNames.search
  })
}

onMounted(() => {
  loadData()
})
</script>
