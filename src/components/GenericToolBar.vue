<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ navTitle }}
      </v-toolbar-title>
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
      <div v-for="item in navItems">
        <v-btn @click="onBtnClick(item)" :to="item.link"
          >{{ item.title }}
        </v-btn>
      </div>
    </v-toolbar>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router/dist/vue-router";
import { loginDataStore } from "@/store/login_data";

const loginData = loginDataStore();
const route = useRoute();
const router = useRouter();

const navItems = computed(() => {
  let items = [];
  let user_is_admin = loginData.getUserDataIsAdmin;
  if (route.meta.toolBar) {
    route.meta.toolBar.call(this, route).items.forEach((item) => {
      if (item.hide.call(this, route)) {
        return;
      }
      if ((item.requireAdmin && user_is_admin) || !item.requireAdmin) {
        items.push({
          title: item.title,
          link: item.link,
          to: item.to,
        });
      }
    });
  }
  return items;
});

const navTitle = computed(() => {
  if (route.meta.toolBar) {
    return route.meta.toolBar.call(this, route).title;
  }
});

function onBtnClick(event) {
  if (event.name !== route.name) {
    router.push(event.to);
  }
}
</script>
