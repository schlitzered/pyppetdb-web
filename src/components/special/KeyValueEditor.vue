<template>
  <div class="flex flex-col gap-2 mt-1">
    <div
      v-for="(row, idx) in rows"
      :key="idx"
      class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
    >
      <InputText
        v-model="row.key"
        :disabled="disabled"
        placeholder="key"
        class="md:col-span-5 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
      />
      <InputText
        v-model="row.value"
        :disabled="disabled"
        placeholder="value"
        class="md:col-span-6 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
      />
      <div class="md:col-span-1 flex justify-end">
        <Button
          type="button"
          icon="pi pi-times"
          class="p-button-text p-button-danger p-button-sm"
          :disabled="disabled"
          @click="emit('remove', idx)"
        />
      </div>
    </div>

    <span v-if="rows.length === 0" class="text-sm text-zinc-400 italic">
      No entries
    </span>

    <div class="flex justify-start">
      <Button
        type="button"
        icon="pi pi-plus"
        label="Add Pair"
        class="p-button-text p-button-sm"
        :disabled="disabled"
        @click="emit('add')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface KeyValueRow {
  key: string
  value: string
}

defineProps<{
  rows: KeyValueRow[]
  disabled: boolean
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>
