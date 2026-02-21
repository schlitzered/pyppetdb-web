<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar />
    <ComponentNodesGroupsCrud />
  </v-container>
</template>

<script setup>
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentNodesGroupsCrud from '@/components/ComponentNodesGroupsCRUD.vue'
</script>
