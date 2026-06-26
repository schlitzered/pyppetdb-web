<template>
  <div>
    <ResourceTable :resource-def="nodesDef" />
  </div>
</template>

<script setup lang="ts">
import ResourceTable from '@/components/generic/ResourceTable.vue'
import { resources } from '@/resources'

const nodesDef = resources.nodes
</script>
