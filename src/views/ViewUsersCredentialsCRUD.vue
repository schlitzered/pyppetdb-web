<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="crudComponent.reload()" />
    <ComponentUsersCredentialsCrud ref="crudComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentUsersCredentialsCrud from '@/components/ComponentUsersCredentialsCRUD.vue'

const crudComponent = ref(null)
</script>
