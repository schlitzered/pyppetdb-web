<template>
  <v-app-bar
    v-if="route.name !== 'Login'"
    app
    efixed
    dark
    elevation="10"
    extension-height="64"
  >
    <v-breadcrumbs :items="getBreadCrumbs"> </v-breadcrumbs>
    <v-app-bar-title></v-app-bar-title>
    <div v-for="item in navItems">
      <v-btn @click="onBtnClick(item)" :link="item.href"
        >{{ item.name }}
      </v-btn>
    </div>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()

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

const navItems = computed(() => {
  let items = []
  let user_is_admin = loginData.getUserDataIsAdmin
  router.getRoutes().forEach((item) => {
    if (item.meta.appBar) {
      if (
        (item.meta.appBar.requireAdmin && user_is_admin) ||
        !item.meta.appBar.requireAdmin
      ) {
        items.push({
          name: item.meta.appBar.name,
          to: item.meta.appBar.to,
          icon: item.meta.appBar.icon,
          href: item.meta.appBar.href
        })
      }
    }
  })
  return items
})

function onBtnClick(event) {
  if (event.name !== route.name) {
    router.push({ name: event.to }).catch((err) => {
      console.log(err)
    })
  }
}
</script>
