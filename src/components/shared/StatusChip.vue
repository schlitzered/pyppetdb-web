<template>
  <Chip :label="label" :class="severityClass" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Chip from 'primevue/chip'

const props = defineProps<{
  status: string
}>()

const label = computed(() => props.status.toUpperCase())

const severityClass = computed(() => {
  const s = props.status.toLowerCase()
  if (s === 'changed' || s === 'success' || s === 'connected') {
    return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
  }
  if (s === 'failed' || s === 'error') {
    return 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
  }
  if (s === 'unchanged' || s === 'idle') {
    return 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
  }
  return 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
})
</script>
