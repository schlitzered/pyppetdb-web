/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <v-navigation-drawer
    v-if="!route.meta.hideNav"
    v-model="drawer"
    :rail="rail"
    permanent
  >
    <template v-slot:prepend>
      <v-list-item>
        <template v-slot:append>
          <v-btn icon variant="text" @click.stop="rail = !rail">
            <v-icon>{{
              rail ? 'mdi-chevron-right' : 'mdi-chevron-left'
            }}</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </template>

    <v-list v-model:opened="openedGroups">
      <v-list-group
        v-for="group in groupedNavItems"
        :key="group.name"
        :value="group.name"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="getGroupIcon(group.name)"
            :title="group.name"
          ></v-list-item>
        </template>

        <v-list-item v-for="item in group.items" :key="item.to">
          <router-link v-if="item.to" :to="{ name: item.to }" class="nav-link">
            {{ item.name }}
          </router-link>
          <a v-else-if="item.href" :href="item.href" class="nav-link">
            {{ item.name }}
          </a>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()
const drawer = inject('drawer')
const rail = ref(false)
const openedGroups = ref(['Nodes', 'Hiera', 'Jobs', 'Administration', 'CA'])

const loginData = loginDataStore()

const navItems = computed(() => {
  let items = []
  router.getRoutes().forEach((item) => {
    if (item.meta && item.meta.appBar) {
      const appBar = item.meta.appBar
      const user_is_admin = loginData.getUserDataIsAdmin
      const hasAdmin =
        (appBar.requireAdmin && user_is_admin) || !appBar.requireAdmin
      const hasPerm =
        !appBar.requiredPermission ||
        loginData.hasPermission(appBar.requiredPermission)

      if (hasAdmin && hasPerm) {
        items.push({
          name: appBar.name,
          to: appBar.to || item.name,
          icon: appBar.icon,
          href: appBar.href,
          group: appBar.group || 'Other',
          groupOrder: appBar.groupOrder ?? 999,
          order: appBar.order ?? 999
        })
      }
    }
  })
  return items
})

const groupedNavItems = computed(() => {
  const items = navItems.value
  const groups = {}

  // Group items by their group property and sort items within each group
  items.forEach((item) => {
    const groupName = item.group
    if (!groups[groupName]) {
      groups[groupName] = {
        items: [],
        groupOrder: item.groupOrder
      }
    }
    groups[groupName].items.push(item)
  })

  // Sort items within each group by order
  Object.keys(groups).forEach((groupName) => {
    groups[groupName].items.sort((a, b) => a.order - b.order)
  })

  // Convert groups to array and sort by groupOrder
  const result = Object.keys(groups)
    .map((groupName) => ({
      name: groupName,
      items: groups[groupName].items,
      groupOrder: groups[groupName].groupOrder
    }))
    .sort((a, b) => a.groupOrder - b.groupOrder)

  return result
})

function getGroupIcon(groupName) {
  const icons = {
    Nodes: 'mdi-server',
    Hiera: 'mdi-file-tree',
    Jobs: 'mdi-play-network',
    Administration: 'mdi-cog',
    CA: 'mdi-shield-account',
    System: 'mdi-tune'
  }
  return icons[groupName] || 'mdi-folder'
}
</script>
