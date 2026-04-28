<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentPyppetdbNodesCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentPyppetdbNodesCRUD from '@/components/ComponentPyppetdbNodesCRUD.vue'

const crudComponent = ref(null)
</script>
