<template>
  <div class="flex flex-col gap-6">
    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <div v-if="loading" class="flex justify-center p-4">
          <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
        </div>
        <div v-else-if="!formData.id" class="text-zinc-500 p-4">
          Node Job not found.
        </div>
        <div v-else class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500"
                >Node Job ID</span
              >
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                {{ formData.id }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Job ID</span>
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                {{ formData.job_id }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Node ID</span>
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                {{ formData.node_id }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">Status</span>
              <div>
                <Tag
                  :value="formData.status"
                  :severity="getStatusSeverity(formData.status)"
                />
              </div>
            </div>
          </div>

          <hr class="border-zinc-200 dark:border-zinc-800 my-2" />

          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-zinc-800 dark:text-zinc-100"
                >Logs</span
              >
              <span v-if="isConnected" class="flex h-3 w-3 relative">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"
                ></span>
              </span>
              <span
                v-if="isConnected"
                class="text-xs font-semibold text-emerald-500"
              >
                LIVE
              </span>
            </div>
            <InputText
              v-model="searchQuery"
              placeholder="Search logs..."
              class="p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 w-full md:max-w-xs"
            />
          </div>

          <div
            v-if="formData.log_blobs.length > 0 || allLines.length > 0"
            class="flex flex-col gap-2"
          >
            <div
              ref="logScrollRef"
              class="font-mono text-xs bg-zinc-950 text-zinc-100 p-4 rounded border border-zinc-800 h-[500px] overflow-y-auto flex flex-col gap-0.5"
              @scroll="handleScroll"
            >
              <div
                v-for="line in filteredLines"
                :key="line.id"
                :id="'L' + line.line_nr"
                :class="[
                  'flex py-0.5 hover:bg-zinc-900 cursor-pointer rounded px-1 transition-colors duration-150',
                  isSelected(line.line_nr)
                    ? 'bg-zinc-700/50 dark:bg-zinc-700/70 text-white'
                    : ''
                ]"
              >
                <span
                  class="w-12 text-zinc-500 select-none mr-2 hover:underline hover:text-zinc-300 dark:hover:text-white"
                  @click="onLineClick(line.line_nr, $event)"
                >
                  {{ line.line_nr }}
                </span>
                <span class="w-40 text-zinc-400 select-none mr-2">
                  {{ new Date(line.timestamp).toLocaleString() }}
                </span>
                <span
                  class="flex-grow whitespace-pre-wrap break-all text-emerald-400"
                >
                  {{ line.msg }}
                </span>
              </div>
              <div
                v-if="isConnected"
                class="p-2 text-center text-zinc-400 text-xs italic"
              >
                Waiting for more logs...
              </div>
              <div
                v-else-if="nextBlobIndex >= formData.log_blobs.length"
                class="p-2 text-center text-zinc-400 text-xs italic"
              >
                All logs loaded
              </div>
            </div>

            <div
              v-if="allLines.length === 0 && !isConnected"
              class="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50/50 dark:bg-zinc-900/10"
            >
              <p class="text-zinc-500 mb-3 text-sm">
                No logs loaded yet (index: {{ nextBlobIndex }} /
                {{ formData.log_blobs.length }})
              </p>
              <Button
                label="Manual Load First Blob"
                icon="pi pi-download"
                class="p-button-outlined p-button-sm font-medium"
                :loading="logLoading"
                @click="manualTriggerLoad"
              />
            </div>
          </div>
          <div v-else-if="!loading" class="text-zinc-500 p-4">
            No logs available.
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactive } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import api from '@/api/client'
import { useLogStream } from '@/composables/useLogStream'
import type { ResourceDefinition } from '@/types/resources'

defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const { connect, disconnect, isConnected } = useLogStream()

const logScrollRef = ref<HTMLElement | null>(null)
const userScrolledUp = ref(false)
const refreshKey = ref(0)
const loading = ref(true)
const logLoading = ref(false)

const formData = reactive<Record<string, any>>({
  id: '',
  job_id: '',
  node_id: '',
  status: '',
  log_blobs: []
})

const logsMap = reactive(new Map<string, any>())

const allLines = computed(() => {
  return Array.from(logsMap.values()).sort((a, b) => a.line_nr - b.line_nr)
})

const nextBlobIndex = ref(0)
const searchQuery = ref('')
let currentFetchPromise: Promise<any> | null = null

const selectedRange = reactive<{ start: number | null; end: number | null }>({
  start: null,
  end: null
})

const filteredLines = computed(() => {
  if (!searchQuery.value) return allLines.value
  const q = searchQuery.value.toLowerCase()
  return allLines.value.filter((line) => line.msg?.toLowerCase().includes(q))
})

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'info'
    default:
      return 'secondary'
  }
}

const handleScroll = (event: Event) => {
  const el = event.target as HTMLElement
  const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
  if (isAtBottom) {
    userScrolledUp.value = false
    loadNextBlob()
  } else {
    userScrolledUp.value = true
  }
}

const scrollToBottom = () => {
  if (!logScrollRef.value) return
  nextTick(() => {
    const el = logScrollRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

const parseSelectionFromUrl = () => {
  const hash = route.hash
  if (hash && hash.startsWith('#L')) {
    const parts = hash.substring(2).split('-L')
    selectedRange.start = parseInt(parts[0], 10)
    if (parts.length > 1) {
      selectedRange.end = parseInt(parts[1], 10)
    } else {
      selectedRange.end = null
    }
  } else {
    selectedRange.start = null
    selectedRange.end = null
  }
}

const updateUrlHash = () => {
  let hash = ''
  if (selectedRange.start !== null) {
    hash = '#L' + selectedRange.start
    if (selectedRange.end !== null) {
      const start = Math.min(selectedRange.start, selectedRange.end)
      const end = Math.max(selectedRange.start, selectedRange.end)
      hash = `#L${start}-L${end}`
    }
  }
  router.replace({ hash })
}

const isSelected = (lineNr: number) => {
  if (selectedRange.start === null) return false
  if (selectedRange.end === null) return selectedRange.start === lineNr
  const start = Math.min(selectedRange.start, selectedRange.end)
  const end = Math.max(selectedRange.start, selectedRange.end)
  return lineNr >= start && lineNr <= end
}

const onLineClick = (lineNr: number, event: MouseEvent) => {
  if (event.shiftKey && selectedRange.start !== null) {
    selectedRange.end = lineNr
  } else {
    if (selectedRange.start === lineNr && selectedRange.end === null) {
      selectedRange.start = null
    } else {
      selectedRange.start = lineNr
      selectedRange.end = null
    }
  }
  updateUrlHash()
}

const handleLogMessage = (logs: any) => {
  if (Array.isArray(logs)) {
    logs.forEach((line: any) => {
      const id = `L${line.line_nr}`
      logsMap.set(id, { ...line, id })
    })
  } else if (typeof logs === 'string') {
    try {
      const parsed = JSON.parse(logs)
      if (Array.isArray(parsed)) {
        parsed.forEach((line: any) => {
          const id = `L${line.line_nr}`
          logsMap.set(id, { ...line, id })
        })
      } else {
        const id = `L${parsed.line_nr || Date.now()}`
        logsMap.set(id, { ...parsed, id })
      }
    } catch {
      const lines = logs.split('\n')
      lines.forEach((line, index) => {
        if (line.trim()) {
          const id = `L${Date.now()}-${index}`
          logsMap.set(id, {
            line_nr: index,
            timestamp: new Date().toISOString(),
            msg: line,
            id
          })
        }
      })
    }
  }
  if (!userScrolledUp.value) {
    scrollToBottom()
  }
}

const handleJobFinished = (body: any) => {
  formData.status = body.status
  api
    .get<any>(
      `/api/v1/jobs/nodes_jobs/${encodeURIComponent(String(route.params.node_job_id))}`
    )
    .then((res) => {
      if (res) {
        formData.status = res.status
        formData.log_blobs = [...new Set(res.log_blobs)]
      }
    })
}

const startLogStream = () => {
  const jobRunId = `${formData.job_id}:${formData.node_id}`
  connect(jobRunId, handleLogMessage, handleJobFinished)
}

const formGetData = async () => {
  loading.value = true
  try {
    const data = await api.get<any>(
      `/api/v1/jobs/nodes_jobs/${encodeURIComponent(String(route.params.node_job_id))}`
    )
    if (data) {
      Object.assign(formData, data)
      formData.log_blobs = [...new Set(data.log_blobs)]
      logsMap.clear()
      nextBlobIndex.value = 0
      currentFetchPromise = null
      refreshKey.value++
      parseSelectionFromUrl()

      const terminalStatuses = ['success', 'failed', 'canceled']
      if (!terminalStatuses.includes(formData.status)) {
        startLogStream()
      } else {
        disconnect(`${formData.job_id}:${formData.node_id}`)
        if (selectedRange.start !== null) {
          nextTick(async () => {
            await loadBlobsUntil(selectedRange.end || selectedRange.start!)
          })
        } else {
          nextTick(async () => {
            await loadNextBlob()
          })
        }
      }
    }
  } catch (e) {
    console.error('Failed to get NodeJob', e)
  } finally {
    loading.value = false
  }
}

const loadNextBlobInternal = async () => {
  if (currentFetchPromise) return currentFetchPromise
  const index = nextBlobIndex.value
  if (index >= formData.log_blobs.length) return null
  const logId = formData.log_blobs[index]
  currentFetchPromise = (async () => {
    logLoading.value = true
    try {
      const res = await api.get<any>(`/api/v1/jobs/nodes_jobs_logs/${logId}`)
      if (res && Array.isArray(res.data)) {
        res.data.forEach((line: any) => {
          const id = `L${line.line_nr}`
          logsMap.set(id, { ...line, id })
        })
        nextBlobIndex.value++
        return res
      }
    } catch (e) {
      console.error('Error loading log blob', e)
      throw e
    } finally {
      logLoading.value = false
      currentFetchPromise = null
    }
    return null
  })()
  return currentFetchPromise
}

const loadBlobsUntil = async (targetLineNr: number) => {
  const targetBlobIndex = Math.floor((targetLineNr - 1) / 1000)
  while (
    nextBlobIndex.value <= targetBlobIndex &&
    nextBlobIndex.value < formData.log_blobs.length
  ) {
    await loadNextBlobInternal()
  }
  if (selectedRange.start) {
    nextTick(() => {
      const el = document.getElementById('L' + selectedRange.start)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}

const checkScrollAndLoadMore = () => {
  if (
    isConnected.value ||
    logLoading.value ||
    nextBlobIndex.value >= formData.log_blobs.length
  ) {
    return
  }
  const el = logScrollRef.value
  if (el) {
    const isCloseToBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    if (isCloseToBottom) {
      loadNextBlob()
    }
  }
}

const loadNextBlob = async () => {
  if (
    isConnected.value ||
    logLoading.value ||
    nextBlobIndex.value >= formData.log_blobs.length
  ) {
    return
  }
  try {
    await loadNextBlobInternal()
    nextTick(() => {
      checkScrollAndLoadMore()
    })
  } catch (e) {
    console.error('Failed to load next blob', e)
  }
}

const manualTriggerLoad = async () => {
  if (nextBlobIndex.value >= formData.log_blobs.length) return
  await loadNextBlob()
}

watch(
  () => route.hash,
  () => {
    parseSelectionFromUrl()
  }
)

onMounted(async () => {
  await formGetData()
})

defineExpose({
  reload: formGetData
})
</script>
