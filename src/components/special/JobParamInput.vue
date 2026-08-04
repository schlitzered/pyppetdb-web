<template>
  <div class="flex flex-col gap-1">
    <Select
      v-if="def.type === 'enum'"
      :id="inputId"
      :model-value="modelValue"
      :options="def.options || []"
      :disabled="disabled"
      placeholder="Select a value"
      class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <ToggleSwitch
      v-else-if="def.type === 'bool'"
      :id="inputId"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <InputNumber
      v-else-if="def.type === 'int' || def.type === 'float'"
      :id="inputId"
      :model-value="modelValue"
      :disabled="disabled"
      :min="def.min ?? undefined"
      :max="def.max ?? undefined"
      :use-grouping="false"
      :max-fraction-digits="def.type === 'float' ? 12 : 0"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <InputText
      v-else
      :id="inputId"
      :model-value="modelValue"
      :disabled="disabled"
      class="w-full p-inputtext-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <small v-if="error" class="text-xs text-rose-500 font-medium">
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import type { JobParamDefinition } from '@/types/jobParams'

// value shape depends on def.type (string | number | boolean); `any` keeps the
// binding to PrimeVue's per-widget modelValue types simple, consistent with the
// rest of the form-data code.
defineProps<{
  modelValue: any
  def: JobParamDefinition
  disabled: boolean
  inputId: string
  error?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>
