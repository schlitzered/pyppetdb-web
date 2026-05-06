/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
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
