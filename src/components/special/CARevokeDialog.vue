<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="header"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '95vw' }"
  >
    <div class="flex flex-col gap-4">
      <p v-if="message" class="text-sm text-zinc-700 dark:text-zinc-300">
        {{ message }}
      </p>

      <div class="flex flex-col gap-1">
        <label
          for="revocation-reason"
          class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
        >
          Reason
        </label>
        <Select
          v-model="reason"
          input-id="revocation-reason"
          :options="reasons"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="invalidity-date"
          class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
        >
          Invalidity Date (optional)
        </label>
        <DatePicker
          v-model="invalidityDate"
          input-id="invalidity-date"
          show-time
          hour-format="24"
          show-clear
          :max-date="now"
          class="w-full"
        />
        <small class="text-xs text-zinc-500">
          When the key is known or suspected to have become invalid. Must not be
          in the future.
        </small>
        <small v-if="dateInFuture" class="text-xs text-rose-500 font-medium">
          The invalidity date must not be in the future.
        </small>
      </div>

      <div
        v-if="isCompromise"
        data-test="compromise-warning"
        class="flex gap-2 p-3 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-sm"
      >
        <i class="pi pi-exclamation-triangle mt-0.5"></i>
        <span>
          This lists the key as <strong>compromised</strong> and revokes
          <strong>every</strong> certificate issued for that key, in
          <strong>all</strong> spaces. This cannot be undone.
        </span>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        class="p-button-text p-button-secondary"
        @click="visible = false"
      />
      <Button
        label="Revoke"
        icon="pi pi-ban"
        class="bg-rose-600 hover:bg-rose-700 text-white border-none"
        :disabled="!reason || dateInFuture"
        @click="submit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import { CERT_REVOCATION_REASONS } from '@/constants/ca'
import type { FieldOption } from '@/types/resources'

export interface RevokePayload {
  status: 'revoked'
  revocation_reason: string
  invalidity_date?: string
}

const props = withDefaults(
  defineProps<{
    reasons?: FieldOption[]
    header?: string
    message?: string
  }>(),
  {
    reasons: () => CERT_REVOCATION_REASONS,
    header: 'Revoke',
    message: ''
  }
)

const emit = defineEmits<{
  confirm: [payload: RevokePayload]
}>()

const visible = defineModel<boolean>('visible', { default: false })

const reason = ref('unspecified')
const invalidityDate = ref<Date | null>(null)
const now = ref(new Date())

const isCompromise = computed(() => {
  return reason.value === 'key_compromise' || reason.value === 'ca_compromise'
})

const dateInFuture = computed(() => {
  return !!invalidityDate.value && invalidityDate.value > new Date()
})

watch(visible, (open) => {
  if (open) {
    reason.value = props.reasons[0]?.value ?? 'unspecified'
    invalidityDate.value = null
    now.value = new Date()
  }
})

const submit = () => {
  const payload: RevokePayload = {
    status: 'revoked',
    revocation_reason: reason.value
  }
  if (invalidityDate.value) {
    // toISOString is UTC with a 'Z' suffix, which the API accepts as tz-aware
    payload.invalidity_date = invalidityDate.value.toISOString()
  }
  visible.value = false
  emit('confirm', payload)
}

defineExpose({ reason, invalidityDate, submit })
</script>
