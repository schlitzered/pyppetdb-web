<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentCAAuthoritiesSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentCAAuthoritiesSearch from '@/components/ComponentCAAuthoritiesSearch.vue'

const searchComponent = ref(null)
</script>
