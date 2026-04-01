<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentCASpacesCertsCRUD ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentCASpacesCertsCRUD from '@/components/ComponentCASpacesCertsCRUD.vue'

const crudComponent = ref(null)
</script>
