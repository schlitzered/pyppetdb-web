<template>
  <Button
    :icon="themeIcon"
    class="p-button-rounded p-button-text text-zinc-600 dark:text-zinc-300"
    @click="ui.toggleTheme"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { uiStore } from '@/stores/ui'

const ui = uiStore()
const themeIcon = computed(() =>
  ui.theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'
)
</script>
