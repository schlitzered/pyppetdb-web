<template>
  <ComponentApiError />
  <ComponentAppBar />
  <v-main>
    <router-view />
  </v-main>
  <v-footer app border>PyppetDB Frontend</v-footer>
</template>

<script setup>
import ComponentAppBar from '@/components/ComponentAppBar.vue'
import ComponentApiError from '@/components/ComponentApiError.vue'
</script>
