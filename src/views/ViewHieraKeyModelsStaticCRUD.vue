<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentHieraKeyModelsStaticCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentHieraKeyModelsStaticCRUD from '@/components/ComponentHieraKeyModelsStaticCRUD.vue'

const crudComponent = ref(null)
</script>
