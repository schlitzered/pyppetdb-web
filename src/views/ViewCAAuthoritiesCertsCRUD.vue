<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentCAAuthoritiesCertsCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentCAAuthoritiesCertsCRUD from '@/components/ComponentCAAuthoritiesCertsCRUD.vue'

const crudComponent = ref(null)
</script>
