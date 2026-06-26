<template>
  <div v-if="model" class="flex flex-col gap-4">
    <Accordion multiple :value="activePanels">
      <AccordionPanel value="general">
        <AccordionHeader>General Validation</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <ToggleSwitch
                id="enforce_rfc1123"
                v-model="model.enforce_rfc1123"
                :disabled="readonly"
              />
              <label
                for="enforce_rfc1123"
                class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Enforce RFC 1123
              </label>
            </div>

            <div class="flex flex-col gap-1">
              <label
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >Allowed Extensions</label
              >
              <AutoComplete
                v-model="model.allowed_extensions"
                multiple
                :typeahead="false"
                :disabled="readonly"
                class="w-full"
                input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >Key Usages</label
              >
              <AutoComplete
                v-model="model.key_usages"
                multiple
                :typeahead="false"
                :disabled="readonly"
                class="w-full"
                input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
              <div class="flex flex-wrap gap-1 mt-1">
                <Button
                  v-for="usage in commonKeyUsages"
                  :key="usage"
                  :label="usage"
                  :disabled="readonly"
                  class="p-button-xs p-button-secondary p-button-outlined text-xs py-0.5 px-1.5"
                  @click="toggleKeyUsage(usage)"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label
                class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >Extended Key Usages</label
              >
              <AutoComplete
                v-model="model.extended_key_usages"
                multiple
                :typeahead="false"
                :disabled="readonly"
                class="w-full"
                input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
              <div class="flex flex-wrap gap-1 mt-1">
                <Button
                  v-for="usage in commonExtendedKeyUsages"
                  :key="usage"
                  :label="usage"
                  :disabled="readonly"
                  class="p-button-xs p-button-secondary p-button-outlined text-xs py-0.5 px-1.5"
                  @click="toggleExtendedKeyUsage(usage)"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="san_validation">
        <AccordionHeader>SAN Validation</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <ToggleSwitch
                id="enable_san_validation"
                v-model="hasSanValidation"
                :disabled="readonly"
              />
              <label
                for="enable_san_validation"
                class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Enable SAN Validation
              </label>
            </div>

            <template v-if="hasSanValidation && model.san_validation">
              <div class="flex flex-col gap-1">
                <label
                  for="max_san_count"
                  class="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >
                  Max SAN Count
                </label>
                <InputText
                  id="max_san_count"
                  v-model.number="model.san_validation.max_san_count"
                  type="number"
                  :disabled="readonly"
                  class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div
                class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2"
              >
                <span
                  class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >Regex List</span
                >
                <div class="flex flex-col gap-2 mt-2">
                  <div
                    v-for="(regex, idx) in model.san_validation.regex_list"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <InputText
                      v-model="model.san_validation.regex_list[idx]"
                      :disabled="readonly"
                      placeholder="^.*\.example\.com$"
                      class="flex-grow bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                    <Button
                      v-if="!readonly"
                      icon="pi pi-trash"
                      class="p-button-danger p-button-outlined"
                      @click="removeRegex(idx)"
                    />
                  </div>
                  <Button
                    v-if="!readonly"
                    label="Add Regex Pattern"
                    icon="pi pi-plus"
                    class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-full md:w-auto"
                    @click="addRegex"
                  />
                </div>
              </div>

              <div
                class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2"
              >
                <span
                  class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >Regex Validation Simulator</span
                >
                <div class="flex flex-col gap-4 mt-2">
                  <div
                    v-for="(hostname, idx) in regexSimulatorHostnames"
                    :key="idx"
                    class="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex flex-col gap-2"
                  >
                    <div class="flex items-center gap-2">
                      <InputText
                        v-model="regexSimulatorHostnames[idx]"
                        placeholder="host.example.com"
                        class="flex-grow bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                      />
                      <Button
                        icon="pi pi-trash"
                        class="p-button-danger p-button-outlined"
                        @click="removeRegexHostname(idx)"
                      />
                    </div>
                    <div
                      v-if="regexSimulation[idx]"
                      class="flex flex-col gap-1"
                    >
                      <div class="flex items-center gap-1.5 text-xs">
                        <i
                          :class="[
                            'pi',
                            regexSimulation[idx].matched
                              ? 'pi-check-circle text-emerald-600'
                              : 'pi-times-circle text-rose-600'
                          ]"
                        ></i>
                        <span class="font-bold">Status:</span>
                        <span
                          :class="
                            regexSimulation[idx].matched
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          "
                        >
                          {{
                            regexSimulation[idx].matched
                              ? 'Matched'
                              : 'Rejected'
                          }}
                        </span>
                      </div>
                      <div
                        v-if="
                          regexSimulation[idx].matched &&
                          regexSimulation[idx].matches.length > 0
                        "
                        class="flex flex-wrap gap-1 mt-1"
                      >
                        <Tag
                          v-for="patternIdx in regexSimulation[idx].matches"
                          :key="patternIdx"
                          :value="`Pattern #${patternIdx + 1}`"
                          severity="success"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    label="Add Example Hostname"
                    icon="pi pi-plus"
                    class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-full md:w-auto"
                    @click="addRegexHostname"
                  />
                </div>
              </div>

              <div
                class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2"
              >
                <span
                  class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >HTTP Checks</span
                >
                <div class="flex flex-col gap-4 mt-2">
                  <div
                    v-for="(check, index) in model.san_validation.http_checks"
                    :key="index"
                    class="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex flex-col gap-3"
                  >
                    <div class="flex justify-between items-center">
                      <span
                        class="font-semibold text-zinc-700 dark:text-zinc-300"
                        >HTTP Check #{{ index + 1 }}</span
                      >
                      <Button
                        v-if="!readonly"
                        icon="pi pi-trash"
                        class="p-button-danger p-button-outlined p-button-sm"
                        @click="removeHttpCheck(index)"
                      />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500">Method</label>
                        <Select
                          v-model="check.method"
                          :options="['GET', 'POST', 'PUT', 'DELETE']"
                          :disabled="readonly"
                          class="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                      <div class="flex flex-col gap-1 md:col-span-2">
                        <label class="text-xs text-zinc-500">URL</label>
                        <InputText
                          v-model="check.url"
                          :disabled="readonly"
                          required
                          class="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-1 mt-2">
                      <span
                        class="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                        >Headers</span
                      >
                      <div class="flex flex-col gap-2 mt-1">
                        <div
                          v-for="(header, hIdx) in check.headers"
                          :key="hIdx"
                          class="flex flex-wrap md:flex-nowrap items-center gap-2"
                        >
                          <InputText
                            v-model="header.name"
                            placeholder="Name"
                            :disabled="readonly"
                            class="flex-grow bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                          />
                          <InputText
                            v-model="header.value"
                            placeholder="Value"
                            :type="header.secret ? 'password' : 'text'"
                            :disabled="readonly"
                            class="flex-grow bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                          />
                          <div class="flex items-center gap-1.5">
                            <ToggleSwitch
                              v-model="header.secret"
                              :disabled="readonly"
                            />
                            <span class="text-xs text-zinc-500">Secret</span>
                          </div>
                          <Button
                            v-if="!readonly"
                            icon="pi pi-trash"
                            class="p-button-danger p-button-outlined p-button-sm"
                            @click="removeHeader(index, hIdx)"
                          />
                        </div>
                        <Button
                          v-if="!readonly"
                          label="Add Header"
                          icon="pi pi-plus"
                          class="p-button-outlined p-button-xs text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-max"
                          @click="addHeader(index)"
                        />
                      </div>
                    </div>

                    <div
                      class="flex flex-col gap-2 mt-2 border-t border-zinc-200 dark:border-zinc-700 pt-2"
                    >
                      <div class="flex items-center gap-2">
                        <ToggleSwitch
                          v-model="check.basic_auth_enabled"
                          :disabled="readonly"
                        />
                        <span
                          class="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                          >Enable Basic Auth</span
                        >
                      </div>
                      <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-2"
                        v-if="check.basic_auth_enabled"
                      >
                        <div class="flex flex-col gap-1">
                          <label class="text-xs text-zinc-500">Username</label>
                          <InputText
                            v-model="check.username"
                            :disabled="readonly"
                            class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                        <div class="flex flex-col gap-1">
                          <label class="text-xs text-zinc-500">Password</label>
                          <InputText
                            v-model="check.password"
                            type="password"
                            :disabled="readonly"
                            class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1 mt-2">
                      <label class="text-xs text-zinc-500">Body Template</label>
                      <Textarea
                        v-model="check.body_template"
                        :disabled="readonly"
                        rows="3"
                        class="font-mono text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 w-full"
                      />
                    </div>

                    <div class="flex flex-wrap gap-4 items-center">
                      <div class="flex items-center gap-2">
                        <ToggleSwitch
                          v-model="check.verify_ssl"
                          :disabled="readonly"
                        />
                        <span class="text-xs text-zinc-500">Verify SSL</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-zinc-500">Timeout:</span>
                        <InputText
                          v-model.number="check.timeout_seconds"
                          type="number"
                          :disabled="readonly"
                          class="w-16 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        />
                        <span class="text-xs text-zinc-500">seconds</span>
                      </div>
                    </div>

                    <div
                      class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2"
                      v-if="
                        !readonly ||
                        check.ca_cert ||
                        check.client_cert ||
                        check.client_key
                      "
                    >
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500"
                          >CA Cert (PEM)</label
                        >
                        <Textarea
                          v-model="check.ca_cert"
                          :disabled="readonly"
                          rows="3"
                          class="font-mono text-xs bg-white dark:bg-zinc-900 w-full text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500"
                          >Client Cert (PEM)</label
                        >
                        <Textarea
                          v-model="check.client_cert"
                          :disabled="readonly"
                          rows="3"
                          class="font-mono text-xs bg-white dark:bg-zinc-900 w-full text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500"
                          >Client Key (PEM)</label
                        >
                        <Textarea
                          v-model="check.client_key"
                          :disabled="readonly"
                          rows="3"
                          class="font-mono text-xs bg-white dark:bg-zinc-900 w-full text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    v-if="!readonly"
                    label="Add HTTP Check"
                    icon="pi pi-plus"
                    class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-full md:w-auto"
                    @click="addHttpCheck"
                  />
                </div>
              </div>

              <div
                class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2"
              >
                <span
                  class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >Script Checks</span
                >
                <div class="flex flex-col gap-3 mt-2">
                  <div
                    v-for="(check, index) in model.san_validation.script_checks"
                    :key="index"
                    class="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex flex-col gap-2"
                  >
                    <div class="flex justify-between items-center">
                      <span
                        class="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                        >Script Check #{{ index + 1 }}</span
                      >
                      <Button
                        v-if="!readonly"
                        icon="pi pi-trash"
                        class="p-button-danger p-button-outlined p-button-sm"
                        @click="removeScriptCheck(index)"
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500">Script Path</label>
                        <InputText
                          v-model="check.script_path"
                          :disabled="readonly"
                          required
                          class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-xs text-zinc-500"
                          >Timeout (seconds)</label
                        >
                        <InputText
                          v-model.number="check.timeout_seconds"
                          type="number"
                          :disabled="readonly"
                          class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    v-if="!readonly"
                    label="Add Script Check"
                    icon="pi pi-plus"
                    class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-full md:w-auto"
                    @click="addScriptCheck"
                  />
                </div>
              </div>
            </template>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="san_injection">
        <AccordionHeader>SAN Injection</AccordionHeader>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <ToggleSwitch
                id="enable_san_injection"
                v-model="hasSanInjection"
                :disabled="readonly"
              />
              <label
                for="enable_san_injection"
                class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Enable SAN Injection
              </label>
            </div>

            <template v-if="hasSanInjection && model.san_injection">
              <div
                class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2"
              >
                <div class="flex flex-col gap-1">
                  <label
                    for="simulator-cn"
                    class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                    >Live Injection Simulator - Example Common Name (CN)</label
                  >
                  <AutoComplete
                    id="simulator-cn"
                    v-model="simulatorCn"
                    :suggestions="nodeSuggestions"
                    @complete="searchNodes"
                    placeholder="Enter or select common name (e.g. host.example.com)"
                    class="w-full"
                    input-class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                    dropdown
                  />
                  <small class="text-xs text-zinc-500 mt-1">
                    Select a node from the database or type a custom one.
                  </small>
                </div>
              </div>

              <div class="flex flex-col gap-4 mt-4">
                <div
                  v-for="(injection, idx) in model.san_injection"
                  :key="idx"
                  class="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex flex-col gap-3"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-zinc-700 dark:text-zinc-300"
                      >Injection Rule #{{ idx + 1 }}</span
                    >
                    <Button
                      v-if="!readonly"
                      icon="pi pi-trash"
                      class="p-button-danger p-button-outlined p-button-sm"
                      @click="removeInjectionEntry(idx)"
                    />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-xs text-zinc-500">Regex Pattern *</label>
                    <InputText
                      v-model="injection.pattern"
                      :disabled="readonly"
                      placeholder="^(?P<host>[^.]+)\.(?P<domain>.+)$"
                      class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>

                  <div class="flex flex-col gap-1 mt-2">
                    <span
                      class="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                      >Templates</span
                    >
                    <div class="flex flex-col gap-2 mt-1">
                      <div
                        v-for="(template, tIdx) in injection.templates"
                        :key="tIdx"
                        class="flex items-center gap-2"
                      >
                        <InputText
                          v-model="injection.templates[tIdx]"
                          placeholder="{host}-alt.{domain}"
                          :disabled="readonly"
                          class="flex-grow bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        />
                        <Button
                          v-if="!readonly"
                          icon="pi pi-trash"
                          class="p-button-danger p-button-outlined p-button-sm"
                          @click="removeTemplate(idx, tIdx)"
                        />
                      </div>
                      <Button
                        v-if="!readonly"
                        label="Add Template"
                        icon="pi pi-plus"
                        class="p-button-outlined p-button-xs text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-max"
                        @click="addTemplate(idx)"
                      />
                    </div>
                  </div>

                  <div v-if="injectionSimulations[idx]" class="mt-2">
                    <div
                      v-if="injectionSimulations[idx].error"
                      class="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2"
                    >
                      <i class="pi pi-exclamation-triangle"></i>
                      <span>{{ injectionSimulations[idx].error }}</span>
                    </div>

                    <div
                      v-else-if="!injectionSimulations[idx].matched"
                      class="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2"
                    >
                      <i class="pi pi-exclamation-circle"></i>
                      <span>Pattern does not match the example CN.</span>
                    </div>

                    <div
                      v-else
                      class="p-3 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex flex-col gap-2"
                    >
                      <div
                        class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                      >
                        <i class="pi pi-check-circle"></i>
                        <span>Pattern matches example CN</span>
                      </div>

                      <div class="mb-1">
                        <div
                          class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1"
                        >
                          Identified Match Groups:
                        </div>
                        <div class="flex flex-wrap gap-1">
                          <Tag
                            v-for="grp in injectionSimulations[idx].groups"
                            :key="grp.label"
                            :value="`${grp.label}: ${grp.value}`"
                            severity="secondary"
                            class="text-xs"
                          />
                        </div>
                      </div>

                      <div
                        class="flex flex-col gap-1 mt-1 border-t border-emerald-250 dark:border-emerald-800/30 pt-2"
                      >
                        <div
                          class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1"
                        >
                          Injection Templates:
                        </div>
                        <div
                          v-for="(res, tIdx) in injectionSimulations[idx]
                            .results"
                          :key="tIdx"
                          class="text-xs"
                        >
                          <div class="flex items-center gap-1.5 py-0.5">
                            <i
                              :class="[
                                'pi',
                                res.missingGroup
                                  ? 'pi-times-circle text-rose-600'
                                  : 'pi-check-circle text-emerald-600'
                              ]"
                            ></i>
                            <span
                              class="font-semibold text-zinc-700 dark:text-zinc-300"
                              >{{ res.template }}</span
                            >
                            <i class="pi pi-arrow-right text-zinc-400"></i>
                            <span
                              class="font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-800"
                              >{{ res.resolved }}</span
                            >
                          </div>
                          <div
                            v-if="res.missingGroup"
                            class="text-[10px] text-rose-500 ml-5 font-semibold"
                          >
                            Template references match group undefined in regex
                            pattern
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  v-if="!readonly"
                  label="Add Injection Entry"
                  icon="pi pi-plus"
                  class="p-button-outlined p-button-sm text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 w-full md:w-auto"
                  @click="addInjectionEntry"
                />
              </div>
            </template>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { watch } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'

import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Tag from 'primevue/tag'
import AutoComplete from 'primevue/autocomplete'
import api from '@/api/client'
import { useCAValidationConfig } from '@/composables/useCAValidationConfig'

const { getDefaultValidationConfig } = useCAValidationConfig()

const model = defineModel<any>({
  default: () => ({
    enforce_rfc1123: true,
    allowed_extensions: [],
    key_usages: ['digital_signature', 'key_encipherment'],
    extended_key_usages: ['SERVER_AUTH', 'CLIENT_AUTH'],
    san_validation: null,
    san_injection: null
  })
})

defineProps<{
  readonly?: boolean
}>()

const activePanels = ref<string[]>(['general'])

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
  get: () => {
    return !!model.value?.san_validation
  },
  set: (val) => {
    if (!model.value) {
      model.value = getDefaultValidationConfig()
    }
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
  get: () => {
    return !!model.value?.san_injection
  },
  set: (val) => {
    if (!model.value) {
      model.value = getDefaultValidationConfig()
    }
    if (val) {
      model.value.san_injection = []
    } else {
      model.value.san_injection = null
    }
  }
})

const regexSimulatorHostnames = ref<string[]>([])
const regexSimulation = computed(() => {
  if (!model.value?.san_validation?.regex_list) {
    return []
  }

  return regexSimulatorHostnames.value.map((hostname) => {
    if (!hostname) {
      return {
        matched: false,
        matches: []
      }
    }
    const matches: number[] = []
    const list = model.value.san_validation.regex_list
    for (let idx = 0; idx < list.length; idx++) {
      const pattern = list[idx]
      if (!pattern) continue
      try {
        const regex = new RegExp(pattern)
        if (regex.test(hostname)) {
          matches.push(idx)
        }
      } catch {
        // Ignored
      }
    }
    return {
      matched: matches.length > 0,
      matches
    }
  })
})

const simulatorCn = ref('')
const nodeSuggestions = ref<string[]>([])

const searchNodes = async (event: { query: string }) => {
  try {
    const response = await api.get<any>('/api/v1/nodes', {
      node_id: event.query,
      limit: 10,
      fields: ['id']
    })
    if (response && response.result) {
      nodeSuggestions.value = response.result.map((n: any) => n.id)
    }
  } catch {
    // Ignored
  }
}

const fetchDefaultRandomNode = async () => {
  try {
    const response = await api.get<any>('/api/v1/nodes', {
      limit: 100,
      fields: ['id']
    })
    if (response && response.result && response.result.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.result.length)
      simulatorCn.value = response.result[randomIndex].id
    }
  } catch {
    // Ignored
  }
}

onMounted(() => {
  fetchDefaultRandomNode()
})

const injectionSimulations = computed(() => {
  if (!model.value?.san_injection || !simulatorCn.value) {
    return []
  }

  return model.value.san_injection.map((injection: any) => {
    if (!injection.pattern) {
      return { matched: false }
    }

    try {
      const jsPattern = injection.pattern.replace(/\(\?P</g, '(?<')
      const regex = new RegExp(jsPattern)
      const match = simulatorCn.value.match(regex)
      if (!match) {
        return { matched: false }
      }

      const groups = [...match]
      const namedGroups = match.groups || {}

      const results = (injection.templates || []).map((template: string) => {
        let missingGroup = false
        const groupRefRegex = /\{([^}]+)\}/g
        const resolved = template.replace(groupRefRegex, (fullMatch, key) => {
          if (/^\d+$/.test(key)) {
            const idx = parseInt(key)
            if (idx >= 0 && idx < groups.length) {
              return groups[idx]
            }
          }
          if (Object.prototype.hasOwnProperty.call(namedGroups, key)) {
            return namedGroups[key]
          }
          missingGroup = true
          return fullMatch
        })
        return {
          template,
          resolved,
          missingGroup
        }
      })

      const displayGroups: { label: string; value: string }[] = []
      groups.forEach((val, idx) => {
        displayGroups.push({
          label: `{${idx}}`,
          value: val
        })
      })
      Object.entries(namedGroups).forEach(([name, val]) => {
        displayGroups.push({
          label: `{${name}}`,
          value: String(val)
        })
      })

      return {
        matched: true,
        groups: displayGroups,
        results
      }
    } catch (e: any) {
      return { error: `Invalid Regex Pattern: ${e.message}` }
    }
  })
})

const toggleKeyUsage = (usage: string) => {
  if (!model.value?.key_usages) {
    if (model.value) {
      model.value.key_usages = []
    }
  }
  if (!model.value?.key_usages) return
  const idx = model.value.key_usages.indexOf(usage)
  if (idx > -1) {
    model.value.key_usages.splice(idx, 1)
  } else {
    model.value.key_usages.push(usage)
  }
}

const toggleExtendedKeyUsage = (usage: string) => {
  if (!model.value?.extended_key_usages) {
    if (model.value) {
      model.value.extended_key_usages = []
    }
  }
  if (!model.value?.extended_key_usages) return
  const idx = model.value.extended_key_usages.indexOf(usage)
  if (idx > -1) {
    model.value.extended_key_usages.splice(idx, 1)
  } else {
    model.value.extended_key_usages.push(usage)
  }
}

const addHttpCheck = () => {
  if (!model.value?.san_validation) return
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

const removeHttpCheck = (index: number) => {
  if (!model.value?.san_validation?.http_checks) return
  model.value.san_validation.http_checks.splice(index, 1)
}

const addHeader = (checkIdx: number) => {
  const check = model.value?.san_validation?.http_checks?.[checkIdx]
  if (!check) return
  if (!check.headers) {
    check.headers = []
  }
  check.headers.push({
    name: '',
    value: '',
    secret: false
  })
}

const removeHeader = (checkIdx: number, hIdx: number) => {
  const check = model.value?.san_validation?.http_checks?.[checkIdx]
  if (!check || !check.headers) return
  check.headers.splice(hIdx, 1)
}

const addScriptCheck = () => {
  if (!model.value?.san_validation) return
  if (!model.value.san_validation.script_checks) {
    model.value.san_validation.script_checks = []
  }
  model.value.san_validation.script_checks.push({
    script_path: '',
    timeout_seconds: 5
  })
}

const removeScriptCheck = (index: number) => {
  if (!model.value?.san_validation?.script_checks) return
  model.value.san_validation.script_checks.splice(index, 1)
}

const addRegex = () => {
  if (!model.value?.san_validation) return
  if (!model.value.san_validation.regex_list) {
    model.value.san_validation.regex_list = []
  }
  model.value.san_validation.regex_list.push('')
}

const removeRegex = (index: number) => {
  if (!model.value?.san_validation?.regex_list) return
  model.value.san_validation.regex_list.splice(index, 1)
}

const addRegexHostname = () => {
  regexSimulatorHostnames.value.push('')
}

const removeRegexHostname = (index: number) => {
  regexSimulatorHostnames.value.splice(index, 1)
}

const addInjectionEntry = () => {
  if (!model.value) return
  if (!model.value.san_injection) {
    model.value.san_injection = []
  }
  model.value.san_injection.push({
    pattern: '',
    templates: []
  })
}

const removeInjectionEntry = (index: number) => {
  if (!model.value?.san_injection) return
  model.value.san_injection.splice(index, 1)
}

const addTemplate = (injIdx: number) => {
  if (!model.value?.san_injection?.[injIdx]) return
  if (!model.value.san_injection[injIdx].templates) {
    model.value.san_injection[injIdx].templates = []
  }
  model.value.san_injection[injIdx].templates.push('')
}

const removeTemplate = (injIdx: number, tIdx: number) => {
  if (!model.value?.san_injection?.[injIdx]?.templates) return
  model.value.san_injection[injIdx].templates.splice(tIdx, 1)
}

watch(
  model,
  (newVal) => {
    if (newVal === null || newVal === undefined) {
      model.value = getDefaultValidationConfig()
      return
    }
    if (newVal.allowed_extensions === null) {
      newVal.allowed_extensions = []
    }
    if (newVal.key_usages === null) {
      newVal.key_usages = []
    }
    if (newVal.extended_key_usages === null) {
      newVal.extended_key_usages = []
    }
    if (newVal.san_validation) {
      if (newVal.san_validation.regex_list === null) {
        newVal.san_validation.regex_list = []
      }
      if (newVal.san_validation.http_checks === null) {
        newVal.san_validation.http_checks = []
      } else {
        newVal.san_validation.http_checks.forEach((check: any) => {
          if (check) {
            if (check.headers === null) {
              check.headers = []
            }
          }
        })
      }
      if (newVal.san_validation.script_checks === null) {
        newVal.san_validation.script_checks = []
      }
    }
    if (newVal.san_injection) {
      newVal.san_injection.forEach((injection: any) => {
        if (injection) {
          if (injection.templates === null) {
            injection.templates = []
          }
        }
      })
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
