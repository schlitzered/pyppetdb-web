<template>
  <div :class="{ dark: isDark }">
    <ConfirmDialog />
    <Toast />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { watch } from 'vue'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { uiStore } from '@/stores/ui'

const ui = uiStore()
const isDark = computed(() => ui.theme === 'dark')

watch(
  isDark,
  (val) => {
    if (val) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  },
  {
    immediate: true
  }
)
</script>
