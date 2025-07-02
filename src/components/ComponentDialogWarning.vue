<template>
  <div class="text-center">
    <v-dialog v-model="dialogShow" persistent width="auto">
      <v-card>
        <v-card-text>
          {{ msg || 'msg prop missing' }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialogEvent('cancel')">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="dialogEvent('continue')">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const dialogShow = ref(false)

const emit = defineEmits(['response'])
const props = defineProps({
  show: Boolean,
  msg: String
})

function dialogEvent(action) {
  emit('response', action)
}

watch(
  () => props.show,
  () => {
    dialogShow.value = props.show
  }
)
</script>
