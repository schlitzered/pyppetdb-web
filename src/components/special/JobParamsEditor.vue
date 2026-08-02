<template>
  <div class="flex flex-col gap-3 mt-1">
    <div
      v-for="(row, idx) in rows"
      :key="idx"
      class="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 flex flex-col gap-3"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
        <div class="md:col-span-6 flex flex-col gap-1">
          <label class="text-xs font-semibold text-zinc-500">Name</label>
          <InputText
            v-model="row.key"
            :disabled="disabled"
            placeholder="param name"
            class="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
          />
        </div>
        <div class="md:col-span-5 flex flex-col gap-1">
          <label class="text-xs font-semibold text-zinc-500">Type</label>
          <Select
            v-model="row.type"
            :options="TYPES"
            :disabled="disabled"
            class="w-full bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
          />
        </div>
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

      <div v-if="row.type === 'string'" class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-zinc-500"
          >Regex (optional)</label
        >
        <InputText
          v-model="row.regex"
          :disabled="disabled"
          placeholder="^[a-z0-9]+$"
          class="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
        />
      </div>

      <div
        v-else-if="row.type === 'int' || row.type === 'float'"
        class="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-zinc-500"
            >Min (optional)</label
          >
          <InputNumber
            v-model="row.min"
            :disabled="disabled"
            :use-grouping="false"
            :max-fraction-digits="row.type === 'float' ? 12 : 0"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-zinc-500"
            >Max (optional)</label
          >
          <InputNumber
            v-model="row.max"
            :disabled="disabled"
            :use-grouping="false"
            :max-fraction-digits="row.type === 'float' ? 12 : 0"
            class="w-full"
          />
        </div>
      </div>

      <div v-else-if="row.type === 'enum'" class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-zinc-500">Options *</label>
        <div
          v-for="(opt, oIdx) in row.options"
          :key="oIdx"
          class="flex items-center gap-2"
        >
          <InputText
            v-model="row.options[oIdx]"
            :disabled="disabled"
            placeholder="option value"
            class="flex-1 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-mono text-sm"
          />
          <Button
            type="button"
            icon="pi pi-times"
            class="p-button-text p-button-danger p-button-sm"
            :disabled="disabled"
            @click="removeOption(row, oIdx)"
          />
        </div>
        <span
          v-if="row.options.length === 0"
          class="text-xs text-zinc-400 italic"
        >
          No options
        </span>
        <div class="flex justify-start">
          <Button
            type="button"
            icon="pi pi-plus"
            label="Add Option"
            class="p-button-text p-button-sm"
            :disabled="disabled"
            @click="addOption(row)"
          />
        </div>
      </div>

      <div v-else class="text-xs text-zinc-400 italic">
        No validators for boolean values.
      </div>
    </div>

    <span v-if="rows.length === 0" class="text-sm text-zinc-400 italic">
      No parameters
    </span>

    <div class="flex justify-start">
      <Button
        type="button"
        icon="pi pi-plus"
        label="Add Parameter"
        class="p-button-text p-button-sm"
        :disabled="disabled"
        @click="emit('add')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { JobParamRow } from '@/types/jobParams'

const TYPES = ['string', 'int', 'float', 'bool', 'enum']

defineProps<{
  rows: JobParamRow[]
  disabled: boolean
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()

const addOption = (row: JobParamRow) => row.options.push('')
const removeOption = (row: JobParamRow, idx: number) =>
  row.options.splice(idx, 1)
</script>
