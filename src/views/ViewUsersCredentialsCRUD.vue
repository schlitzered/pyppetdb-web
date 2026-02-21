<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar />
    <ComponentUsersCredentialsCrud />
  </v-container>
</template>

<script setup>
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentUsersCredentialsCrud from '@/components/ComponentUsersCredentialsCRUD.vue'
</script>
