<template>
  <ComponentDialogWarning
    :msg="dialogDeleteMsg"
    :show="dialogDeleteShow"
    @response="(action) => dialogDeleteEvent(action)"
  />
  <v-card>
    <v-form ref="form">
      <v-card-text>
        <v-text-field
          v-model="formData.id"
          readonly
          append-inner-icon="mdi-account"
          label="Node ID"
        ></v-text-field>
        <v-text-field
          v-model="formData.heartbeat"
          readonly
          append-inner-icon="mdi-heart-pulse"
          label="Heartbeat"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" variant="text" @click="formDelete">Delete</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { useCrudReload } from '@/common/crud_generic'

const route = useRoute()
const router = useRouter()

const dialogDeleteShow = ref(false)
const dialogDeleteMsg = ref('')

function dialogDeleteEvent(action) {
  if (action === 'cancel') {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
  } else {
    dialogDeleteShow.value = false
    dialogDeleteMsg.value = ''
    api.delete(`/api/v1/pyppetdb_nodes/${formData.id}`).then(() => {
      router.push({
        name: 'PyppetdbNodesSearch'
      })
    })
  }
}

const formData = reactive({
  id: '',
  heartbeat: ''
})

function formGetData() {
  api.get(`/api/v1/pyppetdb_nodes/${route.params.node_id}`).then((data) => {
    if (data) {
      formData.id = data.id
      formData.heartbeat = data.heartbeat
    }
  })
}

// Watch for route parameter changes
watch(
  () => route.params.node_id,
  () => {
    formGetData()
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Node: ${formData.id}`
}

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

onMounted(() => {
  formGetData()
})
</script>
