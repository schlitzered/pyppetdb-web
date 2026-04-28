<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentJobsSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsSearch from '@/components/ComponentJobsSearch.vue'

const searchComponent = ref(null)
</script>
