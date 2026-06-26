<template>
  <div class="flex flex-col gap-6 p-4">
    <ResponsiveToolbar>
      <template #left>
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary border border-zinc-700 text-zinc-300"
            @click="handleBack"
          />
          <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {{ isNew ? 'New CA Space' : `CA Space ${formData.id}` }}
          </h1>
        </div>
      </template>
      <template #right>
        <div v-if="!isNew" class="flex gap-2">
          <Button
            label="Certificates"
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
        <div v-if="hasUpdatePermission && !isNew" class="flex justify-end mb-4">
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
                for="space-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Space ID *
              </label>
              <InputText
                id="space-id"
                v-model="formData.id"
                :disabled="!isNew"
                required
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="ca-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Current CA ID *
              </label>
              <Select
                id="ca-id"
                v-model="formData.ca_id"
                :options="caChoices"
                :loading="caChoicesLoading"
                filter
                :disabled="isFieldDisabled"
                required
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1 md:col-span-2">
              <label
                for="description"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Description
              </label>
              <InputText
                id="description"
                v-model="formData.description"
                :disabled="isFieldDisabled"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div class="mt-4">
            <CAValidationConfig
              v-model="formData.validation_config"
              :readonly="isFieldDisabled"
            />
          </div>

          <template
            v-if="
              !isNew &&
              formData.ca_id_history &&
              formData.ca_id_history.length > 0
            "
          >
            <div
              class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4"
            >
              <h3
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2"
              >
                CA History
              </h3>
              <div class="flex flex-col gap-1">
                <div
                  v-for="ca in formData.ca_id_history"
                  :key="ca"
                  class="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700"
                >
                  {{ ca }}
                </div>
              </div>
            </div>
          </template>

          <div
            v-if="isNew || isModifyMode"
            class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <Button
              v-if="canDelete && !isNew"
              type="button"
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
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import CAValidationConfig from '@/components/special/CAValidationConfig.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import type { ResourceDefinition } from '@/types/resources'
import { useCAValidationConfig } from '@/composables/useCAValidationConfig'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()
const { getDefaultValidationConfig, ensureValidationConfig } =
  useCAValidationConfig()

defineProps<{
  resourceDef: ResourceDefinition
}>()

const spaceId = computed(() => String(route.params.space_id))
const isNew = computed(() => spaceId.value === '_new')
const isModifyMode = ref(false)

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const caChoices = ref<string[]>()
const caChoicesLoading = ref(false)

const formData = reactive<Record<string, any>>({
  id: '',
  ca_id: '',
  description: '',
  ca_id_history: [],
  validation_config: getDefaultValidationConfig()
})

const hasUpdatePermission = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.SPACES.UPDATE)
})

const canDelete = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.SPACES.DELETE)
})

const getCAChoices = async () => {
  caChoicesLoading.value = true
  try {
    const data = await api.get<any>('/api/v1/ca/authorities', {
      limit: 1000,
      fields: ['id']
    })
    if (data && data.result) {
      caChoices.value = data.result.map((ca: any) => ca.id)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load CA options',
      life: 3000
    })
  } finally {
    caChoicesLoading.value = false
  }
}

const formGetData = async () => {
  if (isNew.value) {
    formData.id = ''
    formData.ca_id = ''
    formData.description = ''
    formData.ca_id_history = []
    formData.validation_config = getDefaultValidationConfig()
  } else {
    try {
      const data = await api.get<any>(
        `/api/v1/ca/spaces/${encodeURIComponent(spaceId.value)}`
      )
      if (data) {
        Object.assign(formData, data)
        ensureValidationConfig(formData)
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load CA Space data',
        life: 3000
      })
    }
  }
}

const formSubmit = async () => {
  const url = `/api/v1/ca/spaces/${encodeURIComponent(formData.id)}`
  const payload = {
    ca_id: formData.ca_id,
    description: formData.description,
    validation_config: formData.validation_config
  }
  try {
    if (isNew.value) {
      await api.post(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'CA Space created successfully',
        life: 3000
      })
      router.push({
        name: 'CASpacesCRUD',
        params: {
          space_id: formData.id
        }
      })
    } else {
      await api.put(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'CA Space updated successfully',
        life: 3000
      })
      isModifyMode.value = false
      await formGetData()
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save CA Space',
      life: 3000
    })
  }
}

const formReset = async () => {
  isModifyMode.value = false
  await formGetData()
}

const handleBack = () => {
  router.push({ name: 'CASpacesSearch' })
}

const goToCerts = () => {
  router.push({
    name: 'CASpacesCertsSearch',
    params: {
      space_id: spaceId.value
    }
  })
}

const formDelete = () => {
  confirm.require({
    message: `Are you sure you want to DELETE CA Space: ${spaceId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const url = `/api/v1/ca/spaces/${encodeURIComponent(spaceId.value)}`
        await api.delete(url)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'CA Space deleted successfully',
          life: 3000
        })
        router.push({ name: 'CASpacesSearch' })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete CA Space',
          life: 3000
        })
      }
    }
  })
}

const initializeFormState = async () => {
  isModifyMode.value = false
  await formGetData()
  await getCAChoices()
}

onMounted(() => {
  initializeFormState()
})

watch(
  () => route.params.space_id,
  () => {
    initializeFormState()
  }
)
</script>
