<template>
  <v-app>
    <LoginStateCheck />
    <default-view />
  </v-app>
</template>

<script setup>
import LoginStateCheck from "@/components/LoginStateCheck";
import DefaultView from "./View.vue";
</script>
