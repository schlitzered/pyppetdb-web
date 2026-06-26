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
            {{ isNew ? 'New CA Authority' : `CA Authority ${formData.id}` }}
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
            <div class="flex flex-col gap-1" v-if="isNew">
              <label
                for="creation-mode"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Creation Mode
              </label>
              <Select
                id="creation-mode"
                v-model="caCreationMode"
                :options="caCreationModes"
                option-label="label"
                option-value="value"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="ca-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                CA Authority ID *
              </label>
              <InputText
                id="ca-id"
                v-model="formData.id"
                :disabled="!isNew"
                required
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div
              class="flex flex-col gap-1"
              v-if="isNew && caCreationMode === 'internal_sub'"
            >
              <label
                for="parent-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Parent CA ID *
              </label>
              <Select
                id="parent-id"
                v-model="formData.parent_id"
                :options="caChoices"
                :loading="caChoicesLoading"
                filter
                required
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div
              class="flex flex-col gap-1"
              v-if="caCreationMode !== 'external' || !isNew"
            >
              <label
                for="common-name"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Common Name *
              </label>
              <InputText
                id="common-name"
                v-model="formData.cn"
                :disabled="isFieldDisabled"
                :required="caCreationMode !== 'external'"
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <template v-if="caCreationMode !== 'external' && isNew">
              <div class="flex flex-col gap-1">
                <label
                  for="organization"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Organization
                </label>
                <InputText
                  id="organization"
                  v-model="formData.organization"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="organizational-unit"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Organizational Unit
                </label>
                <InputText
                  id="organizational-unit"
                  v-model="formData.organizational_unit"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="country"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Country
                </label>
                <InputText
                  id="country"
                  v-model="formData.country"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="state"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  State
                </label>
                <InputText
                  id="state"
                  v-model="formData.state"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="locality"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Locality
                </label>
                <InputText
                  id="locality"
                  v-model="formData.locality"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="validity-days"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Validity Days
                </label>
                <InputText
                  id="validity-days"
                  v-model="formData.validity_days"
                  type="number"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </template>

            <template v-if="!isNew">
              <div class="flex flex-col gap-1">
                <label
                  for="issuer"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Issuer
                </label>
                <InputText
                  id="issuer"
                  v-model="formData.issuer"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-xs"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="serial-number"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Serial Number
                </label>
                <InputText
                  id="serial-number"
                  v-model="formData.serial_number"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-xs"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="not-before"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Not Before
                </label>
                <InputText
                  id="not-before"
                  v-model="formattedNotBefore"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="not-after"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Not After
                </label>
                <InputText
                  id="not-after"
                  v-model="formattedNotAfter"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="status"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Status
                </label>
                <div class="flex items-center gap-2">
                  <Tag
                    :value="formData.status"
                    :severity="getStatusSeverity(formData.status)"
                  />
                </div>
              </div>

              <div
                class="flex flex-col gap-1"
                v-if="formData.status === 'revoked'"
              >
                <label
                  for="revocation-date"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Revocation Date
                </label>
                <InputText
                  id="revocation-date"
                  v-model="formData.revocation_date"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </template>
          </div>

          <div
            class="grid grid-cols-1 gap-4 mt-2"
            v-if="isNew && caCreationMode === 'external'"
          >
            <div class="flex flex-col gap-1">
              <label
                for="certificate-new"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Certificate (PEM) *
              </label>
              <Textarea
                id="certificate-new"
                v-model="formData.certificate"
                required
                rows="6"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="private-key"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Private Key (PEM) *
              </label>
              <Textarea
                id="private-key"
                v-model="formData.private_key"
                required
                rows="6"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="external-chain"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                External Chain (PEM)
              </label>
              <Textarea
                id="external-chain"
                v-model="formData.external_chain_raw"
                rows="6"
                placeholder="Paste one or more certificates in PEM format"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>
          </div>

          <div
            class="grid grid-cols-1 gap-4 mt-2"
            v-if="!isNew && formData.certificate"
          >
            <div class="flex flex-col gap-1">
              <label
                for="certificate-view"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Certificate (PEM)
              </label>
              <Textarea
                id="certificate-view"
                v-model="formData.certificate"
                readonly
                rows="8"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <CAValidationConfig
              v-model="formData.validation_config"
              :readonly="isFieldDisabled"
            />
          </div>

          <template v-if="!isNew && formData.crl">
            <div
              class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4"
            >
              <div class="flex flex-col gap-1">
                <label
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                  >CRL Generation</label
                >
                <InputText
                  :value="formData.crl.generation"
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                  >CRL Updated At</label
                >
                <InputText
                  :value="
                    formData.crl.updated_at
                      ? new Date(formData.crl.updated_at).toLocaleString()
                      : ''
                  "
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                  >CRL Next Update</label
                >
                <InputText
                  :value="
                    formData.crl.next_update
                      ? new Date(formData.crl.next_update).toLocaleString()
                      : ''
                  "
                  disabled
                  class="bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>
          </template>

          <div
            v-if="!isNew"
            class="flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4"
          >
            <Button
              v-if="formData.certificate"
              label="Certificate"
              icon="pi pi-download"
              class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              @click="downloadCert"
            />
            <Button
              v-if="formData.crl && formData.crl.crl_pem"
              label="CRL"
              icon="pi pi-download"
              class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              @click="downloadCRL"
            />
            <Button
              v-if="formData.chain && formData.chain.length > 0"
              label="Chain"
              icon="pi pi-download"
              class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              @click="downloadChain"
            />
          </div>

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
                v-if="canRevoke && !isNew && formData.status !== 'revoked'"
                type="button"
                label="Revoke"
                icon="pi pi-ban"
                class="bg-amber-600 hover:bg-amber-700 text-white border-none px-4 py-2 font-medium"
                @click="formRevoke"
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
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
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

const caId = computed(() => String(route.params.ca_id))
const isNew = computed(() => caId.value === '_new')
const isModifyMode = ref(false)

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const caCreationMode = ref<'internal_root' | 'internal_sub' | 'external'>(
  'internal_root'
)
const caCreationModes = [
  { label: 'Internal Root CA', value: 'internal_root' as const },
  { label: 'Internal Subordinate CA', value: 'internal_sub' as const },
  { label: 'External CA', value: 'external' as const }
]

const caChoices = ref<string[]>()
const caChoicesLoading = ref(false)

const formData = reactive<Record<string, any>>({
  id: '',
  parent_id: '',
  cn: '',
  organization: 'PyppetDB',
  organizational_unit: 'CA',
  country: 'DE',
  state: 'Hessen',
  locality: '',
  validity_days: 3650,
  certificate: '',
  private_key: '',
  external_chain_raw: '',
  status: 'active',
  crl: null,
  chain: [],
  validation_config: getDefaultValidationConfig()
})

const hasUpdatePermission = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.AUTHORITIES.UPDATE)
})

const canDelete = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.AUTHORITIES.DELETE)
})

const canRevoke = computed(() => {
  return auth.hasPermission(PERMISSIONS.CA.AUTHORITIES.UPDATE)
})

const formattedNotBefore = computed(() => {
  return formData.not_before
    ? new Date(formData.not_before).toLocaleString()
    : ''
})

const formattedNotAfter = computed(() => {
  return formData.not_after ? new Date(formData.not_after).toLocaleString() : ''
})

const getStatusSeverity = (status: string) => {
  if (status === 'active') {
    return 'success'
  }
  if (status === 'revoked') {
    return 'danger'
  }
  return 'secondary'
}

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
      detail: 'Failed to load parent CA choices',
      life: 3000
    })
  } finally {
    caChoicesLoading.value = false
  }
}

const formGetData = async () => {
  if (isNew.value) {
    formData.id = ''
    formData.parent_id = ''
    formData.cn = ''
    formData.organization = 'PyppetDB'
    formData.organizational_unit = 'CA'
    formData.country = 'DE'
    formData.state = 'Hessen'
    formData.locality = ''
    formData.validity_days = 3650
    formData.certificate = ''
    formData.private_key = ''
    formData.external_chain_raw = ''
    formData.status = 'active'
    formData.crl = null
    formData.chain = []
    formData.validation_config = getDefaultValidationConfig()
    await getCAChoices()
  } else {
    try {
      const data = await api.get<any>(
        `/api/v1/ca/authorities/${encodeURIComponent(caId.value)}`
      )
      if (data) {
        Object.assign(formData, data)
        ensureValidationConfig(formData)
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load CA Authority data',
        life: 3000
      })
    }
  }
}

const formSubmit = async () => {
  const url = `/api/v1/ca/authorities/${encodeURIComponent(formData.id)}`
  try {
    if (isNew.value) {
      const payload: Record<string, any> = {
        parent_id:
          caCreationMode.value === 'internal_sub' ? formData.parent_id : null,
        cn: caCreationMode.value === 'external' ? null : formData.cn,
        organization:
          caCreationMode.value === 'external' ? null : formData.organization,
        organizational_unit:
          caCreationMode.value === 'external'
            ? null
            : formData.organizational_unit,
        country: caCreationMode.value === 'external' ? null : formData.country,
        state: caCreationMode.value === 'external' ? null : formData.state,
        locality:
          caCreationMode.value === 'external' ? null : formData.locality,
        validity_days:
          caCreationMode.value === 'external'
            ? null
            : Number(formData.validity_days),
        certificate:
          caCreationMode.value === 'external' ? formData.certificate : null,
        private_key:
          caCreationMode.value === 'external' ? formData.private_key : null,
        external_chain:
          caCreationMode.value === 'external' && formData.external_chain_raw
            ? formData.external_chain_raw
                .split('-----END CERTIFICATE-----')
                .filter((c: string) => c.trim())
                .map((c: string) => c + '-----END CERTIFICATE-----')
            : null,
        validation_config: formData.validation_config
      }

      await api.post(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'CA Authority created successfully',
        life: 3000
      })
      router.push({
        name: 'CAAuthoritiesCRUD',
        params: {
          ca_id: formData.id
        }
      })
    } else {
      const payload = {
        validation_config: formData.validation_config
      }
      await api.put(url, payload)
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'CA Authority updated successfully',
        life: 3000
      })
      isModifyMode.value = false
      await formGetData()
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save CA Authority',
      life: 3000
    })
  }
}

const formReset = async () => {
  isModifyMode.value = false
  await formGetData()
}

const handleBack = () => {
  router.push({ name: 'CAAuthoritiesSearch' })
}

const goToCerts = () => {
  router.push({
    name: 'CAAuthoritiesCertsSearch',
    params: {
      ca_id: caId.value
    }
  })
}

const formRevoke = () => {
  confirm.require({
    message: `Are you sure you want to revoke CA Authority: ${caId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const url = `/api/v1/ca/authorities/${encodeURIComponent(caId.value)}`
        await api.put(url, { status: 'revoked' })
        toast.add({
          severity: 'success',
          summary: 'Revoked',
          detail: 'CA Authority revoked successfully',
          life: 3000
        })
        isModifyMode.value = false
        await formGetData()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to revoke CA Authority',
          life: 3000
        })
      }
    }
  })
}

const formDelete = () => {
  confirm.require({
    message: `Are you sure you want to DELETE CA Authority: ${caId.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const url = `/api/v1/ca/authorities/${encodeURIComponent(caId.value)}`
        await api.delete(url)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'CA Authority deleted successfully',
          life: 3000
        })
        router.push({ name: 'CAAuthoritiesSearch' })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete CA Authority',
          life: 3000
        })
      }
    }
  })
}

const downloadFile = (
  content: string,
  fileName: string,
  contentType: string
) => {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

const downloadCert = () => {
  downloadFile(
    formData.certificate,
    `${formData.id}_cert.pem`,
    'application/x-pem-file'
  )
}

const downloadCRL = () => {
  if (formData.crl && formData.crl.crl_pem) {
    downloadFile(
      formData.crl.crl_pem,
      `${formData.id}_crl.pem`,
      'application/x-pem-file'
    )
  }
}

const downloadChain = () => {
  if (formData.chain && formData.chain.length > 0) {
    downloadFile(
      formData.chain.join('\n'),
      `${formData.id}_chain.pem`,
      'application/x-pem-file'
    )
  }
}

const initializeFormState = async () => {
  isModifyMode.value = false
  await formGetData()
}

onMounted(() => {
  initializeFormState()
})

watch(
  () => route.params.ca_id,
  () => {
    initializeFormState()
  }
)
</script>
