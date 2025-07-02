<script setup>
import { onMounted } from 'vue'
import router from '../router/routes'

onMounted(() => {
  setTimeout(() => router.push({ name: 'Login' }), 5000)
})
</script>

<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-alert color="error" title="Invalid Login"
          >Either login expired or invalid Login credentials have been
          provided</v-alert
        >
        <v-card>
          <router-link to="/login">Continue to Login</router-link>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
