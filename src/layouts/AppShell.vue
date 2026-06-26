<template>
  <div
    class="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
  >
    <div
      v-if="ui.drawerOpen"
      class="w-64 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-20"
    >
      <div
        class="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800"
      >
        <span
          class="text-xl font-bold text-zinc-800 dark:text-white tracking-wider"
          >PyppetDB</span
        >
        <Button
          icon="pi pi-angle-left"
          class="p-button-rounded p-button-text text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          @click="ui.toggleDrawer"
        />
      </div>
      <div class="flex-grow overflow-y-auto p-4 flex flex-col gap-6">
        <div
          v-for="group in navGroups"
          :key="group.label"
          class="flex flex-col gap-2"
        >
          <span
            @click="toggleGroup(group.label)"
            class="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 flex items-center justify-between cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150"
          >
            {{ group.label }}
            <component
              :is="collapsedGroups[group.label] ? ChevronRight : ChevronDown"
              class="w-3 h-3"
            />
          </span>
          <div v-if="!collapsedGroups[group.label]" class="flex flex-col gap-1">
            <router-link
              v-for="item in group.items"
              :key="item.label"
              :to="item.to"
              active-class="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium"
              class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 no-underline hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <component
                :is="iconMap[item.icon as keyof typeof iconMap]"
                class="w-5 h-5 flex-shrink-0"
              />
              <span class="text-sm">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </div>
      <div
        class="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
      >
        <div
          class="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
          @click="handleUserProfileClick"
        >
          <User class="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          <span
            class="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]"
            >{{ username }}</span
          >
        </div>
        <Button
          icon="pi pi-sign-out"
          class="p-button-rounded p-button-text text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
          @click="handleLogout"
        />
      </div>
    </div>

    <div class="flex-grow flex flex-col h-full min-w-0">
      <header
        class="h-16 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 z-10"
      >
        <div class="flex items-center gap-3">
          <Button
            v-if="!ui.drawerOpen"
            icon="pi pi-bars"
            class="p-button-text text-zinc-600 dark:text-zinc-300"
            @click="ui.toggleDrawer"
          />
          <Breadcrumb
            :model="breadcrumbItems"
            class="bg-transparent p-0 border-none"
          >
            <template #item="{ item }">
              <router-link
                v-if="item.to"
                :to="item.to"
                class="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
              >
                {{ item.label }}
              </router-link>
              <span
                v-else
                class="text-sm text-zinc-400 dark:text-zinc-500 font-medium"
              >
                {{ item.label }}
              </span></template
            >
          </Breadcrumb>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="/docs"
            target="_blank"
            class="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors duration-150 px-2"
            title="FastAPI OpenAPI Docs"
          >
            API Docs
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main class="flex-grow overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Breadcrumb from 'primevue/breadcrumb'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { uiStore } from '@/stores/ui'
import { authStore } from '@/stores/auth'
import { resources } from '@/resources'
import { Users } from '@lucide/vue'
import { User } from '@lucide/vue'
import { Cpu } from '@lucide/vue'
import { Server } from '@lucide/vue'
import { Folder } from '@lucide/vue'
import { FolderKey } from '@lucide/vue'
import { FileText } from '@lucide/vue'
import { ShieldAlert } from '@lucide/vue'
import { Tag } from '@lucide/vue'
import { Key } from '@lucide/vue'
import { Layers } from '@lucide/vue'
import { Database } from '@lucide/vue'
import { FileCode } from '@lucide/vue'
import { FileJson } from '@lucide/vue'
import { Search } from '@lucide/vue'
import { Shield } from '@lucide/vue'
import { Play } from '@lucide/vue'
import { FileCog } from '@lucide/vue'
import { ListCollapse } from '@lucide/vue'
import { ChevronDown } from '@lucide/vue'
import { ChevronRight } from '@lucide/vue'
import type { BreadcrumbItem } from '@/types/resources'

const iconMap = {
  Users,
  User,
  Cpu,
  Server,
  Folder,
  FolderKey,
  FileText,
  ShieldAlert,
  Tag,
  Key,
  Layers,
  Database,
  FileCode,
  FileJson,
  Search,
  Shield,
  Play,
  FileCog,
  ListCollapse
}

const ui = uiStore()
const auth = authStore()
const route = useRoute()
const router = useRouter()

const collapsedGroups = ref<Record<string, boolean>>(
  (() => {
    try {
      const saved = localStorage.getItem('nav_collapsed_groups')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      void error
    }
    return {}
  })()
)

const toggleGroup = (groupLabel: string) => {
  collapsedGroups.value[groupLabel] = !collapsedGroups.value[groupLabel]
  try {
    localStorage.setItem(
      'nav_collapsed_groups',
      JSON.stringify(collapsedGroups.value)
    )
  } catch (error) {
    void error
  }
}

const username = computed(() => auth.getUserDataId || 'Guest')

interface NavItem {
  label: string
  icon: string
  to: Record<string, unknown>
  order: number
}

const navGroups = computed(() => {
  const groups: Record<
    string,
    { label: string; order: number; items: NavItem[] }
  > = {}

  for (const res of Object.values(resources)) {
    if (res.nav) {
      if (res.nav.requireAdmin && !auth.getUserDataIsAdmin) {
        continue
      }
      if (
        res.nav.requiredPermission &&
        !auth.hasPermissionPattern(String(res.nav.requiredPermission))
      ) {
        continue
      }

      const gName = res.nav.group
      if (!groups[gName]) {
        groups[gName] = {
          label: gName,
          order: res.nav.groupOrder,
          items: []
        }
      }
      groups[gName].items.push({
        label: res.nav.label,
        icon: res.nav.icon,
        to: { name: res.routeNames.search },
        order: res.nav.order
      })
    }
  }

  return Object.values(groups)
    .sort((a, b) => a.order - b.order)
    .map((g) => {
      g.items.sort((a, b) => a.order - b.order)
      return g
    })
})

const breadcrumbItems = computed(() => {
  const resource = route.meta.resource as any
  if (resource && resource.breadcrumbs) {
    let crumbs = []
    if (
      route.name === resource.routeNames.search &&
      resource.breadcrumbs.search
    ) {
      crumbs =
        typeof resource.breadcrumbs.search === 'function'
          ? resource.breadcrumbs.search(route)
          : resource.breadcrumbs.search
    } else if (
      route.name === resource.routeNames.crud &&
      resource.breadcrumbs.crud
    ) {
      crumbs =
        typeof resource.breadcrumbs.crud === 'function'
          ? resource.breadcrumbs.crud(route)
          : resource.breadcrumbs.crud
    }
    return crumbs.map((c: any) => ({
      label: c.title,
      to: c.to
    }))
  }
  const crumbs = route.meta.breadCrumb
  const list = typeof crumbs === 'function' ? crumbs(route) : crumbs || []
  return (list as BreadcrumbItem[]).map((c: BreadcrumbItem) => ({
    label: c.title,
    to: c.to
  }))
})

const handleUserProfileClick = () => {
  router.push({
    name: 'UsersCRUD',
    params: { user: '_self' }
  })
}

const handleLogout = () => {
  router.push({ name: 'LoginLogout' })
}
</script>
