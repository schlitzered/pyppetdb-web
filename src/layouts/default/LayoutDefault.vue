<template>
  <v-app>
    <ComponentLoginStateCheck />
    <default-view />
  </v-app>
</template>

<script setup>
import ComponentLoginStateCheck from '@/components/ComponentLoginStateCheck.vue'
import DefaultView from './LayoutView.vue'
</script>
