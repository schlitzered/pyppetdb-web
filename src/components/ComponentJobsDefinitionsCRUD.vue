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
          label="Job Definition ID"
        ></v-text-field>

        <!-- WYSIWYG Token Editor for Executable -->
        <div class="mb-4">
           <v-combobox
             v-if="!formDataReadOnly"
             v-model="executableTokens"
             v-model:search="executableInput"
             label="Executable & Arguments"
             :placeholder="placeholderExecutable"
             multiple
             chips
             closable-chips
             :error-messages="executableError"
             @keydown="handleExecutableKeyDown"
             hint="Each chip is a single argument. Security: & | ; are forbidden."
             persistent-hint
           >
             <template v-slot:selection="{ item, index }">
               <v-chip color="primary" variant="flat" size="small" closable @click:close="executableTokens.splice(index, 1)">
                 {{ item.title }}
               </v-chip>
             </template>
           </v-combobox>
           <div v-else>
             <v-label class="text-subtitle-2">Executable & Arguments</v-label>
             <div class="pa-2 border rounded bg-grey-lighten-4 min-height-48 d-flex flex-wrap align-center">
               <v-chip
                 v-for="(token, idx) in executableTokens"
                 :key="idx"
                 size="small"
                 color="primary"
                 variant="outlined"
                 class="ma-1"
               >
                 {{ token }}
               </v-chip>
               <span v-if="executableTokens.length === 0" class="text-caption text-grey ml-2">No executable defined</span>
             </div>
           </div>
        </div>

        <v-text-field
          v-model="formData.user"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.user || 'This field is required']"
          append-inner-icon="mdi-account"
          label="User"
        ></v-text-field>
        <v-text-field
          v-model="formData.group"
          :readonly="formDataReadOnly"
          :rules="[() => !!formData.group || 'This field is required']"
          append-inner-icon="mdi-account-group"
          label="Group"
        ></v-text-field>

        <v-textarea
          v-model="paramsTemplateUIString"
          :readonly="formDataReadOnly"
          append-inner-icon="mdi-format-text"
          label="Params Template"
          :placeholder="placeholderParams"
          hint="Use {VAR_NAME} to define parameters. Spaces will be used to tokenize the command."
          persistent-hint
        ></v-textarea>

        <v-divider class="my-4"></v-divider>
        <v-list-subheader>Parameters (Synced from Template)</v-list-subheader>
        <div v-if="!Object.keys(formData.params).length" class="text-caption pa-2">
          No parameters found in template. Add placeholders like {VAR} to create them.
        </div>
        <div v-for="(param, name) in formData.params" :key="'param-' + name" class="pa-2 border rounded mb-2">
          <v-row align="center">
            <v-col cols="3">
              <v-text-field
                v-model="param._temp_name"
                label="Name"
                readonly
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="param.type"
                :items="['string', 'float', 'bool', 'int', 'enum']"
                label="Type"
                :readonly="formDataReadOnly"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="7">
              <v-row v-if="param.type === 'enum'">
                <v-col>
                  <v-combobox
                    v-model="param.options"
                    label="Options"
                    multiple
                    chips
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row v-else-if="param.type === 'string'">
                <v-col>
                  <v-text-field
                    v-model="param.regex"
                    label="Regex"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-else-if="param.type === 'int' || param.type === 'float'">
                <v-col cols="6">
                  <v-text-field
                    v-model.number="param.min"
                    label="Min"
                    type="number"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="param.max"
                    label="Max"
                    type="number"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4"></v-divider>
        <v-list-subheader>Environment Variables</v-list-subheader>
        <v-btn
          v-if="!formDataReadOnly"
          color="primary"
          size="small"
          class="mb-2"
          @click="addParam('environment_variables')"
        >
          Add Env Var
        </v-btn>
        <div v-for="(param, name) in formData.environment_variables" :key="'env-' + name" class="pa-2 border rounded mb-2">
          <v-row align="center">
            <v-col cols="3">
              <v-text-field
                v-model="param._temp_name"
                label="Name"
                :readonly="formDataReadOnly"
                @blur="renameParam('environment_variables', name, param._temp_name)"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="param.type"
                :items="['string', 'float', 'bool', 'int', 'enum']"
                label="Type"
                :readonly="formDataReadOnly"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="6">
               <v-row v-if="param.type === 'enum'">
                <v-col>
                  <v-combobox
                    v-model="param.options"
                    label="Options"
                    multiple
                    chips
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row v-else-if="param.type === 'string'">
                <v-col>
                  <v-text-field
                    v-model="param.regex"
                    label="Regex"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-else-if="param.type === 'int' || param.type === 'float'">
                <v-col cols="6">
                  <v-text-field
                    v-model.number="param.min"
                    label="Min"
                    type="number"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="param.max"
                    label="Max"
                    type="number"
                    :readonly="formDataReadOnly"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1">
              <v-btn
                v-if="!formDataReadOnly"
                icon="mdi-delete"
                color="red"
                size="small"
                @click="removeParam('environment_variables', name)"
              ></v-btn>
            </v-col>
          </v-row>
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

// Hilfsfunktionen für das Mapping (Array <-> String mit Komma-Escaping)
function stringToTokens(str) {
  if (!str) return []
  const result = []
  let current = ''
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\\' && i + 1 < str.length && str[i+1] === ',') {
      current += ','
      i++
    } else if (str[i] === ',') {
      result.push(current)
      current = ''
    } else {
      current += str[i]
    }
  }
  result.push(current)
  return result.filter(t => t.length > 0)
}

function tokensToString(arr) {
  return arr.map(t => t.replace(/,/g, '\\,')).join(',')
}

const form = ref(null)
const formData = reactive({
  id: '',
  executable: '',
  user: '',
  group: '',
  params_template: [],
  params: {},
  environment_variables: {}
})

const paramsTemplateUIString = ref('')

function splitShell(str) {
  if (!str) return []
  const matches = str.match(/(?:[^\s"]+|"[^"]*")+/g)
  if (!matches) return []
  return matches.map((m) => {
    if (m.startsWith('"') && m.endsWith('"')) {
      return m.substring(1, m.length - 1)
    }
    return m
  })
}

function joinShell(arr) {
  if (!arr || !Array.isArray(arr)) return ''
  return arr
    .map((item) => {
      if (item.includes(' ')) {
        return `"${item}"`
      }
      return item
    })
    .join(' ')
}

watch(paramsTemplateUIString, (newVal) => {
  formData.params_template = splitShell(newVal)
})

watch(
  () => formData.params_template,
  (newVal) => {
    const currentUIAsArray = splitShell(paramsTemplateUIString.value)
    if (JSON.stringify(newVal) !== JSON.stringify(currentUIAsArray)) {
      paramsTemplateUIString.value = joinShell(newVal)
    }
  },
  { immediate: true }
)

const placeholderExecutable = 'Type and press Space or Enter (use "" for spaces)'
const placeholderParams = 'Type your template here. Use {VAR} for placeholders.'

// UI-State für die Chips (Tokens)
const executableTokens = ref([])
const executableInput = ref('')
const executableError = ref('')

// Synchronisierung: String (API) -> Tokens (UI)
watch(() => formData.executable, (newVal) => {
  const newTokens = stringToTokens(newVal)
  if (JSON.stringify(newTokens) !== JSON.stringify(executableTokens.value)) {
    executableTokens.value = newTokens
  }
})

// Synchronisierung: Tokens (UI) -> String (API)
watch(() => executableTokens.value, (newVal) => {
  formData.executable = tokensToString(newVal)
}, { deep: true })

function handleExecutableKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    const val = executableInput.value.trim()
    if (!val) {
       event.preventDefault()
       return
    }

    // Quoting: Falls es mit " beginnt, warten wir auf das schließende "
    if (val.startsWith('"')) {
      if (val.endsWith('"') && val.length > 1) {
        event.preventDefault()
        addExecutableToken(val.substring(1, val.length - 1))
      }
    } else {
      event.preventDefault()
      addExecutableToken(val)
    }
  }
}

function addExecutableToken(val) {
  if (/[&|;]/.test(val)) {
    executableError.value = 'Security: & | ; are not allowed.'
    return
  }
  executableTokens.value.push(val)
  executableInput.value = ''
  executableError.value = ''
}
const formDataReadOnly = ref(true)
const formDataValid = ref(false)
const formButtonDeleteShow = ref(true)
const formButtonEditShow = ref(false)
const formInputIdReadOnly = ref(true)

function initializeFormState() {
  if (route.params.definition_id !== '_new') {
    formInputIdReadOnly.value = true
    formDataReadOnly.value = true
    formButtonEditShow.value = true
  } else if (route.params.definition_id === '_new') {
    formInputIdReadOnly.value = false
    formDataReadOnly.value = false
    formButtonDeleteShow.value = false
    formButtonEditShow.value = false
  }
  formGetData()
}

initializeFormState()

watch(
  () => route.params.definition_id,
  () => {
    initializeFormState()
  }
)

watch(
  () => paramsTemplateUIString.value,
  (newVal) => {
    if (formDataReadOnly.value) return
    const regex = /\{([^{}]+)\}/g
    const foundParams = []
    let match
    while ((match = regex.exec(newVal)) !== null) {
      foundParams.push(match[1])
    }

    const currentParams = Object.keys(formData.params)
    foundParams.forEach((p) => {
      if (!formData.params[p]) {
        formData.params[p] = {
          type: 'string',
          _temp_name: p
        }
      }
    })
    currentParams.forEach((p) => {
      if (!foundParams.includes(p)) {
        delete formData.params[p]
      }
    })
  }
)

function formDelete() {
  dialogDeleteShow.value = true
  dialogDeleteMsg.value = `Are you sure you want to delete Job Definition: ${formData.id}`
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
  let url = `/api/v1/jobs/definitions/${formData.id}`
  
  const cleanParams = (p) => {
    const cleaned = {}
    Object.entries(p).forEach(([k, v]) => {
      const cleanedV = { ...v }
      delete cleanedV._temp_name
      cleaned[k] = cleanedV
    })
    return cleaned
  }

  const data = {
    executable: formData.executable,
    user: formData.user,
    group: formData.group,
    params_template: formData.params_template,
    params: cleanParams(formData.params),
    environment_variables: cleanParams(formData.environment_variables)
  }

  if (route.params.definition_id === '_new') {
    method = 'post'
    url = '/api/v1/jobs/definitions'
    data.id = formData.id
  }

  api.request(method, url, data).then(() => {
    if (route.params.definition_id === '_new') {
      router.push({
        name: 'JobsDefinitionsCRUD',
        params: { definition_id: formData.id }
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
  if (route.params.definition_id === '_new') {
    formData.id = ''
    formData.executable = ''
    formData.user = ''
    formData.group = ''
    formData.params_template = []
    formData.params = {}
    formData.environment_variables = {}
  } else {
    api.get(`/api/v1/jobs/definitions/${route.params.definition_id}`).then((data) => {
      if (data) {
        formData.id = data.id
        formData.executable = data.executable
        formData.user = data.user
        formData.group = data.group
        formData.params_template = data.params_template
        
        const addTempNames = (p) => {
          const withTemp = {}
          Object.entries(p).forEach(([k, v]) => {
            withTemp[k] = { ...v, _temp_name: k }
          })
          return withTemp
        }

        formData.params = addTempNames(data.params)
        formData.environment_variables = addTempNames(data.environment_variables)
      }
    })
  }
}

function addParam(target) {
  const name = 'new_param_' + Object.keys(formData[target]).length
  formData[target][name] = {
    type: 'string',
    _temp_name: name
  }
}

function removeParam(target, name) {
  delete formData[target][name]
}

function renameParam(target, oldName, newName) {
  if (oldName === newName || !newName) return
  if (formData[target][newName]) {
    alert('Parameter name already exists')
    formData[target][oldName]._temp_name = oldName
    return
  }
  const param = formData[target][oldName]
  delete formData[target][oldName]
  formData[target][newName] = param
}
</script>
