<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentJobsDefinitionsCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsDefinitionsCRUD from '@/components/ComponentJobsDefinitionsCRUD.vue'

const crudComponent = ref(null)
</script>
