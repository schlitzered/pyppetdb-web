<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentNodesSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentNodesSearch from '@/components/ComponentNodesSearch.vue'

const searchComponent = ref(null)
</script>
