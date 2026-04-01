<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentCASpacesCertsSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentCASpacesCertsSearch from '@/components/ComponentCASpacesCertsSearch.vue'

const searchComponent = ref(null)
</script>
