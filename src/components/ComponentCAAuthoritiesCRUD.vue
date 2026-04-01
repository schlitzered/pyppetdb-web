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

        <v-select
          v-if="route.params.ca_id === '_new'"
          v-model="caCreationMode"
          :items="caCreationModes"
          label="Creation Mode"
          item-title="title"
          item-value="value"
          prepend-inner-icon="mdi-cog-outline"
        ></v-select>

        <v-text-field
          v-model="formData.id"
          :readonly="route.params.ca_id !== '_new'"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-id-card"
          label="Authority ID"
        ></v-text-field>

        <v-autocomplete
          v-if="
            route.params.ca_id === '_new' && caCreationMode === 'internal_sub'
          "
          v-model="formData.parent_id"
          :readonly="formDataReadOnly"
          :items="caChoices"
          :loading="caChoicesLoading"
          append-inner-icon="mdi-file-tree"
          label="Parent ID"
          clearable
        ></v-autocomplete>

        <v-text-field
          v-model="formData.cn"
          :readonly="route.params.ca_id !== '_new' || formDataReadOnly"
          :rules="[
            () =>
              caCreationMode === 'external' ||
              !!formData.cn ||
              'This field is required'
          ]"
          append-inner-icon="mdi-text"
          label="Common Name"
          v-if="caCreationMode !== 'external'"
        ></v-text-field>

        <template
          v-if="caCreationMode !== 'external' && route.params.ca_id === '_new'"
        >
          <v-text-field
            v-model="formData.organization"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-office-building"
            label="Organization"
          ></v-text-field>
          <v-text-field
            v-model="formData.organizational_unit"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-account-group"
            label="Organizational Unit"
          ></v-text-field>
          <v-text-field
            v-model="formData.country"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-flag"
            label="Country"
          ></v-text-field>
          <v-text-field
            v-model="formData.state"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-map-marker"
            label="State"
          ></v-text-field>
          <v-text-field
            v-model="formData.locality"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-city"
            label="Locality"
          ></v-text-field>
          <v-text-field
            v-model.number="formData.validity_days"
            :readonly="formDataReadOnly"
            type="number"
            append-inner-icon="mdi-calendar-range"
            label="Validity Days"
          ></v-text-field>
        </template>

        <template v-if="route.params.ca_id !== '_new'">
          <v-text-field
            v-model="formData.issuer"
            readonly
            append-inner-icon="mdi-account-tie"
            label="Issuer"
          ></v-text-field>
          <v-text-field
            v-model="formData.serial_number"
            readonly
            append-inner-icon="mdi-numeric"
            label="Serial Number"
          ></v-text-field>
          <v-text-field
            v-model="formData.not_before"
            readonly
            append-inner-icon="mdi-calendar-start"
            label="Not Before"
          ></v-text-field>
          <v-text-field
            v-model="formData.not_after"
            readonly
            append-inner-icon="mdi-calendar-end"
            label="Not After"
          ></v-text-field>
        </template>

        <v-textarea
          v-model="formData.certificate"
          :readonly="route.params.ca_id !== '_new' || formDataReadOnly"
          append-inner-icon="mdi-certificate"
          label="Certificate (PEM)"
          v-if="route.params.ca_id !== '_new' || caCreationMode === 'external'"
          :rules="[
            () =>
              caCreationMode !== 'external' ||
              !!formData.certificate ||
              'This field is required'
          ]"
        ></v-textarea>

        <v-textarea
          v-model="formData.private_key"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-key"
          label="Private Key (PEM)"
          v-if="route.params.ca_id === '_new' && caCreationMode === 'external'"
          :rules="[
            () =>
              caCreationMode !== 'external' ||
              !!formData.private_key ||
              'This field is required'
          ]"
        ></v-textarea>

        <v-textarea
          v-model="formData.external_chain_raw"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-link-variant"
          label="External Chain (PEM, one or more certs)"
          v-if="route.params.ca_id === '_new' && caCreationMode === 'external'"
          hint="Paste one or more certificates in PEM format"
          persistent-hint
        ></v-textarea>

        <v-text-field
          v-model="formData.status"
          readonly
          v-if="route.params.ca_id !== '_new'"
          append-inner-icon="mdi-check-circle"
          label="Status"
        ></v-text-field>

        <v-divider
          v-if="route.params.ca_id !== '_new' && formData.crl"
          class="my-4"
        ></v-divider>
        <template v-if="route.params.ca_id !== '_new' && formData.crl">
          <v-text-field
            v-model="formData.crl.generation"
            readonly
            append-inner-icon="mdi-counter"
            label="CRL Generation"
          ></v-text-field>
          <v-text-field
            v-model="formData.crl.updated_at"
            readonly
            append-inner-icon="mdi-calendar-clock"
            label="CRL Updated At"
          ></v-text-field>
          <v-text-field
            v-model="formData.crl.next_update"
            readonly
            append-inner-icon="mdi-calendar-clock"
            label="CRL Next Update"
          ></v-text-field>
        </template>

        <v-divider
          v-if="route.params.ca_id !== '_new'"
          class="my-4"
        ></v-divider>
        <div v-if="route.params.ca_id !== '_new'" class="d-flex flex-wrap ga-2">
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            size="small"
            @click="downloadCert"
            v-if="formData.certificate"
          >
            Certificate
          </v-btn>
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            size="small"
            @click="downloadCRL"
            v-if="formData.crl && formData.crl.crl_pem"
          >
            CRL
          </v-btn>
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            size="small"
            @click="downloadChain"
            v-if="formData.chain && formData.chain.length > 0"
          >
            Chain
          </v-btn>
        </div>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="formButtonDeleteShow"
          color="red"
          variant="text"
          @click="formDelete"
          >Delete
        </v-btn>
        <v-btn
          v-if="formButtonDeleteShow && formData.status !== 'revoked'"
          color="orange"
          variant="text"
          @click="formRevoke"
          >Revoke
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="formSubmit"
          v-if="route.params.ca_id === '_new'"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrudReload } from '@/common/crud_generic'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'

const route = useRoute()
const router = useRouter()

const dialogWarningShow = ref(false)
const dialogWarningMsg = ref('')
const pendingAction = ref('')

const caCreationMode = ref('internal_root')
const caCreationModes = [
  { title: 'Internal Root CA', value: 'internal_root' },
  { title: 'Internal Subordinate CA', value: 'internal_sub' },
  { title: 'External CA', value: 'external' }
]

function dialogWarningEvent(action) {
  if (action === 'cancel') {
    dialogWarningShow.value = false
    dialogWarningMsg.value = ''
    pendingAction.value = ''
  } else {
    dialogWarningShow.value = false
    dialogWarningMsg.value = ''
    if (pendingAction.value === 'revoke') {
      let url = `/api/v1/ca/authorities/${formData.id}`
      api.put(url, { status: 'revoked' }).then(() => {
        formGetData()
      })
    } else if (pendingAction.value === 'delete') {
      let url = `/api/v1/ca/authorities/${formData.id}`
      api.delete(url).then(() => {
        router.push({ name: 'CAAuthoritiesSearch' })
      })
    }
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)

const caChoices = ref([])
const caChoicesLoading = ref(false)

function getCAChoices() {
  caChoicesLoading.value = true
  api
    .get('/api/v1/ca/authorities', { limit: 1000, fields: ['id'] })
    .then((data) => {
      if (data && data.result) {
        caChoices.value = data.result.map((ca) => ca.id)
      }
      caChoicesLoading.value = false
    })
}

function initializeFormState() {
  if (route.params.ca_id !== '_new') {
    formDataReadOnly.value = true
    formButtonEditShow.value = true
    formButtonDeleteShow.value = true
  } else {
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
    getCAChoices()
  }
  formGetData()
}

initializeFormState()

watch(
  () => route.params.ca_id,
  () => {
    initializeFormState()
  }
)

function formRevoke() {
  pendingAction.value = 'revoke'
  dialogWarningShow.value = true
  dialogWarningMsg.value = `Are you sure you want to revoke CA Authority: ${route.params.ca_id}`
}

function formDelete() {
  pendingAction.value = 'delete'
  dialogWarningShow.value = true
  dialogWarningMsg.value = `Are you sure you want to DELETE CA Authority: ${route.params.ca_id}`
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

function downloadCert() {
  downloadFile(
    formData.certificate,
    `${formData.id}_cert.pem`,
    'application/x-pem-file'
  )
}

function downloadCRL() {
  downloadFile(
    formData.crl.crl_pem,
    `${formData.id}_crl.pem`,
    'application/x-pem-file'
  )
}

function downloadChain() {
  downloadFile(
    formData.chain.join('\n'),
    `${formData.id}_chain.pem`,
    'application/x-pem-file'
  )
}

function formReset(event) {
  event.preventDefault()
  formGetData()
  formDataValid.value = false
  nextTick(() => {
    form.value.resetValidation()
  })
}

function formSubmit(event) {
  event.preventDefault()
  let url = `/api/v1/ca/authorities/${formData.id}`
  let data = {
    parent_id:
      caCreationMode.value === 'internal_sub' ? formData.parent_id : null,
    cn: caCreationMode.value === 'external' ? null : formData.cn,
    organization:
      caCreationMode.value === 'external' ? null : formData.organization,
    organizational_unit:
      caCreationMode.value === 'external' ? null : formData.organizational_unit,
    country: caCreationMode.value === 'external' ? null : formData.country,
    state: caCreationMode.value === 'external' ? null : formData.state,
    locality: caCreationMode.value === 'external' ? null : formData.locality,
    validity_days:
      caCreationMode.value === 'external' ? null : formData.validity_days,
    certificate:
      caCreationMode.value === 'external' ? formData.certificate : null,
    private_key:
      caCreationMode.value === 'external' ? formData.private_key : null,
    external_chain:
      caCreationMode.value === 'external' && formData.external_chain_raw
        ? formData.external_chain_raw
            .split('-----END CERTIFICATE-----')
            .filter((c) => c.trim())
            .map((c) => c + '-----END CERTIFICATE-----')
        : null
  }
  api.post(url, data).then((response) => {
    if (response && response.id) {
      router.push({
        name: 'CAAuthoritiesCRUD',
        params: { ca_id: response.id }
      })
    }
  })
}

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

function formGetData() {
  if (route.params.ca_id === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['parent_id'] = ''
    formData['cn'] = ''
    formData['organization'] = 'PyppetDB'
    formData['organizational_unit'] = 'CA'
    formData['country'] = 'DE'
    formData['state'] = 'Hessen'
    formData['locality'] = ''
    formData['validity_days'] = 3650
    formData['certificate'] = ''
    formData['private_key'] = ''
    formData['external_chain_raw'] = ''
    formData['status'] = 'active'
    formData['crl'] = null
    formData['chain'] = []
  } else {
    api.get(`/api/v1/ca/authorities/${route.params.ca_id}`).then((data) => {
      if (data) {
        Object.assign(formData, data)
      }
    })
  }
}
</script>
