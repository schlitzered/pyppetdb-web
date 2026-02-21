<template>
  <ComponentDialogWarning
    :msg="dialogDeleteMsg"
    :show="dialogDeleteShow"
    @response="(action) => dialogDeleteEvent(action)"
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
          :readonly="formInputIdReadOnly"
          :rules="[() => !!formData.id || 'This field is required']"
          append-inner-icon="mdi-account"
          label="Node Group ID"
        ></v-text-field>
        <v-divider></v-divider>
        <v-autocomplete
          v-model="formData.teams"
          v-model:search="teamsSearch"
          :items="teamsChoices"
          :readonly="formDataReadOnly"
          @input="getTeams"
          :loading="teamsSearchLoading"
          label="Teams"
          chips
          closable-chips
          multiple
        >
        </v-autocomplete>
        <v-divider></v-divider>
        <v-label>Filters</v-label>
        <v-textarea
          v-model="nodeGroupFilterAsString"
          v-if="!formDataReadOnly"
          :readonly="formDataReadOnly"
          :rows="20"
        ></v-textarea>
        <v-data-table
          :items="filterTableData"
          :headers="filterTableHeaders"
          v-if="formDataReadOnly"
        ></v-data-table>
        <v-divider></v-divider>
        <v-card v-if="formDataReadOnly">
          <v-label>Nodes</v-label>
          <template v-slot:text>
            <v-text-field
              v-model="nodesTableSearch"
              label="Search Nodes"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
            ></v-text-field>
          </template>
          <v-data-table
            :items="nodesTableData"
            :search="nodesTableSearch"
          ></v-data-table>
        </v-card>
        <v-divider></v-divider>
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
        <v-btn color="primary" variant="text" @click="formSubmit">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router/dist/vue-router'

import ComponentDialogWarning from '@/components/ComponentDialogWarning.vue'

import api from '@/api/common'
import { apiErrorStore } from '@/store/api_error'
import { loginDataStore } from '@/store/login_data'

const apiError = apiErrorStore()
const loginData = loginDataStore()

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
    let url = `/api/v1/nodes_groups/${formData.id}`
    api.delete(url).then(() => {
      router.push({
        name: 'NodesGroupsSearch'
      })
    })
  }
}

const form = ref(null)
const formData = reactive({})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)

const nodeGroupFilterAsString = ref({})

const filterTableData = ref([])
const filterTableHeaders = ref([
  { title: 'Filter Part Index', key: 'filter_part_index' },
  { title: 'Fact', key: 'fact' },
  { title: 'Values', key: 'values' }
])

const teamsChoices = ref([])
const teamsSearch = ref('')
const teamsSearchLoading = ref(true)

const nodesTableSearch = ref('')
const nodesTableData = ref([])

function initializeFormState() {
  if (route.params.node_group !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
  } else if (route.params.node_group === '_new') {
    formInputIdReadOnly.value = false
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
  } else {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = false
  }
  formGetData()
}

// Initialize on mount
initializeFormState()

// Watch for route parameter changes
watch(() => route.params.node_group, () => {
  initializeFormState()
})

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Team: ${route.params.team}`
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
  let method = 'put'
  let url = `/api/v1/nodes_groups/${formData.id}`
  let _filters = {}

  try {
    _filters = JSON.parse(nodeGroupFilterAsString.value)
  } catch (error) {
    console.error('Invalid JSON format', error)
    alert('Invalid JSON format. Please correct it.')
    return
  }

  let data = {
    teams: formData.teams,
    filters: _filters
  }
  if (route.params.node_group === '_new') {
    method = 'post'
  }
  api.request(method, url, data).then(() => {
    if (route.params.node_group === '_new') {
      formButtonDeleteShow.value = true
      router.push({
        name: 'NodesGroupsCRUD',
        params: { node_group: formData.id }
      })
    } else {
      formDataReadOnly.value = true
      formGetData()
    }
  })
}

function formGetData() {
  if (route.params.node_group === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData['id'] = ''
    formData['filters'] = []
    nodeGroupFilterAsString.value = JSON.stringify([], null, 2)
    formData['teams'] = []
    nodesTableData.value = []
  } else {
    api.get(`/api/v1/nodes_groups/${route.params.node_group}`).then((data) => {
      if (data) {
        formData['id'] = data['id']
        formData['filters'] = data['filters']
        formData['teams'] = data['teams']
        nodeGroupFilterAsString.value = JSON.stringify(data['filters'], null, 2)
        nodesTableData.value = data['nodes'].map((node) => ({
          nodeName: node // Assuming 'node' holds the name or ID
        }))
        filterTableDataFlatten(data['filters'])
      }
    })
  }

  getTeams()
  teamsSearchLoading.value = false
}

function filterTableDataFlatten(filters) {
  filterTableData.value = []
  filters.forEach((filter, filterIndex) => {
    filter.part.forEach((part, partIndex) => {
      filterTableData.value.push({
        filter_part_index: `${filterIndex}/${partIndex}`,
        fact: part.fact,
        values: part.values
      })
    })
  })
}

function getTeams() {
  teamsSearchLoading.value = true
  teamsChoices.value = []
  if (!formData.teams) {
    formData.teams = ''
  }
  api.get(`/api/v1/teams`, { team_id: teamsSearch.value }).then((data) => {
    if (data) {
      data.result.forEach((team) => {
        if (!teamsChoices.value.some((choice) => choice === team.id)) {
          teamsChoices.value.push(team.id)
        }
      })
    }
  })
  teamsSearchLoading.value = false
}
</script>
