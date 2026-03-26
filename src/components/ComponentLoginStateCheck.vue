<template><div></div></template>
<script setup>
import api from '@/api/common'
import { loginDataStore } from '@/store/login_data'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'

const loginData = loginDataStore()
const route = useRoute()
const intervalId = ref(null)

function upDateUserData() {
  api.get('/api/v1/users/_self').then((data) => {
    if (data) {
      loginData.setUserData(data)
    }
  })
}

onMounted(async () => {
  if (!route.name.startsWith('Login')) {
    upDateUserData()
  } else {
    loginData.resetTimestamp()
    loginData.resetUserData()
  }
  intervalId.value = setInterval(() => {
    if (!route.name.startsWith('Login')) {
      if (loginData.isTimestampOlderThan(60)) {
        loginData.setTimestamp()
        upDateUserData()
      }
    }
  }, 60000) // check every 60 seconds
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>
