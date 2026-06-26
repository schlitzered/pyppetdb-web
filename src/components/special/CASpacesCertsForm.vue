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
            Certificate Details
          </h1>
        </div>
      </template>
    </ResponsiveToolbar>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <div v-if="hasUpdatePermission" class="flex justify-end mb-4">
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

        <form @submit.prevent class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="cert-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Cert ID
              </label>
              <InputText
                id="cert-id"
                v-model="formData.id"
                disabled
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="space-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Space ID
              </label>
              <InputText
                id="space-id"
                v-model="formData.space_id"
                disabled
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="ca-id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                CA ID
              </label>
              <InputText
                id="ca-id"
                v-model="formData.ca_id"
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

            <div class="flex flex-col gap-1">
              <label
                for="common-name"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Common Name
              </label>
              <div class="flex items-center gap-2">
                <InputText
                  id="common-name"
                  v-model="formData.cn"
                  disabled
                  class="flex-grow bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
                <template v-if="checkingNode">
                  <span class="text-xs text-zinc-500">Checking...</span>
                </template>
                <template v-else-if="nodeExists">
                  <router-link
                    :to="{
                      name: 'NodesCRUD',
                      params: {
                        node: formData.cn
                      }
                    }"
                    class="p-button p-button-sm p-button-outlined text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center justify-center p-2 rounded"
                    title="View Node"
                  >
                    <i class="pi pi-server mr-1"></i>
                    Node exists (View)
                  </router-link>
                </template>
                <template v-else-if="formData.cn">
                  <span
                    class="text-xs text-rose-500 font-semibold flex items-center gap-1"
                  >
                    <i class="pi pi-times-circle"></i>
                    Node not found
                  </span>
                </template>
              </div>
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
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
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
          </div>

          <div class="grid grid-cols-1 gap-4 mt-2">
            <div class="flex flex-col gap-1">
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Fingerprints</span
              >
              <div
                class="grid grid-cols-1 md:grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-zinc-500 font-mono">MD5</span>
                  <span
                    class="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all"
                    >{{ formData.fingerprint?.md5 || 'N/A' }}</span
                  >
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-zinc-500 font-mono">SHA1</span>
                  <span
                    class="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all"
                    >{{ formData.fingerprint?.sha1 || 'N/A' }}</span
                  >
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-zinc-500 font-mono">SHA256</span>
                  <span
                    class="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all"
                    >{{ formData.fingerprint?.sha256 || 'N/A' }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
            v-if="formData.certificate || formData.csr"
          >
            <div class="flex flex-col gap-1" v-if="formData.certificate">
              <label
                for="certificate"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Certificate (PEM)
              </label>
              <Textarea
                id="certificate"
                v-model="formData.certificate"
                readonly
                rows="8"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>

            <div class="flex flex-col gap-1" v-if="formData.csr">
              <label
                for="csr"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                CSR (PEM)
              </label>
              <Textarea
                id="csr"
                v-model="formData.csr"
                readonly
                rows="8"
                class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 w-full"
              />
            </div>
          </div>

          <div
            class="grid grid-cols-1 gap-4 mt-2"
            v-if="formData.sans && formData.sans.length > 0"
          >
            <div class="flex flex-col gap-1">
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Subject Alternative Names (SANs)</span
              >
              <div class="flex flex-wrap gap-2">
                <Tag
                  v-for="san in formData.sans"
                  :key="san"
                  :value="san"
                  severity="secondary"
                />
              </div>
            </div>
          </div>

          <div
            v-if="isModifyMode"
            class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <Button
              type="button"
              label="Reset"
              class="p-button-text p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2"
              @click="formReset"
            />
            <div class="flex gap-3">
              <Button
                v-if="formData.status === 'requested'"
                label="Sign"
                icon="pi pi-check"
                class="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-4 py-2 font-medium"
                @click="certAction('signed')"
              />
              <Button
                v-if="
                  formData.status === 'requested' ||
                  formData.status === 'signed'
                "
                label="Revoke"
                icon="pi pi-ban"
                class="bg-rose-600 hover:bg-rose-700 text-white border-none px-4 py-2 font-medium"
                @click="certAction('revoked')"
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
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import type { ResourceDefinition } from '@/types/resources'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

defineProps<{
  resourceDef: ResourceDefinition
}>()

const isModifyMode = ref(false)
const nodeExists = ref(false)
const checkingNode = ref(false)

const formData = reactive<Record<string, any>>({
  id: '',
  ca_id: '',
  cn: '',
  space_id: '',
  status: '',
  fingerprint: {
    sha256: '',
    sha1: '',
    md5: ''
  },
  certificate: '',
  csr: '',
  not_before: '',
  not_after: '',
  serial_number: '',
  created: '',
  cert_uniqueness: '',
  revocation_date: '',
  ca: '',
  ca_chain: [],
  sans: []
})

const hasUpdatePermission = computed(() => {
  const spaceId = route.params.space_id
  if (!spaceId) {
    return false
  }
  return auth.hasPermission(PERMISSIONS.CA.SPACES.CERTS.UPDATE(String(spaceId)))
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
  if (status === 'signed') {
    return 'success'
  }
  if (status === 'requested') {
    return 'warn'
  }
  if (status === 'revoked') {
    return 'danger'
  }
  return 'secondary'
}

const checkNodeExists = async (cn: string) => {
  if (!cn) {
    nodeExists.value = false
    return
  }
  checkingNode.value = true
  try {
    const data = await api.get<any>(
      `/api/v1/nodes/${encodeURIComponent(cn)}`,
      undefined,
      true
    )
    nodeExists.value = !!(data && data.id)
  } catch {
    nodeExists.value = false
  } finally {
    checkingNode.value = false
  }
}

const formGetData = async () => {
  try {
    const url = `/api/v1/ca/spaces/${route.params.space_id}/certs/${route.params.cert_id}`
    const data = await api.get<any>(url)
    if (data) {
      Object.assign(formData, data)
      await checkNodeExists(formData.cn)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load certificate data.',
      life: 3000
    })
  }
}

const formReset = async () => {
  isModifyMode.value = false
  await formGetData()
}

const handleBack = () => {
  router.push({
    name: 'CASpacesCertsSearch',
    params: {
      space_id: route.params.space_id
    }
  })
}

const certAction = (action: 'signed' | 'revoked') => {
  confirm.require({
    message: `Are you sure you want to ${action} certificate: ${formData.id}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: action === 'revoked' ? 'p-button-danger' : 'p-button-success',
    accept: async () => {
      try {
        const url = `/api/v1/ca/spaces/${route.params.space_id}/certs/${formData.id}`
        await api.put(url, { status: action })
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Certificate has been ${action}.`,
          life: 3000
        })
        isModifyMode.value = false
        await formGetData()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update certificate status.',
          life: 3000
        })
      }
    }
  })
}

const initializeFormState = async () => {
  isModifyMode.value = false
  await formGetData()
}

onMounted(() => {
  initializeFormState()
})

watch(
  () => route.params.cert_id,
  () => {
    initializeFormState()
  }
)
</script>
