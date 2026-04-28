<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentJobsNodesJobsCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsNodesJobsCRUD from '@/components/ComponentJobsNodesJobsCRUD.vue'

const crudComponent = ref(null)
</script>
