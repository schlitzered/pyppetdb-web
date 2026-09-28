<template>
  <MultiSelect
    v-if="usesValueChoices(part) && LIST_OPERATORS.includes(part.operator)"
    :model-value="value ? value.split(',') : []"
    @update:model-value="
      (v: string[]) => {
        value = v.join(',')
        emit('change')
      }
    "
    :options="part.values"
    option-label="label"
    option-value="value"
    filter
    display="chip"
    :virtual-scroller-options="virtualScroller"
    placeholder="Values"
    class="w-full"
  />
  <Select
    v-else-if="usesValueChoices(part)"
    v-model="value"
    :options="part.values"
    option-label="label"
    option-value="value"
    filter
    :virtual-scroller-options="virtualScroller"
    placeholder="Value"
    @change="emit('change')"
    class="w-full p-dropdown-sm"
  />
  <InputText
    v-else
    v-model="value"
    :placeholder="valuePlaceholder(part)"
    @input="emit('change')"
    class="w-full p-inputtext-sm"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import { LIST_OPERATORS } from '@/composables/useFactSuggestions'
import { usesValueChoices } from '@/composables/useFactSuggestions'
import { valuePlaceholder } from '@/composables/useFactSuggestions'
import type { FactFilterPart } from '@/composables/useFactSuggestions'

// the value field of a fact filter: a dropdown / multi-select of the known
// values when the fact's values are known and the operator picks from them,
// free text otherwise. `part` supplies operator/kind/values; the value itself
// is the v-model. Colour classes fall through from the parent.
const value = defineModel<string>({ required: true })

const props = defineProps<{
  part: FactFilterPart
}>()

const emit = defineEmits<{
  change: []
}>()

const virtualScroller = computed(() =>
  (props.part.values?.length ?? 0) > 50 ? { itemSize: 32 } : undefined
)
</script>
