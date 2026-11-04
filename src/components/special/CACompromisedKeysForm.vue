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
            {{ isNew ? 'Report Compromised Key' : `Compromised Key ${keyId}` }}
          </h1>
        </div>
      </template>
    </ResponsiveToolbar>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <form
          v-if="isNew"
          class="flex flex-col gap-4"
          @submit.prevent="formSubmit"
        >
          <Message severity="warn" :closable="false">
            Reporting a key as compromised revokes every certificate with this
            key in every space. This cannot be undone.
          </Message>

          <div class="flex flex-col gap-1">
            <label
              for="source-kind"
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Source *
            </label>
            <SelectButton
              id="source-kind"
              v-model="sourceKind"
              :options="sourceOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="pem"
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              {{ sourceLabel }} (PEM) *
            </label>
            <Textarea
              id="pem"
              v-model="pem"
              rows="10"
              required
              class="font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label
              for="note"
              class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
            >
              Note
            </label>
            <Textarea
              id="note"
              v-model="note"
              rows="3"
              maxlength="1024"
              class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div
            class="flex justify-end mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <Button
              type="submit"
              label="Report Compromised"
              icon="pi pi-exclamation-triangle"
              :disabled="!pem.trim()"
              class="bg-rose-600 hover:bg-rose-700 text-white border-none px-4 py-2"
            />
          </div>
        </form>

        <div v-else-if="loading" class="flex justify-center p-8">
          <ProgressSpinner />
        </div>

        <div v-else-if="item" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="row in detailRows"
            :key="row.label"
            class="flex flex-col gap-1"
          >
            <span class="text-xs font-semibold text-zinc-500">
              {{ row.label }}
            </span>
            <span
              class="text-sm text-zinc-800 dark:text-zinc-200 break-all whitespace-pre-wrap"
            >
              {{ row.value || '-' }}
            </span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import type { ResourceDefinition } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const apiBase = props.resourceDef.apiBase as string
const keyId = computed(() => String(route.params[props.resourceDef.routeParam]))
const isNew = computed(() => keyId.value === '_new')

const sourceOptions = [
  { label: 'Certificate', value: 'certificate' },
  { label: 'CSR', value: 'csr' },
  { label: 'Public Key', value: 'public_key' }
]
const sourceKind = ref('certificate')
const sourceLabel = computed(
  () => sourceOptions.find((o) => o.value === sourceKind.value)?.label
)
const pem = ref('')
const note = ref('')

const loading = ref(false)
const item = ref<Record<string, any> | null>(null)

const formatDate = (value: unknown) =>
  value ? new Date(String(value)).toLocaleString() : ''

const detailRows = computed(() => {
  const i = item.value || {}
  const source = i.source || {}
  return [
    { label: 'Key ID', value: i.id },
    { label: 'Key Type', value: i.key_type },
    { label: 'Key Detail', value: i.key_detail },
    { label: 'Reason', value: i.reason },
    { label: 'Source', value: source.kind },
    { label: 'Source ID', value: source.id },
    { label: 'Common Name', value: source.cn },
    { label: 'Space ID', value: source.space_id },
    { label: 'CA ID', value: source.ca_id },
    { label: 'Note', value: i.note },
    { label: 'Created By', value: i.created_by },
    { label: 'Created', value: formatDate(i.created) }
  ]
})

const load = async () => {
  loading.value = true
  try {
    item.value = await api.get(`${apiBase}/${encodeURIComponent(keyId.value)}`)
  } catch {
    item.value = null
  } finally {
    loading.value = false
  }
}

const formSubmit = () => {
  confirm.require({
    message:
      'This revokes every certificate with this key in every space and cannot be undone. Continue?',
    header: 'Report Compromised Key',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const payload: Record<string, string> = {
          [sourceKind.value]: pem.value
        }
        if (note.value) payload.note = note.value
        const created = await api.post<Record<string, any>>(apiBase, payload)
        toast.add({
          severity: 'success',
          summary: 'Reported',
          detail: 'Key reported as compromised',
          life: 3000
        })
        if (created?.id) {
          router.push({
            name: props.resourceDef.routeNames.crud,
            params: { [props.resourceDef.routeParam]: created.id }
          })
        } else {
          handleBack()
        }
      } catch {
        // the api client shows the error dialog
      }
    }
  })
}

const handleBack = () => {
  router.push({ name: props.resourceDef.routeNames.search })
}

onMounted(() => {
  if (!isNew.value) load()
})
</script>
