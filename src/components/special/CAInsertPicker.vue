<template>
  <Select
    :model-value="null"
    :options="options"
    :disabled="disabled || options.length === 0"
    :placeholder="options.length ? placeholder : emptyPlaceholder"
    class="w-full md:w-52 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
    @update:model-value="onSelect"
  />
</template>

<script setup lang="ts">
import Select from 'primevue/select'

withDefaults(
  defineProps<{
    options: string[]
    placeholder?: string
    emptyPlaceholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Insert…',
    emptyPlaceholder: 'None available'
  }
)

const emit = defineEmits<{
  insert: [value: string]
}>()

// model-value is pinned to null so the control resets after each pick and only
// ever acts as an "insert" trigger, never as a bound value.
const onSelect = (value: string | null) => {
  if (value) {
    emit('insert', value)
  }
}
</script>
