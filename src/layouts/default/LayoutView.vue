/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
