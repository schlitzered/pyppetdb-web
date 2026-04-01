<template>
  <ComponentHieraKeyModelsCRUD ref="crudComponent" model-type="dynamic" />
</template>

<script setup>
import { ref } from 'vue'
import ComponentHieraKeyModelsCRUD from './ComponentHieraKeyModelsCRUD.vue'
const crudComponent = ref(null)
defineExpose({ reload: () => crudComponent.value.reload() })
</script>
