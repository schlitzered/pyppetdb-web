/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ navTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-reload" @click="$emit('reload')"></v-btn>
      <div v-if="navItems.length">
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="(item, index) in navItems"
              :key="index"
              :value="item"
            >
              <v-list-item-title @click="onBtnClick(item)">{{
                item.title
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-for="(item, index) in navItems" :key="index">
        <v-btn @click="onBtnClick(item)" :to="item.to || item.link"
          >{{ item.title }}
        </v-btn>
      </div>
    </v-toolbar>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginDataStore } from '@/store/login_data'

defineEmits(['reload'])

const loginData = loginDataStore()
const route = useRoute()
const router = useRouter()

const navItems = computed(() => {
  let items = []
  const user_is_admin = loginData.getUserDataIsAdmin
  if (route.meta.toolBar) {
    const toolBarInfo =
      typeof route.meta.toolBar === 'function'
        ? route.meta.toolBar(route)
        : route.meta.toolBar

    toolBarInfo.items.forEach((item) => {
      if (item.hide?.call(this, route)) {
        return
      }
      if ((item.requireAdmin && user_is_admin) || !item.requireAdmin) {
        items.push({
          title: item.title,
          link: item.link,
          to: item.to
        })
      }
    })
  }
  return items
})

const navTitle = computed(() => {
  if (route.meta.toolBar) {
    const toolBarInfo =
      typeof route.meta.toolBar === 'function'
        ? route.meta.toolBar(route)
        : route.meta.toolBar
    return toolBarInfo.title
  } else {
    return ''
  }
})

function onBtnClick(event) {
  if (event.name !== route.name) {
    router.push(event.to)
  }
}
</script>
