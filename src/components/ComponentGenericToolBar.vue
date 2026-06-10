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
    <v-toolbar ref="toolbarRef">
      <v-toolbar-title ref="titleRef">
        {{ navTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Menu shown when overflowing -->
      <div v-if="navItems.length && isOverflowing">
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="(item, index) in navItems"
              :key="index"
              :value="item"
              @click="onBtnClick(item)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Buttons shown when NOT overflowing -->
      <div v-if="navItems.length && !isOverflowing" class="d-flex">
        <div v-for="(item, index) in navItems" :key="index">
          <v-btn
            @click="onBtnClick(item)"
            :to="item.to || item.link"
            class="mx-1"
            >{{ item.title }}
          </v-btn>
        </div>
      </div>

      <v-btn
        ref="reloadRef"
        icon="mdi-reload"
        @click="$emit('reload')"
      ></v-btn>

      <!-- Ghost container for measurement -->
      <div
        ref="ghostRef"
        class="d-flex"
        style="
          visibility: hidden;
          position: absolute;
          white-space: nowrap;
          pointer-events: none;
          right: 0;
        "
      >
        <v-btn
          v-for="(item, index) in navItems"
          :key="'ghost-' + index"
          class="mx-1"
        >
          {{ item.title }}
        </v-btn>
      </div>
    </v-toolbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginDataStore } from '@/store/login_data'

defineEmits(['reload'])

const loginData = loginDataStore()
const route = useRoute()
const router = useRouter()

const toolbarRef = ref(null)
const titleRef = ref(null)
const reloadRef = ref(null)
const ghostRef = ref(null)
const isOverflowing = ref(false)

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

function onBtnClick(item) {
  if (item.to) {
    router.push(item.to)
  } else if (item.link) {
    router.push(item.link)
  }
}

const checkOverflow = () => {
  if (!toolbarRef.value || !ghostRef.value) return

  const toolbarWidth = toolbarRef.value.$el.offsetWidth
  const titleWidth = titleRef.value?.$el?.offsetWidth || 0
  const reloadWidth = reloadRef.value?.$el?.offsetWidth || 48
  const buttonsWidth = ghostRef.value.offsetWidth

  // Buffer for spacing and the 3-dot menu button itself if it were to appear
  const buffer = 100

  if (titleWidth + reloadWidth + buttonsWidth + buffer > toolbarWidth) {
    isOverflowing.value = true
  } else {
    isOverflowing.value = false
  }
}

let resizeObserver = null

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    checkOverflow()
  })
  if (toolbarRef.value) {
    resizeObserver.observe(toolbarRef.value.$el)
  }
  checkOverflow()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(
  () => navItems.value,
  () => {
    nextTick(() => {
      checkOverflow()
    })
  },
  { deep: true }
)

watch(
  () => route.path,
  () => {
    nextTick(() => {
      checkOverflow()
    })
  }
)
</script>
