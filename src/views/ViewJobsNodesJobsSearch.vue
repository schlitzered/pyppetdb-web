<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentJobsNodesJobsSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsNodesJobsSearch from '@/components/ComponentJobsNodesJobsSearch.vue'

const searchComponent = ref(null)
</script>
