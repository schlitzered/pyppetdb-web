/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
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
        <v-text-field v-model="formData.id" readonly append-inner-icon="mdi-id-card">
          <template v-slot:label>Cert ID</template>
        </v-text-field>
        <v-text-field v-model="formData.cn" readonly>
          <template v-slot:label>Common Name</template>
          <template v-slot:append-inner>
            <v-icon icon="mdi-text" class="me-2"></v-icon>
            <v-btn
              v-if="formData.cn"
              icon="mdi-server"
              variant="text"
              density="compact"
              title="View Node"
              :to="{
                name: 'NodesCRUD',
                params: { node: formData.cn }
              }"
            ></v-btn>
          </template>
        </v-text-field>
        <v-text-field
          v-model="formData.status"
          readonly
          append-inner-icon="mdi-check-circle"
        >
          <template v-slot:label>Status</template>
        </v-text-field>
        <v-text-field
          v-model="formData.not_before"
          readonly
          append-inner-icon="mdi-calendar-clock"
        >
          <template v-slot:label>Not Before</template>
        </v-text-field>
        <v-text-field
          v-model="formData.not_after"
          readonly
          append-inner-icon="mdi-calendar-clock"
        >
          <template v-slot:label>Not After</template>
        </v-text-field>
        <v-textarea
          v-model="formData.certificate"
          readonly
          append-inner-icon="mdi-certificate"
        >
          <template v-slot:label>Certificate (PEM)</template>
        </v-textarea>
        <v-textarea
          v-model="formData.csr"
          readonly
          append-inner-icon="mdi-file-document-edit"
        >
          <template v-slot:label>CSR (PEM)</template>
        </v-textarea>
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
import { PERMISSIONS } from '@/common/permissions'
import { reactive, ref, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { useCrudReload } from '@/common/crud_generic'
import { loginDataStore } from '@/store/login_data'

const route = useRoute()
const loginData = loginDataStore()

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

const formButtonEditShow = computed(() => {
  return loginData.hasPermission(
    PERMISSIONS.CA.SPACES.CERTS.UPDATE(route.params.space_id)
  )
})

function initializeFormState() {
  formDataReadOnly.value = true
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
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

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
