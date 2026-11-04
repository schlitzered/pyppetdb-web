<template>
  <div class="p-4 flex flex-col gap-4">
    <ResponsiveToolbar>
      <template #left>
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Audit Configuration
        </h1>
      </template>
      <template #right>
        <Button
          v-if="canUpdate"
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          :disabled="loading"
          class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none py-2 px-4 font-medium"
          @click="save"
        />
      </template>
    </ResponsiveToolbar>

    <Message
      v-for="rule in unknownRules"
      :key="rule"
      severity="warn"
      :closable="false"
    >
      Rule <code>{{ rule }}</code> matches no known event.
      <Button
        v-if="canUpdate && rule in rules"
        label="Remove"
        size="small"
        text
        @click="setRule(rule, 'inherit')"
      />
    </Message>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900"
    >
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label
              for="audit_enabled"
              class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
            >
              Enabled (mandatory events are always recorded)
            </label>
            <ToggleSwitch
              v-model="enabled"
              input-id="audit_enabled"
              :disabled="!canUpdate"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              for="retention_days"
              class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
            >
              Retention (days, empty keeps forever)
            </label>
            <InputNumber
              v-model="retentionDays"
              input-id="retention_days"
              :min="1"
              :use-grouping="false"
              :disabled="!canUpdate"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              for="seal_interval"
              class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
            >
              Seal interval (seconds)
            </label>
            <InputNumber
              v-model="sealInterval"
              input-id="seal_interval"
              :min="1"
              :use-grouping="false"
              :disabled="!canUpdate"
            />
          </div>
        </div>
      </template>
    </Card>

    <div
      class="card border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm"
    >
      <TreeTable
        v-model:expanded-keys="expandedKeys"
        :value="tree"
        :loading="loading"
        class="p-treetable-sm"
      >
        <Column field="label" header="Event" expander>
          <template #body="{ node }">
            <span class="font-mono text-xs" :title="node.key">{{
              node.data.label
            }}</span>
          </template>
        </Column>
        <Column field="description" header="Description">
          <template #body="{ node }">
            <span class="text-sm text-zinc-600 dark:text-zinc-400">{{
              node.data.event?.description
            }}</span>
          </template>
        </Column>
        <Column header="Rule">
          <template #body="{ node }">
            <Tag
              v-if="node.data.event?.mandatory"
              value="mandatory"
              severity="secondary"
            />
            <SelectButton
              v-else
              :model-value="ruleState(node.key)"
              :options="ruleOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
              :disabled="!canUpdate"
              size="small"
              @update:model-value="setRule(node.key, $event)"
            />
          </template>
        </Column>
        <Column header="Effective">
          <template #body="{ node }">
            <Tag
              v-if="node.data.event"
              :value="node.data.event.enabled ? 'on' : 'off'"
              :severity="node.data.event.enabled ? 'success' : 'danger'"
            />
          </template>
        </Column>
      </TreeTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { reactive } from 'vue'
import { onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import TreeTable from 'primevue/treetable'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import { PERMISSIONS } from '@/constants/permissions'

interface AuditEventInfo {
  name: string
  module: string
  description: string
  default: boolean
  mandatory: boolean
  enabled: boolean
}

interface AuditConfigData {
  enabled: boolean
  events: Record<string, boolean>
  retention_days: number | null
  seal_interval: number
  unknown_rules: string[]
}

interface EventNode {
  key: string
  data: { label: string; event?: AuditEventInfo }
  children: EventNode[]
}

type RuleState = 'inherit' | 'on' | 'off'

const toast = useToast()
const auth = authStore()

const canUpdate = computed(() =>
  auth.hasPermission(PERMISSIONS.AUDIT.CONFIG.UPDATE)
)

const ruleOptions = [
  { label: 'Inherit', value: 'inherit' },
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' }
]

const loading = ref(true)
const saving = ref(false)
const enabled = ref(true)
const retentionDays = ref<number | null>(null)
const sealInterval = ref<number | null>(60)
const unknownRules = ref<string[]>([])
// rule map keyed by event name or dotted prefix; a missing key inherits
const rules = reactive<Record<string, boolean>>({})
const events = ref<AuditEventInfo[]>([])
const expandedKeys = ref<Record<string, boolean>>({})

// module -> prefixes -> events, built from the dotted event names
const tree = computed(() => {
  const roots: EventNode[] = []
  for (const event of events.value) {
    const parts = event.name.split('.')
    let level = roots
    parts.forEach((part, i) => {
      const key = parts.slice(0, i + 1).join('.')
      let node = level.find((n) => n.key === key)
      if (!node) {
        node = { key, data: { label: part }, children: [] }
        level.push(node)
      }
      if (i === parts.length - 1) node.data.event = event
      level = node.children
    })
  }
  return roots
})

const ruleState = (key: string): RuleState =>
  key in rules ? (rules[key] ? 'on' : 'off') : 'inherit'

const setRule = (key: string, state: RuleState) => {
  if (state === 'inherit') delete rules[key]
  else rules[key] = state === 'on'
}

const loadEvents = async () => {
  const data = await api.get<{ result: AuditEventInfo[] }>(
    '/api/v1/audit/events'
  )
  events.value = data?.result || []
}

const loadConfig = async () => {
  const data = await api.get<AuditConfigData>('/api/v1/audit/config')
  if (!data) return
  enabled.value = data.enabled
  retentionDays.value = data.retention_days ?? null
  sealInterval.value = data.seal_interval
  unknownRules.value = data.unknown_rules || []
  for (const k of Object.keys(rules)) delete rules[k]
  Object.assign(rules, data.events || {})
}

const load = async () => {
  loading.value = true
  try {
    await Promise.all([loadConfig(), loadEvents()])
    if (Object.keys(expandedKeys.value).length === 0) {
      for (const root of tree.value) expandedKeys.value[root.key] = true
    }
  } catch {
    // reported by the api client
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    // events replaces the whole rule map server side: always send all of it
    await api.put('/api/v1/audit/config', {
      enabled: enabled.value,
      events: { ...rules },
      retention_days: retentionDays.value ?? null,
      seal_interval: sealInterval.value || undefined
    })
    toast.add({
      severity: 'success',
      summary: 'Saved',
      detail: 'Audit configuration saved',
      life: 3000
    })
    await load()
  } catch {
    // reported by the api client
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
