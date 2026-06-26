<template>
  <Dialog
    v-model:visible="errorStore.dialogShow"
    modal
    header="System Error"
    :style="{ width: '30vw' }"
  >
    <div class="flex flex-col gap-3 py-4">
      <div
        v-if="errorStore.dialogHTTPStatus"
        class="font-bold text-rose-500 text-lg"
      >
        HTTP {{ errorStore.dialogHTTPStatus }}
      </div>
      <div
        class="bg-zinc-950 p-3 rounded border border-zinc-800 text-zinc-300 font-mono text-sm max-h-60 overflow-y-auto"
      >
        {{ errorMessage }}
      </div>
    </div>
    <template #footer>
      <Button
        label="Close"
        @click="handleClose"
        class="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 px-4 py-2"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { apiErrorStore } from '@/stores/apiError'

const errorStore = apiErrorStore()
const router = useRouter()

const errorMessage = computed(() => {
  const err = errorStore.dialogError
  if (!err) return 'An unexpected error occurred.'
  if (typeof err === 'string') return err
  return JSON.stringify(err, null, 2)
})

const handleClose = () => {
  const redirect = errorStore.redirect
  errorStore.clear()
  if (redirect) {
    router.push(redirect)
  }
}
</script>
