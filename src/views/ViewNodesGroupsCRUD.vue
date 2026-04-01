<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentNodesGroupsCrud ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentNodesGroupsCrud from '@/components/ComponentNodesGroupsCRUD.vue'

const crudComponent = ref(null)
</script>
