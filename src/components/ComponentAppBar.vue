<template>
  <!-- AppBar -->
  <v-app-bar
    v-if="route.name !== 'Login'"
    app
    fixed
    elevation="10"
    extension-height="64"
  >
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    <v-breadcrumbs>
      <template v-for="(item, index) in getBreadCrumbs" :key="index">
        <v-breadcrumbs-item :disabled="!item.to">
          <router-link
            v-if="item.to"
            :to="item.to"
            class="breadcrumb-link"
          >
            {{ item.title }}
          </router-link>
          <span v-else>{{ item.title }}</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider v-if="index < getBreadCrumbs.length - 1">
          /
        </v-breadcrumbs-divider>
      </template>
    </v-breadcrumbs>
    <v-spacer></v-spacer>
    <v-switch
      v-model="isDark"
      :prepend-icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
      hide-details
      inset
      @update:modelValue="toggleTheme"
      class="mr-4"
    ></v-switch>
    <v-btn href="/docs" target="_blank" rel="noopener noreferrer">API</v-btn>
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-account" v-bind="props"> </v-btn>
      </template>
      <v-list>
        <v-list-item
          @click="router.push({ name: 'UsersCRUD', params: { user: '_self' } })"
          to="/users/_self"
          >{{ loginData.getUserDataId }}</v-list-item
        >
        <v-divider></v-divider>

        <v-divider></v-divider>
        <v-list-item @click="router.push({ name: 'LoginLogout' })"
          >Logout</v-list-item
        >
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()
const toggleDrawer = inject('toggleDrawer')
const theme = useTheme()

const isDark = ref(theme.global.name.value === 'dark')

const getBreadCrumbs = computed(() => {
  let bc
  if (typeof route.meta.breadCrumb === 'function') {
    bc = route.meta.breadCrumb.call(this, route)
  } else {
    bc = route.meta.breadCrumb
  }
  return bc
})

const loginData = loginDataStore()

function toggleTheme() {
  const newTheme = isDark.value ? 'dark' : 'light'
  theme.global.name.value = newTheme
  localStorage.setItem('theme', newTheme)
}
</script>
