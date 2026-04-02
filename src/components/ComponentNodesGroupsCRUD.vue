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
        <v-divider class="mb-4"></v-divider>

        <div v-if="!formDataReadOnly">
          <v-label class="mb-2">Donor Node (for fact suggestions)</v-label>
          <v-autocomplete
            v-model="donorNode"
            :items="donorNodeChoices"
            label="Donor Node"
            :loading="donorNodeLoading"
            @update:search="getDonorNodeChoices"
            @update:model-value="onDonorNodeChange"
            class="mb-4"
            hint="Select a node to get fact suggestions"
            persistent-hint
          >
            <template v-slot:append>
              <v-btn icon="mdi-refresh" @click="pickRandomDonorNode"></v-btn>
            </template>
          </v-autocomplete>
          <v-divider class="mb-4"></v-divider>
        </div>

        <v-label class="mb-2">Teams</v-label>
        <v-autocomplete
          v-model="formData.teams"
          :items="teamsChoices"
          :readonly="formDataReadOnly"
          label="Associated Teams"
          chips
          multiple
          :loading="teamsSearchLoading"
          @update:search="getTeams"
          class="mb-4"
        ></v-autocomplete>

        <v-divider class="mb-4"></v-divider>
        <v-label class="mb-2">Filters (OR connected)</v-label>
        <div v-if="!formDataReadOnly">
          <v-card
            v-for="(filter, filterIndex) in formData.filters"
            :key="filterIndex"
            variant="outlined"
            class="mb-4 pa-4"
          >
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-1 font-weight-bold"
                >Filter #{{ filterIndex + 1 }} (AND parts)</span
              >
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="red"
                @click="removeFilter(filterIndex)"
              ></v-btn>
            </div>

            <div
              v-for="(part, partIndex) in filter.part"
              :key="partIndex"
              class="ml-4 mt-2"
            >
              <v-row align="center">
                <v-col cols="5">
                  <v-combobox
                    v-model="part.fact"
                    label="Fact"
                    :items="donorNodeFactChoices"
                    :rules="[factValidationRule]"
                    @update:search="(val) => onFactSearchUpdate(val, part)"
                    @update:model-value="onFactChange(part)"
                  ></v-combobox>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="part.values"
                    label="Values"
                    :items="getFactValues(part.fact)"
                    :loading="factValuesLoading[part.fact]"
                    multiple
                    chips
                    closable-chips
                  ></v-autocomplete>
                </v-col>
                <v-col cols="1">
                  <v-btn
                    icon="mdi-minus-circle-outline"
                    size="small"
                    variant="text"
                    color="red"
                    @click="removePart(filterIndex, partIndex)"
                    :disabled="filter.part.length <= 1"
                  ></v-btn>
                </v-col>
              </v-row>
            </div>
            <v-btn
              prepend-icon="mdi-plus"
              size="small"
              variant="text"
              color="primary"
              @click="addPart(filterIndex)"
              class="mt-2"
              >Add AND Part</v-btn
            >
          </v-card>
          <v-btn
            prepend-icon="mdi-plus"
            color="primary"
            variant="tonal"
            @click="addFilter"
            >Add OR Filter</v-btn
          >
        </div>

        <div v-if="formDataReadOnly">
          <v-data-table
            :items="filterTableData"
            :headers="filterTableHeaders"
          ></v-data-table>
        </div>

        <v-divider class="my-4"></v-divider>
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
    let url = `/api/v1/nodes_groups/${formData.id}`
    api.delete(url).then(() => {
      router.push({
        name: 'NodesGroupsSearch'
      })
    })
  }
}

const form = ref(null)
const formData = reactive({
  id: '',
  filters: [],
  teams: []
})
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)

const filterTableData = ref([])
const filterTableHeaders = [
  { title: 'Filter #', key: 'filter_index' },
  { title: 'Fact', key: 'fact' },
  { title: 'Values', key: 'values' }
]

const teamsChoices = ref([])
const teamsSearchLoading = ref(false)

const factValues = reactive({})
const factValuesLoading = reactive({})
const factValidity = reactive({})

const donorNode = ref('')
const donorNodeChoices = ref([])
const donorNodeLoading = ref(false)
const donorNodeFactChoices = ref([])

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

initializeFormState()

watch(
  () => route.params.node_group,
  () => {
    initializeFormState()
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Node Group: ${formData.id}`
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

  let data = {
    filters: formData.filters,
    teams: formData.teams
  }

  if (route.params.node_group === '_new') {
    method = 'post'
  }
  api.request(method, url, data).then(() => {
    if (route.params.node_group === '_new') {
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

const { reload } = useCrudReload(formGetData)
defineExpose({ reload })

function formGetData() {
  if (route.params.node_group === '_new') {
    formDataValid.value = false
    nextTick(() => {
      form.value.resetValidation()
    })
    formData.id = ''
    formData.filters = [createNewFilter()]
    formData.teams = []
    nodesTableData.value = []
  } else {
    api.get(`/api/v1/nodes_groups/${route.params.node_group}`).then((data) => {
      if (data) {
        formData.id = data.id
        formData.filters = data.filters || [createNewFilter()]
        formData.teams = data.teams || []
        nodesTableData.value = (data.nodes || []).map((node) => ({
          nodeName: node
        }))
        flattenFiltersForTable(formData.filters)
        formData.filters.forEach((filter) => {
          filter.part.forEach((part) => {
            if (part.fact) fetchFactValues(part.fact)
          })
        })
      }
    })
  }

  getTeams('')
  pickRandomDonorNode()
}

function createNewFilter() {
  return {
    part: [{ fact: '', values: [] }]
  }
}

function addFilter() {
  formData.filters.push(createNewFilter())
}

function removeFilter(index) {
  formData.filters.splice(index, 1)
}

function addPart(filterIndex) {
  formData.filters[filterIndex].part.push({
    fact: '',
    values: []
  })
}

function removePart(filterIndex, partIndex) {
  formData.filters[filterIndex].part.splice(partIndex, 1)
}

function flattenFiltersForTable(filters) {
  filterTableData.value = []
  filters.forEach((filter, filterIndex) => {
    filter.part.forEach((part) => {
      filterTableData.value.push({
        filter_index: filterIndex + 1,
        fact: part.fact,
        values: part.values.join(', ')
      })
    })
  })
}

function getTeams(search) {
  teamsSearchLoading.value = true
  api.get(`/api/v1/teams`, { team_id: search }).then((data) => {
    if (data) {
      data.result.forEach((team) => {
        if (!teamsChoices.value.includes(team.id)) {
          teamsChoices.value.push(team.id)
        }
      })
    }
    teamsSearchLoading.value = false
  })
}

function getDonorNodeChoices(search) {
  donorNodeLoading.value = true
  api.get('/api/v1/nodes', { node_id: search }).then((data) => {
    if (data) {
      data.result.forEach((node) => {
        if (!donorNodeChoices.value.includes(node.id)) {
          donorNodeChoices.value.push(node.id)
        }
      })
    }
    donorNodeLoading.value = false
  })
}

function pickRandomDonorNode() {
  donorNodeLoading.value = true
  api.get('/api/v1/nodes', { limit: 10 }).then((data) => {
    if (data && data.meta && data.meta.result_size > 0) {
      const total = data.meta.result_size
      const randomOffset = Math.floor(Math.random() * total)
      api.get('/api/v1/nodes', { limit: 10, page: randomOffset }).then((data) => {
        if (data && data.result && data.result.length > 0) {
          const node = data.result[0]
          donorNode.value = node.id
          if (!donorNodeChoices.value.includes(node.id)) {
            donorNodeChoices.value.push(node.id)
          }
          onDonorNodeChange()
        }
        donorNodeLoading.value = false
      })
    } else {
      donorNodeLoading.value = false
    }
  })
}

function onDonorNodeChange() {
  if (!donorNode.value) return
  donorNodeLoading.value = true
  api.get(`/api/v1/nodes/${donorNode.value}`).then((data) => {
    if (data && data.facts) {
      const flattened = flattenFacts(data.facts)
      donorNodeFactChoices.value = flattened.map((f) => f.key).sort()
    }
    donorNodeLoading.value = false
  })
}

function flattenFacts(facts, prefix = '') {
  const result = []
  if (facts === null || facts === undefined) return result

  if (Array.isArray(facts)) {
    facts.forEach((item, index) => {
      const key = prefix ? `${prefix}.[${index}]` : `[${index}]`
      if (typeof item === 'object' && item !== null) {
        result.push(...flattenFacts(item, key))
      } else {
        result.push({ key, value: item })
      }
    })
  } else if (typeof facts === 'object') {
    Object.keys(facts).forEach((key) => {
      const value = facts[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null) {
        result.push(...flattenFacts(value, newKey))
      } else {
        result.push({ key: newKey, value })
      }
    })
  } else {
    result.push({ key: prefix || 'root', value: facts })
  }
  return result
}

let factSearchTimer = null

function onFactSearchUpdate(search, part) {
  if (!search) return
  part.fact = search

  clearTimeout(factSearchTimer)
  factSearchTimer = setTimeout(() => {
    fetchFactValues(search)
  }, 500)
}

function onFactChange(part) {
  if (part.fact) {
    fetchFactValues(part.fact)
  }
}

async function fetchFactValues(factId) {
  if (!factId) return

  factValuesLoading[factId] = true
  try {
    const data = await api.get('/api/v1/nodes/_distinct_fact_values', {
      fact_id: factId
    })
    if (data && data.result && data.result.length > 0) {
      const nonStringEntry = data.result.find((v) => typeof v.value !== 'string')
      if (nonStringEntry) {
        factValues[factId] = []
        factValidity[factId] = `type_mismatch:${typeof nonStringEntry.value}`
      } else {
        factValues[factId] = data.result.map((v) => v.value)
        factValidity[factId] = true
      }
    } else {
      factValues[factId] = []
      factValidity[factId] = false
    }
  } catch {
    factValidity[factId] = false
  } finally {
    factValuesLoading[factId] = false
  }
}

function getFactValues(factId) {
  return factValues[factId] || []
}

function factValidationRule(value) {
  if (!value) return 'Fact is required'
  if (factValidity[value] === false) return 'Invalid fact (no values found)'
  if (
    typeof factValidity[value] === 'string' &&
    factValidity[value].startsWith('type_mismatch:')
  ) {
    const foundType = factValidity[value].split(':')[1]
    return `Only strings are allowed, but type ${foundType} was found`
  }
  return true
}
</script>