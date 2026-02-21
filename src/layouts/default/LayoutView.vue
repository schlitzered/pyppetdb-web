<template>
  <ComponentApiError />
  <ComponentAppBar />
  <ComponentNavDrawer />
  <v-main>
    <router-view />
  </v-main>
  <v-footer app border>PyppetDB Frontend</v-footer>
</template>

<script setup>
import { provide, ref } from 'vue'
import ComponentAppBar from '@/components/ComponentAppBar.vue'
import ComponentApiError from '@/components/ComponentApiError.vue'
import ComponentNavDrawer from '@/components/ComponentNavDrawer.vue'

const drawer = ref(true)
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

provide('drawer', drawer)
provide('toggleDrawer', toggleDrawer)
</script>
