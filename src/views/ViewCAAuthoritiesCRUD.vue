<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentCAAuthoritiesCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentCAAuthoritiesCRUD from '@/components/ComponentCAAuthoritiesCRUD.vue'

const crudComponent = ref(null)
</script>
