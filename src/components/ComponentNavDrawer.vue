<template>
  <v-navigation-drawer
    v-if="route.name !== 'Login'"
    v-model="drawer"
    :rail="rail"
    permanent
  >
    <template v-slot:prepend>
      <v-list-item>
        <template v-slot:append>
          <v-btn
            icon
            variant="text"
            @click.stop="rail = !rail"
          >
            <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
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

        <v-list-item
          v-for="item in group.items"
          :key="item.to"
          :title="item.name"
          :href="item.href"
          @click.prevent="onBtnClick(item)"
        >
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const router = useRouter()
const drawer = inject('drawer')
const rail = ref(false)
const openedGroups = ref(['Nodes', 'Hiera', 'Administration'])

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
          href: item.meta.appBar.href,
          group: item.meta.appBar.group || 'Other',
          groupOrder: item.meta.appBar.groupOrder || 999,
          order: item.meta.appBar.order || 999
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

function onBtnClick(event) {
  if (event.name !== route.name) {
    router.push({ name: event.to }).catch((err) => {
      console.log(err)
    })
  }
}

function getGroupIcon(groupName) {
  const icons = {
    Nodes: 'mdi-server',
    Hiera: 'mdi-file-tree',
    Administration: 'mdi-cog'
  }
  return icons[groupName] || 'mdi-folder'
}
</script>
