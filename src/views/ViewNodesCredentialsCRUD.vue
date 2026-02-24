<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar />
    <ComponentNodesCredentialsCrud />
  </v-container>
</template>

<script setup>
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentNodesCredentialsCrud from '@/components/ComponentNodesCredentialsCRUD.vue'
</script>
