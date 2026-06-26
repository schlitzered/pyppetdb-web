<template>
  <Toolbar
    class="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-lg shadow-sm"
  >
    <template #start>
      <slot name="left" />
    </template>
    <template #end>
      <slot name="right" />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
</script>
