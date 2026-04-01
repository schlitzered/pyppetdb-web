<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentHieraKeyModelsStaticSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentHieraKeyModelsStaticSearch from '@/components/ComponentHieraKeyModelsStaticSearch.vue'

const searchComponent = ref(null)
</script>
