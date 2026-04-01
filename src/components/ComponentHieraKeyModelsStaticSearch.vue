<template>
  <ComponentHieraKeyModelsSearch ref="searchComponent" model-type="static" />
</template>

<script setup>
import { ref } from 'vue'
import ComponentHieraKeyModelsSearch from './ComponentHieraKeyModelsSearch.vue'
const searchComponent = ref(null)
defineExpose({ reload: () => searchComponent.value.reload() })
</script>
