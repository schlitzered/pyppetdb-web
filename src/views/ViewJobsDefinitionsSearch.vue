<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentJobsDefinitionsSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsDefinitionsSearch from '@/components/ComponentJobsDefinitionsSearch.vue'

const searchComponent = ref(null)
</script>
