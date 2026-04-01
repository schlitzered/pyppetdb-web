<template>
  <ComponentApiError />
  <ComponentAppBar />
  <ComponentNavDrawer />
  <v-main>
    <router-view />
  </v-main>
  <v-footer v-if="!route.meta.hideNav" app border>PyppetDB Frontend</v-footer>
</template>

<script setup>
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import ComponentAppBar from '@/components/ComponentAppBar.vue'
import ComponentApiError from '@/components/ComponentApiError.vue'
import ComponentNavDrawer from '@/components/ComponentNavDrawer.vue'

const route = useRoute()
const drawer = ref(true)
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

provide('drawer', drawer)
provide('toggleDrawer', toggleDrawer)
</script>
