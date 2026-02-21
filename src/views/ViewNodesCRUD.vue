<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar />
    <ComponentNodesCrud />
  </v-container>
</template>

<script setup>
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentNodesCrud from '@/components/ComponentNodesCRUD.vue'
</script>
