<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentJobsCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentJobsCRUD from '@/components/ComponentJobsCRUD.vue'

const crudComponent = ref(null)
</script>
