<template>
  <v-container fluid class="pa-0">
    <ComponentGenericToolBar @reload="searchComponent.reload()" />
    <ComponentUsersCredentialsSearch ref="searchComponent" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import ComponentGenericToolBar from '@/components/ComponentGenericToolBar.vue'
import ComponentUsersCredentialsSearch from '@/components/ComponentUsersCredentialsSearch.vue'

const searchComponent = ref(null)
</script>
