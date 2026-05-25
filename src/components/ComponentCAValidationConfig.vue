/* * Copyright 2026 Stephan Schultchen * * Licensed under the Apache License,
Version 2.0 (the "License"); * you may not use this file except in compliance
with the License. * You may obtain a copy of the License at * *
http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law
or agreed to in writing, software * distributed under the License is distributed
on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. * See the License for the specific language governing
permissions and * limitations under the License. */
<template>
  <v-expansion-panels multiple>
    <v-expansion-panel title="General Validation">
      <v-expansion-panel-text>
        <v-switch
          v-model="model.enforce_rfc1123"
          label="Enforce RFC1123"
          :readonly="readonly"
        ></v-switch>

        <v-combobox
          v-model="model.allowed_extensions"
          label="Allowed Extensions"
          multiple
          chips
          clearable
          :readonly="readonly"
          prepend-inner-icon="mdi-puzzle-outline"
        ></v-combobox>

        <v-combobox
          v-model="model.key_usages"
          label="Key Usages"
          :items="commonKeyUsages"
          multiple
          chips
          clearable
          :readonly="readonly"
          prepend-inner-icon="mdi-key-chain-variant"
        ></v-combobox>

        <v-combobox
          v-model="model.extended_key_usages"
          label="Extended Key Usages"
          :items="commonExtendedKeyUsages"
          multiple
          chips
          clearable
          :readonly="readonly"
          prepend-inner-icon="mdi-key-variant"
        ></v-combobox>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel title="SAN Validation">
      <v-expansion-panel-text>
        <v-checkbox
          v-model="hasSanValidation"
          label="Enable SAN Validation"
          :readonly="readonly"
        ></v-checkbox>

        <template v-if="hasSanValidation">
          <v-text-field
            v-model.number="model.san_validation.max_san_count"
            label="Max SAN Count"
            type="number"
            :readonly="readonly"
            prepend-inner-icon="mdi-counter"
            class="mb-4"
          ></v-text-field>

          <div class="text-subtitle-1 mb-2">Regex List</div>
          <div
            v-for="(regex, idx) in model.san_validation.regex_list"
            :key="idx"
            class="d-flex align-center ga-2 mb-2"
          >
            <v-text-field
              v-model="model.san_validation.regex_list[idx]"
              label="Regex Pattern"
              density="compact"
              hide-details
              :readonly="readonly"
              prepend-inner-icon="mdi-regex"
              placeholder="^.*\.example\.com$"
            ></v-text-field>
            <v-btn
              v-if="!readonly"
              icon="mdi-delete"
              variant="text"
              color="error"
              size="small"
              @click="removeRegex(idx)"
            ></v-btn>
          </div>
          <v-btn
            v-if="!readonly"
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="addRegex"
            class="mt-2"
          >
            Add Regex
          </v-btn>

          <v-divider class="my-6"></v-divider>
          <div class="text-subtitle-1 mb-2">Regex Validation Simulator</div>
          <div
            v-for="(hostname, idx) in regexSimulatorHostnames"
            :key="idx"
            class="mb-4 pa-3 border rounded bg-grey-lighten-5"
          >
            <div class="d-flex align-center ga-2">
              <v-text-field
                v-model="regexSimulatorHostnames[idx]"
                label="Example Hostname"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-test-tube"
                placeholder="host.example.com"
              ></v-text-field>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeRegexHostname(idx)"
              ></v-btn>
            </div>

            <!-- Simulation result for this hostname -->
            <template v-if="regexSimulation[idx]">
              <div class="mt-2 d-flex align-center">
                <v-icon
                  :color="regexSimulation[idx].matched ? 'success' : 'error'"
                  size="x-small"
                  class="me-2"
                >
                  {{ regexSimulation[idx].matched ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                </v-icon>
                <span class="text-caption font-weight-bold me-1">Status:</span>
                <span :class="['text-caption', regexSimulation[idx].matched ? 'text-success' : 'text-error']">
                  {{ regexSimulation[idx].matched ? 'Matched' : 'No match found' }}
                </span>
              </div>
              <div v-if="regexSimulation[idx].matched" class="mt-1 d-flex flex-wrap ga-1 ms-6">
                <span class="text-caption text-medium-emphasis">Matched by:</span>
                <v-chip
                  v-for="patternIdx in regexSimulation[idx].matches"
                  :key="patternIdx"
                  size="x-small"
                  variant="tonal"
                  color="success"
                >
                  Regex #{{ patternIdx + 1 }}
                </v-chip>
              </div>
              <div v-if="!regexSimulation[idx].matched && model.san_validation.regex_list.length > 0" class="text-caption text-error ms-6">
                This hostname will be rejected by current rules.
              </div>
            </template>
          </div>
          <v-btn
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="addRegexHostname"
          >
            Add Example Hostname
          </v-btn>

          <v-divider class="my-4"></v-divider>
          <div class="text-subtitle-1 mb-2">HTTP Checks</div>
          <div v-for="(check, index) in model.san_validation.http_checks" :key="index" class="mb-4 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-1">HTTP Check #{{ index + 1 }}</span>
              <v-btn
                v-if="!readonly"
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeHttpCheck(index)"
              ></v-btn>
            </div>

            <v-select
              v-model="check.method"
              :items="['GET', 'POST', 'PUT', 'DELETE']"
              label="Method"
              :readonly="readonly"
              prepend-inner-icon="mdi-http"
            ></v-select>

            <v-text-field
              v-model="check.url"
              label="URL"
              :readonly="readonly"
              :rules="[() => !!check.url || 'URL is required']"
              prepend-inner-icon="mdi-link"
            ></v-text-field>

            <div class="text-subtitle-2 mb-1 mt-2">Headers</div>
            <div v-for="(header, hIdx) in check.headers" :key="hIdx" class="d-flex align-center ga-2 mb-2">
              <v-text-field
                v-model="header.name"
                label="Name"
                density="compact"
                hide-details
                :readonly="readonly"
                placeholder="X-Custom-Header"
              ></v-text-field>
              <v-text-field
                v-model="header.value"
                label="Value"
                density="compact"
                hide-details
                :readonly="readonly"
                :placeholder="header.secret ? '********' : 'Value'"
                :type="header.secret ? 'password' : 'text'"
              ></v-text-field>
              <v-switch
                v-model="header.secret"
                label="Secret"
                density="compact"
                hide-details
                :readonly="readonly"
              ></v-switch>
              <v-btn
                v-if="!readonly"
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeHeader(index, hIdx)"
              ></v-btn>
            </div>
            <v-btn
              v-if="!readonly"
              size="x-small"
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="addHeader(index)"
              class="mb-4"
            >
              Add Header
            </v-btn>

            <v-divider class="my-4"></v-divider>
            <div class="text-subtitle-2 mb-1">Basic Authentication</div>
            <v-switch
              v-model="check.basic_auth_enabled"
              label="Enable Basic Auth"
              :readonly="readonly"
              density="compact"
            ></v-switch>

            <template v-if="check.basic_auth_enabled">
              <v-text-field
                v-model="check.username"
                label="Username"
                :readonly="readonly"
                prepend-inner-icon="mdi-account"
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="check.password"
                label="Password"
                :readonly="readonly"
                prepend-inner-icon="mdi-lock"
                type="password"
                hint="Leave empty if already set and you don't want to change it"
                persistent-hint
                class="mb-4"
              ></v-text-field>
            </template>
            <v-divider class="my-4"></v-divider>

            <v-textarea
              v-model="check.body_template"
              label="Body Template"
              :readonly="readonly"
              prepend-inner-icon="mdi-file-document-outline"
            ></v-textarea>

            <v-switch
              v-model="check.verify_ssl"
              label="Verify SSL"
              :readonly="readonly"
            ></v-switch>

            <v-textarea
              v-model="check.ca_cert"
              label="CA Cert (PEM)"
              :readonly="readonly"
              prepend-inner-icon="mdi-certificate"
            ></v-textarea>

            <v-textarea
              v-model="check.client_cert"
              label="Client Cert (PEM)"
              :readonly="readonly"
              prepend-inner-icon="mdi-certificate-outline"
            ></v-textarea>

            <v-textarea
              v-model="check.client_key"
              label="Client Key (PEM)"
              :readonly="readonly"
              prepend-inner-icon="mdi-key-outline"
            ></v-textarea>

            <v-text-field
              v-model.number="check.timeout_seconds"
              label="Timeout (seconds)"
              type="number"
              :readonly="readonly"
              prepend-inner-icon="mdi-timer-outline"
            ></v-text-field>
          </div>
          <v-btn
            v-if="!readonly"
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="addHttpCheck"
          >
            Add HTTP Check
          </v-btn>

          <v-divider class="my-4"></v-divider>
          <div class="text-subtitle-1 mb-2">Script Checks</div>
          <div v-for="(check, index) in model.san_validation.script_checks" :key="index" class="mb-4 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-1">Script Check #{{ index + 1 }}</span>
              <v-btn
                v-if="!readonly"
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeScriptCheck(index)"
              ></v-btn>
            </div>

            <v-text-field
              v-model="check.script_path"
              label="Script Path"
              :readonly="readonly"
              :rules="[() => !!check.script_path || 'Script Path is required']"
              prepend-inner-icon="mdi-script-text-outline"
            ></v-text-field>

            <v-text-field
              v-model.number="check.timeout_seconds"
              label="Timeout (seconds)"
              type="number"
              :readonly="readonly"
              prepend-inner-icon="mdi-timer-outline"
            ></v-text-field>
          </div>
          <v-btn
            v-if="!readonly"
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="addScriptCheck"
          >
            Add Script Check
          </v-btn>
        </template>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel title="SAN Injection">
      <v-expansion-panel-text>
        <v-checkbox
          v-model="hasSanInjection"
          label="Enable SAN Injection"
          :readonly="readonly"
        ></v-checkbox>

        <template v-if="hasSanInjection">
          <div class="text-subtitle-1 mb-2">Global Injection Simulator</div>
          <v-text-field
            v-model="simulatorCn"
            label="Example Common Name (CN)"
            prepend-inner-icon="mdi-test-tube"
            hint="Enter a sample CN to test your patterns and templates"
            persistent-hint
            class="mb-6"
          ></v-text-field>

          <v-divider class="my-6"></v-divider>

          <div v-for="(injection, injIdx) in model.san_injection" :key="injIdx" class="mb-8 pa-4 border rounded">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-h6">Injection Entry #{{ injIdx + 1 }}</span>
              <v-btn
                v-if="!readonly"
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeInjectionEntry(injIdx)"
              ></v-btn>
            </div>

            <v-text-field
              v-model="injection.pattern"
              label="Pattern"
              :readonly="readonly"
              :rules="[() => !!injection.pattern || 'Pattern is required']"
              prepend-inner-icon="mdi-regex"
              class="mb-4"
              hint="Regex to deconstruct the CN (supports Python-style named groups (?P<name>...))"
              persistent-hint
            ></v-text-field>

            <!-- Simulator for this entry -->
            <template v-if="injectionSimulations[injIdx]">
              <v-alert
                v-if="injectionSimulations[injIdx].error"
                type="error"
                variant="tonal"
                class="mb-4"
                size="small"
              >
                {{ injectionSimulations[injIdx].error }}
              </v-alert>

              <v-alert
                v-else-if="!injectionSimulations[injIdx].matched"
                type="warning"
                variant="tonal"
                class="mb-4"
                size="small"
              >
                Pattern does not match the example CN.
              </v-alert>

              <template v-else>
                <div class="mb-4">
                  <div class="text-subtitle-2 mb-1">Identified Match Groups:</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="(group, gIdx) in injectionSimulations[injIdx].groups"
                      :key="gIdx"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ group.label }}: {{ group.value }}
                    </v-chip>
                  </div>
                </div>
              </template>
            </template>

            <div class="text-subtitle-1 mb-2">Injection Templates</div>
            <div
              v-for="(template, tIdx) in injection.templates"
              :key="tIdx"
              class="mb-2 pa-2 border rounded bg-grey-lighten-5"
            >
              <div class="d-flex align-center ga-2">
                <v-text-field
                  v-model="injection.templates[tIdx]"
                  label="Template"
                  density="compact"
                  hide-details
                  :readonly="readonly"
                  prepend-inner-icon="mdi-file-replace-outline"
                  placeholder="{1}.example.com"
                ></v-text-field>
                <v-btn
                  v-if="!readonly"
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeTemplate(injIdx, tIdx)"
                ></v-btn>
              </div>

              <!-- Individual simulation result -->
              <template v-if="injectionSimulations[injIdx]?.results?.[tIdx]">
                <div class="mt-2 d-flex align-center">
                  <v-icon
                    :color="injectionSimulations[injIdx].results[tIdx].missingGroup ? 'error' : 'success'"
                    size="x-small"
                    class="me-2"
                  >
                    {{ injectionSimulations[injIdx].results[tIdx].missingGroup ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                  <span class="text-caption font-weight-bold me-1">Result:</span>
                  <span class="text-caption text-mono">{{ injectionSimulations[injIdx].results[tIdx].resolved }}</span>
                </div>
                <div v-if="injectionSimulations[injIdx].results[tIdx].missingGroup" class="text-caption text-error ms-6">
                  Template uses undefined match group
                </div>
              </template>
            </div>

            <v-btn
              v-if="!readonly"
              prepend-icon="mdi-plus"
              variant="outlined"
              size="small"
              @click="addTemplate(injIdx)"
              class="mt-2"
            >
              Add Template
            </v-btn>
          </div>

          <v-btn
            v-if="!readonly"
            prepend-icon="mdi-plus"
            variant="flat"
            color="primary"
            @click="addInjectionEntry"
          >
            Add Injection Entry
          </v-btn>

          <div class="text-caption mt-4 text-medium-emphasis">
            Each entry defines a regex pattern and a set of templates. 
            Use {0}, {1} or {name} in templates to reference match groups from the pattern.
          </div>
        </template>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { computed, ref } from 'vue'

const model = defineModel({
  type: Object,
  default: () => ({
    enforce_rfc1123: true,
    allowed_extensions: [],
    key_usages: ['digital_signature', 'key_encipherment'],
    extended_key_usages: ['SERVER_AUTH', 'CLIENT_AUTH'],
    san_validation: null,
    san_injection: null
  })
})

defineProps({
  readonly: {
    type: Boolean,
    default: false
  }
})

const commonKeyUsages = [
  'digital_signature',
  'content_commitment',
  'key_encipherment',
  'data_encipherment',
  'key_agreement',
  'key_cert_sign',
  'crl_sign',
  'encipher_only',
  'decipher_only'
]

const commonExtendedKeyUsages = [
  'SERVER_AUTH',
  'CLIENT_AUTH',
  'CODE_SIGNING',
  'EMAIL_PROTECTION',
  'TIME_STAMPING',
  'OCSP_SIGNING',
  'ANY_EXTENDED_KEY_USAGE'
]

const hasSanValidation = computed({
  get: () => !!model.value.san_validation,
  set: (val) => {
    if (val) {
      model.value.san_validation = {
        max_san_count: 10,
        regex_list: [],
        http_checks: [],
        script_checks: []
      }
    } else {
      model.value.san_validation = null
    }
  }
})

const hasSanInjection = computed({
  get: () => !!model.value.san_injection,
  set: (val) => {
    if (val) {
      model.value.san_injection = []
    } else {
      model.value.san_injection = null
    }
  }
})

const regexSimulatorHostnames = ref([])
const regexSimulation = computed(() => {
  if (!model.value.san_validation?.regex_list) return []

  return regexSimulatorHostnames.value.map((hostname) => {
    if (!hostname) return { matched: false, matches: [] }
    const matches = []
    model.value.san_validation.regex_list.forEach((pattern, idx) => {
      if (!pattern) return
      try {
        const regex = new RegExp(pattern)
        if (regex.test(hostname)) {
          matches.push(idx)
        }
      } catch {
        // Ignore invalid regex
      }
    })
    return { matched: matches.length > 0, matches }
  })
})

const simulatorCn = ref('')
const injectionSimulations = computed(() => {
  if (!model.value.san_injection || !simulatorCn.value) return []

  return model.value.san_injection.map((injection) => {
    if (!injection.pattern) return { matched: false }

    try {
      // Convert Python named group syntax (?P<name>...) to JS syntax (?<name>...) for simulation
      const jsPattern = injection.pattern.replace(/\(\?P</g, '(?<')
      const regex = new RegExp(jsPattern)
      const match = simulatorCn.value.match(regex)
      if (!match) return { matched: false }

      const groups = [...match]
      const namedGroups = match.groups || {}

      const results = (injection.templates || []).map((template) => {
        let missingGroup = false
        const groupRefRegex = /\{([^}]+)\}/g
        const resolved = template.replace(groupRefRegex, (fullMatch, key) => {
          if (/^\d+$/.test(key)) {
            const idx = parseInt(key)
            if (idx >= 0 && idx < groups.length) return groups[idx]
          }
          if (Object.prototype.hasOwnProperty.call(namedGroups, key)) {
            return namedGroups[key]
          }
          missingGroup = true
          return fullMatch
        })
        return { template, resolved, missingGroup }
      })

      const displayGroups = []
      groups.forEach((val, idx) => {
        displayGroups.push({ label: `{${idx}}`, value: val })
      })
      Object.entries(namedGroups).forEach(([name, val]) => {
        displayGroups.push({ label: `{${name}}`, value: val })
      })

      return { matched: true, groups: displayGroups, results }
    } catch (e) {
      return { error: `Invalid Regex Pattern: ${e.message}` }
    }
  })
})

function addHttpCheck() {
  if (!model.value.san_validation.http_checks) {
    model.value.san_validation.http_checks = []
  }
  model.value.san_validation.http_checks.push({
    method: 'GET',
    url: '',
    headers: [],
    body_template: null,
    verify_ssl: true,
    ca_cert: null,
    client_cert: null,
    client_key: null,
    timeout_seconds: 5,
    basic_auth_enabled: false,
    username: null,
    password: null
  })
}

function removeHttpCheck(index) {
  model.value.san_validation.http_checks.splice(index, 1)
}

function addHeader(checkIdx) {
  const check = model.value.san_validation?.http_checks?.[checkIdx]
  if (!check) return
  if (!check.headers) {
    check.headers = []
  }
  check.headers.push({ name: '', value: '', secret: false })
}

function removeHeader(checkIdx, hIdx) {
  const check = model.value.san_validation?.http_checks?.[checkIdx]
  if (!check) return
  check.headers.splice(hIdx, 1)
}

function addScriptCheck() {
  if (!model.value.san_validation.script_checks) {
    model.value.san_validation.script_checks = []
  }
  model.value.san_validation.script_checks.push({
    script_path: '',
    timeout_seconds: 5
  })
}

function removeScriptCheck(index) {
  model.value.san_validation.script_checks.splice(index, 1)
}

function addRegex() {
  if (!model.value.san_validation.regex_list) {
    model.value.san_validation.regex_list = []
  }
  model.value.san_validation.regex_list.push('')
}

function removeRegex(index) {
  model.value.san_validation.regex_list.splice(index, 1)
}

function addRegexHostname() {
  regexSimulatorHostnames.value.push('')
}

function removeRegexHostname(index) {
  regexSimulatorHostnames.value.splice(index, 1)
}

function addInjectionEntry() {
  if (!model.value.san_injection) {
    model.value.san_injection = []
  }
  model.value.san_injection.push({
    pattern: '',
    templates: []
  })
}

function removeInjectionEntry(index) {
  model.value.san_injection.splice(index, 1)
}

function addTemplate(injIdx) {
  if (!model.value.san_injection[injIdx].templates) {
    model.value.san_injection[injIdx].templates = []
  }
  model.value.san_injection[injIdx].templates.push('')
}

function removeTemplate(injIdx, tIdx) {
  model.value.san_injection[injIdx].templates.splice(tIdx, 1)
}
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
