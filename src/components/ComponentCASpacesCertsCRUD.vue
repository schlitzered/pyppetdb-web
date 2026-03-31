<template>
  <ComponentDialogWarning
    :msg="dialogWarningMsg"
    :show="dialogWarningShow"
    @response="(action) => dialogWarningEvent(action)"
  />
  <v-card>
    <v-form ref="form" v-model="formDataValid">
      <v-card-text>
        <v-switch
          v-model="formDataReadOnly"
          v-if="formButtonEditShow"
          :true-value="false"
          :false-value="true"
          label="Modify"
        ></v-switch>
        <v-text-field
          v-model="formData.id"
          readonly
          append-inner-icon="mdi-id-card"
          label="Cert ID"
        ></v-text-field>
        <v-text-field
          v-model="formData.cn"
          readonly
          append-inner-icon="mdi-text"
          label="Common Name"
        ></v-text-field>
        <v-text-field
          v-model="formData.status"
          readonly
          append-inner-icon="mdi-check-circle"
          label="Status"
        ></v-text-field>
        <v-text-field
          v-model="formData.not_before"
          readonly
          append-inner-icon="mdi-calendar-clock"
          label="Not Before"
        ></v-text-field>
        <v-text-field
          v-model="formData.not_after"
          readonly
          append-inner-icon="mdi-calendar-clock"
          label="Not After"
        ></v-text-field>
        <v-textarea
          v-model="formData.certificate"
          readonly
          append-inner-icon="mdi-certificate"
          label="Certificate (PEM)"
        ></v-textarea>
        <v-textarea
          v-model="formData.csr"
          readonly
          append-inner-icon="mdi-file-document-edit"
          label="CSR (PEM)"
        ></v-textarea>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="formData.status === 'requested'"
          color="success"
          variant="text"
          @click="certAction('signed')"
          >Sign
        </v-btn>
        <v-btn
          v-if="formData.status === 'signed'"
          color="red"
          variant="text"
          @click="certAction('revoked')"
          >Revoke
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'

const route = useRoute()

const dialogWarningShow = ref(false)
const dialogWarningMsg = ref('')
const pendingAction = ref('')

function dialogWarningEvent(action) {
  if (action === 'cancel') {
    dialogWarningShow.value = false
    dialogWarningMsg.value = ''
    pendingAction.value = ''
  } else {
    dialogWarningShow.value = false
    dialogWarningMsg.value = ''
    let url = `/api/v1/ca/spaces/${route.params.space_id}/certs/${formData.id}`
    api.put(url, { status: pendingAction.value }).then(() => {
      formGetData()
    })
  }
}

function certAction(action) {
  pendingAction.value = action
  dialogWarningShow.value = true
  dialogWarningMsg.value = `Are you sure you want to ${action} certificate: ${formData.id}?`
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonEditShow = ref(true)

function initializeFormState() {
  formDataReadOnly.value = true
  formButtonEditShow.value = true
  formGetData()
}

initializeFormState()

watch(
  () => route.params.cert_id,
  () => {
    initializeFormState()
  }
)

function formReset(event) {
  event.preventDefault()
  formGetData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formGetData() {
  api
    .get(
      `/api/v1/ca/spaces/${route.params.space_id}/certs/${route.params.cert_id}`
    )
    .then((data) => {
      if (data) {
        Object.assign(formData, data)
      }
    })
}
</script>
