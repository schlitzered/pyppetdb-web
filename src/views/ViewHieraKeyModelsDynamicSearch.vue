<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentHieraKeyModelsDynamicSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentHieraKeyModelsDynamicSearch from '@/components/ComponentHieraKeyModelsDynamicSearch.vue'

const searchComponent = ref(null)
</script>
