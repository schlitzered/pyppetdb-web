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
import { ref, onMounted, watch, computed } from "vue";
import { apiErrorStore } from "@/store/api_error";
import { useRouter } from "vue-router/dist/vue-router";

const router = useRouter();

const apiError = apiErrorStore();
const dialogShow = ref(false);

function resetDialog() {
  dialogShow.value = false;
  let httpStatus = apiError.getDialogHTTPStatus;
  let httpRedirect = apiError.getRedirect;
  if (httpStatus === 404) {
    router.push(httpRedirect);
  }
  apiError.clear();
}

onMounted(() => {
  dialogShow.value = apiError.getDialogShow;
});

watch(
  () => apiError.getDialogShow,
  () => {
    dialogShow.value = apiError.getDialogShow;
  },
);
</script>
