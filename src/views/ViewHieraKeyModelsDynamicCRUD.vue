<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentHieraKeyModelsDynamicCrud ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentHieraKeyModelsDynamicCrud from '@/components/ComponentHieraKeyModelsDynamicCRUD.vue'

const crudComponent = ref(null)
</script>
