<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentHieraLevelDataCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentHieraLevelDataCRUD from '@/components/ComponentHieraLevelDataCRUD.vue'

const crudComponent = ref(null)
</script>
