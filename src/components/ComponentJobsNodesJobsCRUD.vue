<template>
  <v-card>
    <v-card-text>
      <div v-if="loading" class="d-flex justify-center pa-4">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
      <div v-else-if="!formData.id">
        Node Job not found.
      </div>
      <v-row v-else>
        <v-col cols="12" sm="6">
          <strong>Node Job ID:</strong> {{ formData.id }}
        </v-col>
        <v-col cols="12" sm="6">
          <strong>Job ID:</strong> {{ formData.job_id }}
        </v-col>
        <v-col cols="12" sm="6">
          <strong>Node ID:</strong> {{ formData.node_id }}
        </v-col>
        <v-col cols="12" sm="6">
          <strong>Status:</strong>
          <v-chip :color="getStatusColor(formData.status)" size="small">
            {{ formData.status }}
          </v-chip>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>
      <div class="d-flex align-center mb-2">
        <v-list-subheader>Logs</v-list-subheader>
        <v-chip
          v-if="isConnected"
          color="info"
          size="x-small"
          class="ml-2 pulse"
          variant="flat"
        >
          LIVE
        </v-chip>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search logs..."
          hide-details
          density="compact"
          class="max-width-300"
          clearable
        ></v-text-field>
      </div>

      <div v-if="(formData.log_blobs && formData.log_blobs.length) || allLines.length > 0">
        <v-infinite-scroll
          :key="refreshKey"
          ref="logScrollRef"
          height="500"
          class="log-container border rounded"
          @load="loadNextBlob"
          @scroll="handleScroll"
        >
          <div
            v-for="line in filteredLines"
            :key="line.id"
            :id="'L' + line.line_nr"
            class="log-line"
            :class="{ 'selected-line': isSelected(line.line_nr) }"
          >
            <span class="line-nr" @click="onLineClick(line.line_nr, $event)">{{
              line.line_nr
            }}</span>
            <span class="timestamp">{{
              new Date(line.timestamp).toLocaleString()
            }}</span>
            <span class="message">{{ line.msg }}</span>
          </div>
          <template v-slot:empty>
            <div class="pa-2 text-center text-grey">
              {{ isConnected ? 'Waiting for more logs...' : 'All logs loaded' }}
            </div>
          </template>
          <template v-slot:error>
            <div class="pa-2 text-center text-error">
              Error loading logs.
              <v-btn size="small" variant="text" @click="formGetData">Retry All</v-btn>
            </div>
          </template>
        </v-infinite-scroll>

        <div v-if="allLines.length === 0 && !isConnected" class="text-center pa-4">
          <p class="text-grey mb-2">
            No logs loaded yet (index: {{ nextBlobIndex }} /
            {{ formData.log_blobs.length }})
          </p>
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            @click="manualTriggerLoad"
            :loading="logLoading"
          >
            Manual Load First Blob
          </v-btn>
        </div>
      </div>
      <div v-else-if="!loading">
        No logs available (blobs: {{ formData.log_blobs?.length }}).
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/common'
import { useLogStream } from '@/common/log_stream'

const route = useRoute()
const router = useRouter()
const { connect, disconnect, isConnected } = useLogStream()

const logScrollRef = ref(null)
const userScrolledUp = ref(false)
const refreshKey = ref(0)
const loading = ref(true)
const logLoading = ref(false)
const formData = reactive({
  id: '',
  job_id: '',
  node_id: '',
  status: '',
  log_blobs: []
})

function handleScroll(e) {
  const el = e.target
  // threshold of 50px for "at bottom"
  const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
  if (isAtBottom) {
    userScrolledUp.value = false
  } else {
    // only consider it a manual scroll up if it was triggered by user
    // (but in simple terms, if we're not at bottom, we don't autoscroll)
    userScrolledUp.value = true
  }
}

function scrollToBottom() {
  if (!logScrollRef.value) return
  nextTick(() => {
    const el = logScrollRef.value.$el
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

const logsMap = reactive(new Map())
const allLines = computed(() => {
  return Array.from(logsMap.values()).sort((a, b) => a.line_nr - b.line_nr)
})

const nextBlobIndex = ref(0)
const searchQuery = ref('')
let currentFetchPromise = null

const selectedRange = reactive({
  start: null,
  end: null
})

const filteredLines = computed(() => {
  if (!searchQuery.value) return allLines.value
  const q = searchQuery.value.toLowerCase()
  return allLines.value.filter((line) => line.msg?.toLowerCase().includes(q))
})

function getStatusColor(status) {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'error'
    case 'running':
      return 'info'
    default:
      return 'grey'
  }
}

async function formGetData() {
  loading.value = true
  try {
    const data = await api.get(
      `/api/v1/jobs/nodes_jobs/${route.params.node_job_id}`
    )
    if (data) {
      Object.assign(formData, data)
      // Ensure blobs are unique in case API returns duplicates
      formData.log_blobs = [...new Set(data.log_blobs)]
      logsMap.clear()
      nextBlobIndex.value = 0
      currentFetchPromise = null
      refreshKey.value++

      // Handle initial selection from URL
      parseSelectionFromUrl()

      const terminalStatuses = ['success', 'failed', 'canceled']
      if (!terminalStatuses.includes(formData.status)) {
        startLogStream()
      } else {
        disconnect(`${formData.job_id}:${formData.node_id}`)
        if (selectedRange.start !== null) {
          nextTick(async () => {
            await loadBlobsUntil(selectedRange.end || selectedRange.start)
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

function startLogStream() {
  const jobRunId = `${formData.job_id}:${formData.node_id}`
  connect(
    jobRunId,
    (newLines) => {
      newLines.forEach((line) => {
        const id = `L${line.line_nr}`
        logsMap.set(id, { ...line, id })
      })
      if (!userScrolledUp.value) {
        scrollToBottom()
      }
    },
    (data) => {
      formData.status = data.status
      // Re-fetch to get final blob IDs if we want to persist the view properly on reload
      api.get(`/api/v1/jobs/nodes_jobs/${route.params.node_job_id}`).then((res) => {
        if (res) {
          formData.status = res.status
          formData.log_blobs = [...new Set(res.log_blobs)]
        }
      })
    }
  )
}

function parseSelectionFromUrl() {
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

async function loadBlobsUntil(targetLineNr) {
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

async function loadNextBlob({ side, done }) {
  if (side === 'start') {
    done('ok')
    return
  }

  if (isConnected.value) {
    done('ok')
    return
  }

  if (nextBlobIndex.value >= formData.log_blobs.length) {
    done('empty')
    return
  }

  try {
    const res = await loadNextBlobInternal()
    if (res) {
      done('ok')
    } else {
      done('ok')
    }
  } catch {
    done('error')
  }
}

async function loadNextBlobInternal() {
  if (currentFetchPromise) return currentFetchPromise

  const index = nextBlobIndex.value
  if (index >= formData.log_blobs.length) return null

  const logId = formData.log_blobs[index]
  
  currentFetchPromise = (async () => {
    logLoading.value = true
    try {
      const res = await api.get(`/api/v1/jobs/nodes_jobs_logs/${logId}`)
      if (res && Array.isArray(res.data)) {
        res.data.forEach((line) => {
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

function onLineClick(lineNr, event) {
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

function updateUrlHash() {
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

function isSelected(lineNr) {
  if (selectedRange.start === null) return false
  if (selectedRange.end === null) return selectedRange.start === lineNr

  const start = Math.min(selectedRange.start, selectedRange.end)
  const end = Math.max(selectedRange.start, selectedRange.end)
  return lineNr >= start && lineNr <= end
}

async function manualTriggerLoad() {
  if (nextBlobIndex.value >= formData.log_blobs.length) return
  await loadNextBlob({
    side: 'end',
    done: (status) => {
      console.log('Manual load finished with status:', status)
    }
  })
}

watch(
  () => route.hash,
  () => {
    parseSelectionFromUrl()
  }
)

onMounted(() => {
  formGetData()
})

defineExpose({ reload: formGetData })
</script>

<style scoped>
.log-container {
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  overflow-y: auto;
}
.log-line {
  font-family: monospace;
  white-space: pre-wrap;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 2px 8px;
  display: flex;
}
.log-line.selected-line {
  background-color: rgba(var(--v-theme-primary), 0.2);
}
.line-nr {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  width: 50px;
  flex-shrink: 0;
  cursor: pointer;
}
.line-nr:hover {
  color: rgb(var(--v-theme-primary));
  opacity: 1;
  text-decoration: underline;
}
.timestamp {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.5;
  font-size: 0.85em;
  margin-right: 10px;
  flex-shrink: 0;
  width: 160px;
}
.message {
  flex-grow: 1;
}
.max-width-300 {
  max-width: 300px;
}
.pulse {
  animation: pulse-animation 2s infinite;
}
@keyframes pulse-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
