<template>
  <DataTable
    v-model:expanded-rows="expandedRows"
    :value="items"
    lazy
    paginator
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    current-page-report-template="Showing {first} to {last} of {totalRecords} results"
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    :loading="loading"
    :rows-per-page-options="[10, 25, 50, 100]"
    :sort-field="sortField"
    :sort-order="sortOrder"
    removable-sort
    class="p-datatable-sm"
    data-key="id"
    @page="emit('page', $event)"
    @sort="emit('sort', $event)"
  >
    <Column expander class="w-8" />
    <Column field="time" header="Time" :sortable="sortable">
      <template #body="{ data }">
        <span class="text-sm whitespace-nowrap">{{
          formatTime(data.time)
        }}</span>
        <Tag
          v-if="data.sealed === false"
          value="unsealed"
          severity="warn"
          class="ml-2 text-xs"
        />
      </template>
    </Column>
    <Column field="event" header="Event" :sortable="sortable">
      <template #body="{ data }">
        <span class="font-mono text-xs">{{ data.event }}</span>
      </template>
    </Column>
    <Column field="module" header="Module">
      <template #body="{ data }">
        <span class="text-sm">{{ data.module }}</span>
      </template>
    </Column>
    <Column header="Actor">
      <template #body="{ data }">
        <a
          v-if="data.actor"
          href="#"
          class="text-sm hover:underline"
          :title="data.actor.via ? `via ${data.actor.via}` : undefined"
          @click.prevent="filterActor(data)"
        >
          {{ data.actor.kind
          }}<template v-if="data.actor.id">: {{ data.actor.id }}</template>
        </a>
      </template>
    </Column>
    <Column v-if="showObject" header="Object">
      <template #body="{ data }">
        <template v-if="data.object">
          <span class="text-xs text-zinc-500">{{ data.object.kind }}</span>
          <router-link
            v-if="auditObjectRoute(data)"
            :to="auditObjectRoute(data)!"
            class="ml-1 font-mono text-xs hover:underline"
          >
            {{ data.object.id }}
          </router-link>
          <span v-else-if="data.object.id" class="ml-1 font-mono text-xs">
            {{ data.object.id }}
          </span>
        </template>
      </template>
    </Column>
    <Column header="Transaction">
      <template #body="{ data }">
        <a
          v-if="data.transaction"
          href="#"
          class="font-mono text-xs hover:underline"
          @click.prevent="emit('filter', { transaction: data.transaction })"
        >
          {{ data.transaction }}
        </a>
      </template>
    </Column>
    <Column header="IP">
      <template #body="{ data }">
        <span class="font-mono text-xs">{{ data.request?.ip }}</span>
      </template>
    </Column>
    <template #expansion="{ data }">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-2">
        <div>
          <div class="text-xs font-semibold text-zinc-500 mb-1">Details</div>
          <pre
            class="text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded overflow-auto max-h-96"
            >{{ pretty(data.details) }}</pre
          >
        </div>
        <div>
          <div class="text-xs font-semibold text-zinc-500 mb-1">Request</div>
          <pre
            class="text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded overflow-auto max-h-96"
            >{{ pretty(data.request) }}</pre
          >
          <div class="text-xs text-zinc-500 mt-2 font-mono">
            id {{ data.id
            }}<template v-if="data.seq != null"> · seq {{ data.seq }}</template>
          </div>
        </div>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { auditObjectRoute } from '@/utils/audit'
import { escapeRegex } from '@/utils/audit'
import type { AuditEvent } from '@/utils/audit'

withDefaults(
  defineProps<{
    items: AuditEvent[]
    loading: boolean
    totalRecords: number
    rows: number
    first: number
    sortField?: string
    sortOrder?: number
    sortable?: boolean
    showObject?: boolean
  }>(),
  {
    sortField: undefined,
    sortOrder: undefined,
    sortable: true,
    showObject: true
  }
)

const emit = defineEmits<{
  page: [event: { page: number; rows: number }]
  sort: [event: { sortField?: unknown; sortOrder?: number | null }]
  filter: [filters: Record<string, string>]
}>()

const expandedRows = ref<Record<string, boolean>>({})

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : ''

const pretty = (value: unknown) =>
  value == null ? '–' : JSON.stringify(value, null, 2)

const filterActor = (item: AuditEvent) => {
  emit('filter', {
    actor_kind: item.actor!.kind,
    actor_id: item.actor!.id ? `^${escapeRegex(item.actor!.id)}$` : ''
  })
}
</script>
