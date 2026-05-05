/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="text-center">
    <v-dialog v-model="dialogShow" persistent width="auto">
      <v-card>
        <v-card-text>
          Got HTTP {{ apiError.getDialogHTTPStatus }} error
        </v-card-text>
        <v-card-text>
          {{ apiError.getDialogError }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="resetDialog">Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { apiErrorStore } from '@/store/api_error'
import { useRouter } from 'vue-router'

const router = useRouter()

const apiError = apiErrorStore()
const dialogShow = ref(false)

function resetDialog() {
  dialogShow.value = false
  let httpStatus = apiError.getDialogHTTPStatus
  let httpRedirect = apiError.getRedirect
  if (httpStatus === 404) {
    router.push(httpRedirect)
  }
  apiError.clear()
}

onMounted(() => {
  dialogShow.value = apiError.getDialogShow
})

watch(
  () => apiError.getDialogShow,
  () => {
    dialogShow.value = apiError.getDialogShow
  }
)
</script>
