<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentUsersCrud ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentUsersCrud from '@/components/ComponentUsersCRUD.vue'

const crudComponent = ref(null)
</script>
