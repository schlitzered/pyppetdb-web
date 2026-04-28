<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentPyppetdbNodesSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentPyppetdbNodesSearch from '@/components/ComponentPyppetdbNodesSearch.vue'

const searchComponent = ref(null)
</script>
