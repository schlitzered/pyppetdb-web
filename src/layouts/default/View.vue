<template>
  <ApiError />
  <AppBar />
  <v-main>
    <router-view />
  </v-main>
  <v-footer app border>PyppetDB Frontend</v-footer>
</template>

<script setup>
import AppBar from "@/components/AppBar";
import ApiError from "@/components/ApiError";
</script>
