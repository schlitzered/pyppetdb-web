<template>
  <Accordion v-if="canRead" v-model:value="openPanel">
    <AccordionPanel value="audit">
      <AccordionHeader>Audit Log</AccordionHeader>
      <AccordionContent>
        <AuditEventTable
          :items="items"
          :loading="loading"
          :total-records="total"
          :rows="rows"
          :first="page * rows"
          :sortable="false"
          :show-object="false"
          @page="onPage"
          @filter="openInAuditLog"
        />
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import AuditEventTable from '@/components/special/AuditEventTable.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'
import { escapeRegex } from '@/utils/audit'
import type { AuditEvent } from '@/utils/audit'

const props = defineProps<{
  objectKind: string
  objectId: string
}>()

const router = useRouter()
const auth = authStore()

const canRead = computed(() => auth.hasPermission(PERMISSIONS.AUDIT.GET))

// collapsed by default; events are only fetched once the panel is opened
const openPanel = ref<string | null>(null)
const items = ref<AuditEvent[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(0)
const rows = ref(10)

const load = async () => {
  loading.value = true
  try {
    const data = await api.get<{
      result: AuditEvent[]
      meta: { result_size: number }
    }>('/api/v1/audit', {
      object_kind: props.objectKind,
      object_id: `^${escapeRegex(props.objectId)}$`,
      sort: 'time',
      sort_order: 'descending',
      page: page.value,
      limit: rows.value
    })
    items.value = data?.result || []
    total.value = data?.meta?.result_size || 0
  } catch {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const onPage = (event: { page: number; rows: number }) => {
  page.value = event.page
  rows.value = event.rows
  load()
}

const openInAuditLog = (filters: Record<string, string>) => {
  router.push({ name: 'AuditSearch', query: filters })
}

watch(openPanel, (value) => {
  if (value === 'audit') load()
})

watch(
  () => [props.objectKind, props.objectId],
  () => {
    page.value = 0
    if (openPanel.value === 'audit') load()
  }
)
</script>
