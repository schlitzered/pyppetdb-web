<template>
  <div class="flex flex-col gap-6">
    <ResponsiveToolbar>
      <template #left>
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text p-button-secondary border border-zinc-700 text-zinc-300"
            @click="handleBack"
          />
          <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {{ title }}
          </h1>
        </div>
      </template>
    </ResponsiveToolbar>

    <Card
      class="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <template #content>
        <div v-if="!isNew" class="flex justify-end mb-4">
          <div class="flex items-center gap-2">
            <label
              for="modify-toggle"
              class="text-sm font-semibold text-zinc-500 dark:text-zinc-400"
            >
              Modify
            </label>
            <ToggleSwitch id="modify-toggle" v-model="isModifyMode" />
          </div>
        </div>

        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="level_id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Level ID *</label
              >
              <AutoComplete
                id="level_id"
                v-model="formData.level_id"
                :suggestions="levels"
                @complete="searchLevels"
                :dropdown="true"
                :complete-on-focus="true"
                :disabled="isFieldDisabled"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="key_id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Key ID *</label
              >
              <AutoComplete
                id="key_id"
                v-model="formData.key_id"
                :suggestions="keys"
                @complete="searchKeys"
                :dropdown="true"
                :complete-on-focus="true"
                :disabled="isFieldDisabled"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="data_id"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Data ID *</label
              >
              <InputText
                id="data_id"
                v-model="formData.id"
                disabled
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="priority"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Priority *</label
              >
              <InputNumber
                id="priority"
                v-model="formData.priority"
                disabled
                class="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div
            v-if="factFields.length > 0"
            class="flex flex-col gap-3 mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4"
          >
            <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              Facts (Required)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="field in factFields"
                :key="field"
                class="flex flex-col gap-1"
              >
                <label
                  :for="field"
                  class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Fact: {{ field }} *
                </label>
                <AutoComplete
                  :id="field"
                  v-model="factValues[field]"
                  :suggestions="factSuggestions[field] || []"
                  @complete="searchFactSuggestions($event, field)"
                  :dropdown="true"
                  :complete-on-focus="true"
                  :disabled="isFieldDisabled"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <div v-if="keyModelSchema" class="flex flex-col gap-2 mt-4">
            <div class="flex items-center justify-between">
              <span
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Hiera Value
              </span>
              <Button
                type="button"
                label="Expand Editor"
                icon="pi pi-expand"
                class="p-button-text p-button-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                @click="isEditorExpanded = true"
              />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
              <div class="lg:col-span-7 flex flex-col gap-1">
                <MonacoEditor
                  id="value"
                  v-model="jsonValueStr"
                  :readonly="isFieldDisabled"
                  :highlighted-lines="highlightedLines"
                  class="w-full h-[500px]"
                  @cursor-offset-change="handleCursorOffsetChange"
                  @highlighted-lines-change="handleHighlightedLinesChange"
                />
                <span
                  v-if="validationError"
                  class="text-xs text-rose-500 font-medium mt-1"
                >
                  {{ validationError }}
                </span>
              </div>

              <div
                class="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px]"
              >
                <div
                  class="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2"
                >
                  <span
                    class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                  >
                    Schema Context
                  </span>
                </div>

                <div v-if="currentSubSchema" class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-semibold text-zinc-500">
                      Current Path
                    </span>
                    <div
                      class="flex flex-wrap items-center gap-1 font-mono text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <span
                        class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded"
                        >root</span
                      >
                      <template v-for="part in currentJsonPath" :key="part">
                        <span class="text-zinc-400 font-sans">&gt;</span>
                        <span
                          class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-semibold"
                          >{{ part }}</span
                        >
                      </template>
                    </div>
                  </div>

                  <div class="flex flex-col gap-1 mt-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-base font-bold text-zinc-800 dark:text-zinc-100"
                      >
                        {{
                          currentSubSchema.title ||
                          currentJsonPath[currentJsonPath.length - 1] ||
                          'root'
                        }}
                      </span>
                      <span
                        class="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800/30"
                      >
                        {{ currentSubSchema.type || 'any' }}
                      </span>
                    </div>
                    <p
                      v-if="currentSubSchema.description"
                      class="text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      {{ currentSubSchema.description }}
                    </p>
                  </div>

                  <div
                    v-if="
                      currentSubSchema.type === 'object' &&
                      currentSubSchema.properties
                    "
                    class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
                  >
                    <span class="text-xs font-bold text-zinc-500">
                      Properties
                    </span>
                    <div
                      class="flex flex-col gap-2 max-h-[200px] overflow-y-auto"
                    >
                      <div
                        v-for="(
                          propVal, propKey
                        ) in currentSubSchema.properties"
                        :key="propKey"
                        class="flex flex-col gap-0.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded"
                      >
                        <div class="flex items-center gap-2">
                          <span
                            class="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200"
                            >{{ propKey }}</span
                          >
                          <span
                            class="text-[10px] px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500"
                            >{{ propVal.type || 'any' }}</span
                          >
                          <span
                            v-if="
                              currentSubSchema.required &&
                              currentSubSchema.required.includes(propKey)
                            "
                            class="text-[9px] font-bold text-rose-500"
                            >required</span
                          >
                        </div>
                        <span
                          v-if="propVal.description"
                          class="text-xs text-zinc-500"
                          >{{ propVal.description }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="currentSubSchema.items"
                    class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
                  >
                    <span class="text-xs font-bold text-zinc-500">
                      Array Items Schema
                    </span>
                    <div
                      class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex flex-col gap-1"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                          >Item Type:</span
                        >
                        <span
                          class="px-2 py-0.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400"
                        >
                          {{
                            resolveSchemaRefs(
                              currentSubSchema.items,
                              resolvedSchema
                            )?.type || 'any'
                          }}
                        </span>
                      </div>
                      <span
                        v-if="
                          resolveSchemaRefs(
                            currentSubSchema.items,
                            resolvedSchema
                          )?.description
                        "
                        class="text-xs text-zinc-500"
                      >
                        {{
                          resolveSchemaRefs(
                            currentSubSchema.items,
                            resolvedSchema
                          )?.description
                        }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="
                      currentSubSchema.enum ||
                      currentSubSchema.minimum !== undefined ||
                      currentSubSchema.maximum !== undefined ||
                      currentSubSchema.pattern
                    "
                    class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
                  >
                    <span class="text-xs font-bold text-zinc-500">
                      Validation Constraints
                    </span>
                    <div
                      class="flex flex-col gap-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <div
                        v-if="currentSubSchema.enum"
                        class="flex flex-col gap-1"
                      >
                        <span
                          class="text-sans text-xs text-zinc-500 font-semibold"
                          >Allowed values:</span
                        >
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="val in currentSubSchema.enum"
                            :key="String(val)"
                            class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-750"
                          >
                            {{ val }}
                          </span>
                        </div>
                      </div>
                      <div
                        v-if="currentSubSchema.minimum !== undefined"
                        class="flex justify-between"
                      >
                        <span>Minimum:</span>
                        <span class="font-bold">{{
                          currentSubSchema.minimum
                        }}</span>
                      </div>
                      <div
                        v-if="currentSubSchema.maximum !== undefined"
                        class="flex justify-between"
                      >
                        <span>Maximum:</span>
                        <span class="font-bold">{{
                          currentSubSchema.maximum
                        }}</span>
                      </div>
                      <div
                        v-if="currentSubSchema.pattern"
                        class="flex flex-col gap-1"
                      >
                        <span
                          class="text-sans text-xs text-zinc-500 font-semibold"
                          >Pattern (Regex):</span
                        >
                        <span
                          class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-bold break-all"
                          >{{ currentSubSchema.pattern }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
                  >
                    <span class="text-xs font-bold text-zinc-500">
                      Raw Sub-schema JSON
                    </span>
                    <pre
                      class="bg-zinc-900 text-zinc-100 p-3 rounded font-mono text-[10px] overflow-x-auto select-all max-h-[150px] border border-zinc-800"
                      >{{ JSON.stringify(currentSubSchema, null, 2) }}</pre
                    >
                  </div>
                </div>

                <div
                  v-else
                  class="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-650 gap-2"
                >
                  <i class="pi pi-info-circle text-2xl"></i>
                  <span class="text-xs text-center font-medium">
                    No schema context available.<br />Move cursor inside JSON
                    properties to view schema rules.
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="keyModelId"
              class="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-sm flex items-center justify-between"
            >
              <span class="text-zinc-600 dark:text-zinc-300">
                Validated against model:
                <router-link
                  :to="{
                    name:
                      keyModelType === 'static'
                        ? 'HieraKeyModelsStaticCRUD'
                        : 'HieraKeyModelsDynamicCRUD',
                    params: { key_model_id: keyModelId }
                  }"
                  class="underline text-blue-500 font-medium"
                  >{{ keyModelId }}</router-link
                >
              </span>
            </div>
          </div>

          <div v-if="!keyModelSchema" class="flex flex-col gap-1 mt-4">
            <div class="flex items-center justify-between">
              <label
                for="value"
                class="text-sm font-semibold text-zinc-600 dark:text-zinc-300"
                >Hiera Value (JSON format)</label
              >
              <Button
                type="button"
                label="Expand Editor"
                icon="pi pi-expand"
                class="p-button-text p-button-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                @click="isEditorExpanded = true"
              />
            </div>
            <MonacoEditor
              id="value"
              v-model="jsonValueStr"
              :readonly="isFieldDisabled"
              :highlighted-lines="highlightedLines"
              class="w-full"
              @highlighted-lines-change="handleHighlightedLinesChange"
            />
            <span
              v-if="validationError"
              class="text-xs text-rose-500 font-medium mt-1"
            >
              {{ validationError }}
            </span>
          </div>

          <div
            class="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <Button
              v-if="canDelete"
              label="Delete"
              icon="pi pi-trash"
              class="bg-rose-600 hover:bg-rose-700 text-white border-none px-4 py-2"
              @click="handleDelete"
            />
            <div v-else></div>

            <div class="flex gap-3">
              <Button
                label="Cancel"
                class="p-button-text p-button-secondary border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2"
                @click="handleCancel"
              />
              <Button
                v-if="isNew || isModifyMode"
                type="submit"
                label="Save"
                icon="pi pi-check"
                class="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white border-none px-4 py-2 font-medium"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>

    <Dialog
      v-model:visible="isEditorExpanded"
      header="Hiera Value Editor"
      :modal="true"
      :maximizable="true"
      :maximized="true"
      dismissableMask
      class="w-full h-full"
    >
      <div
        v-if="keyModelSchema"
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full mt-2"
      >
        <div class="lg:col-span-7 flex flex-col gap-1 h-full">
          <MonacoEditor
            v-model="jsonValueStr"
            :readonly="isFieldDisabled"
            :highlighted-lines="highlightedLines"
            class="w-full h-[calc(100vh-140px)]"
            @cursor-offset-change="handleCursorOffsetChange"
            @highlighted-lines-change="handleHighlightedLinesChange"
          />
          <span
            v-if="validationError"
            class="text-xs text-rose-500 font-medium mt-1"
          >
            {{ validationError }}
          </span>
        </div>

        <div
          class="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-140px)]"
        >
          <div
            class="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2"
          >
            <span
              class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
            >
              Schema Context
            </span>
          </div>

          <div v-if="currentSubSchema" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-zinc-500">
                Current Path
              </span>
              <div
                class="flex flex-wrap items-center gap-1 font-mono text-xs text-zinc-700 dark:text-zinc-300"
              >
                <span class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded"
                  >root</span
                >
                <template v-for="part in currentJsonPath" :key="part">
                  <span class="text-zinc-400 font-sans">&gt;</span>
                  <span
                    class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-semibold"
                    >{{ part }}</span
                  >
                </template>
              </div>
            </div>

            <div class="flex flex-col gap-1 mt-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-base font-bold text-zinc-800 dark:text-zinc-100"
                >
                  {{
                    currentSubSchema.title ||
                    currentJsonPath[currentJsonPath.length - 1] ||
                    'root'
                  }}
                </span>
                <span
                  class="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800/30"
                >
                  {{ currentSubSchema.type || 'any' }}
                </span>
              </div>
              <p
                v-if="currentSubSchema.description"
                class="text-sm text-zinc-600 dark:text-zinc-400"
              >
                {{ currentSubSchema.description }}
              </p>
            </div>

            <div
              v-if="
                currentSubSchema.type === 'object' &&
                currentSubSchema.properties
              "
              class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
            >
              <span class="text-xs font-bold text-zinc-500"> Properties </span>
              <div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                <div
                  v-for="(propVal, propKey) in currentSubSchema.properties"
                  :key="propKey"
                  class="flex flex-col gap-0.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200"
                      >{{ propKey }}</span
                    >
                    <span
                      class="text-[10px] px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500"
                      >{{ propVal.type || 'any' }}</span
                    >
                    <span
                      v-if="
                        currentSubSchema.required &&
                        currentSubSchema.required.includes(propKey)
                      "
                      class="text-[9px] font-bold text-rose-500"
                      >required</span
                    >
                  </div>
                  <span
                    v-if="propVal.description"
                    class="text-xs text-zinc-500"
                    >{{ propVal.description }}</span
                  >
                </div>
              </div>
            </div>

            <div
              v-if="currentSubSchema.items"
              class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
            >
              <span class="text-xs font-bold text-zinc-500">
                Array Items Schema
              </span>
              <div
                class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex flex-col gap-1"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >Item Type:</span
                  >
                  <span
                    class="px-2 py-0.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400"
                  >
                    {{
                      resolveSchemaRefs(currentSubSchema.items, resolvedSchema)
                        ?.type || 'any'
                    }}
                  </span>
                </div>
                <span
                  v-if="
                    resolveSchemaRefs(currentSubSchema.items, resolvedSchema)
                      ?.description
                  "
                  class="text-xs text-zinc-500"
                >
                  {{
                    resolveSchemaRefs(currentSubSchema.items, resolvedSchema)
                      ?.description
                  }}
                </span>
              </div>
            </div>

            <div
              v-if="
                currentSubSchema.enum ||
                currentSubSchema.minimum !== undefined ||
                currentSubSchema.maximum !== undefined ||
                currentSubSchema.pattern
              "
              class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
            >
              <span class="text-xs font-bold text-zinc-500">
                Validation Constraints
              </span>
              <div
                class="flex flex-col gap-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300"
              >
                <div v-if="currentSubSchema.enum" class="flex flex-col gap-1">
                  <span class="text-sans text-xs text-zinc-500 font-semibold"
                    >Allowed values:</span
                  >
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="val in currentSubSchema.enum"
                      :key="String(val)"
                      class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      {{ val }}
                    </span>
                  </div>
                </div>
                <div
                  v-if="currentSubSchema.minimum !== undefined"
                  class="flex justify-between"
                >
                  <span>Minimum:</span>
                  <span class="font-bold">{{ currentSubSchema.minimum }}</span>
                </div>
                <div
                  v-if="currentSubSchema.maximum !== undefined"
                  class="flex justify-between"
                >
                  <span>Maximum:</span>
                  <span class="font-bold">{{ currentSubSchema.maximum }}</span>
                </div>
                <div
                  v-if="currentSubSchema.pattern"
                  class="flex flex-col gap-1"
                >
                  <span class="text-sans text-xs text-zinc-500 font-semibold"
                    >Pattern (Regex):</span
                  >
                  <span
                    class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-bold break-all"
                    >{{ currentSubSchema.pattern }}</span
                  >
                </div>
              </div>
            </div>

            <div
              class="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3"
            >
              <span class="text-xs font-bold text-zinc-500">
                Raw Sub-schema JSON
              </span>
              <pre
                class="bg-zinc-900 text-zinc-100 p-3 rounded font-mono text-[10px] overflow-x-auto select-all max-h-[150px] border border-zinc-800"
                >{{ JSON.stringify(currentSubSchema, null, 2) }}</pre
              >
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-650 gap-2"
          >
            <i class="pi pi-info-circle text-2xl"></i>
            <span class="text-xs text-center font-medium">
              No schema context available.<br />Move cursor inside JSON
              properties to view schema rules.
            </span>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-1 h-full mt-2">
        <MonacoEditor
          v-model="jsonValueStr"
          :readonly="isFieldDisabled"
          :highlighted-lines="highlightedLines"
          class="w-full h-[calc(100vh-140px)]"
          @highlighted-lines-change="handleHighlightedLinesChange"
        />
        <span
          v-if="validationError"
          class="text-xs text-rose-500 font-medium mt-1"
        >
          {{ validationError }}
        </span>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onMounted } from 'vue'
import { reactive } from 'vue'
import { ref } from 'vue'
import { watch } from 'vue'
import Ajv from 'ajv'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import MonacoEditor from '@/components/shared/MonacoEditor.vue'
import ToggleSwitch from 'primevue/toggleswitch'
import AutoComplete from 'primevue/autocomplete'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ResponsiveToolbar from '@/components/shared/ResponsiveToolbar.vue'
import api from '@/api/client'
import { authStore } from '@/stores/auth'
import type { ResourceDefinition } from '@/types/resources'

const props = defineProps<{
  resourceDef: ResourceDefinition
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const auth = authStore()

const isNew = computed(
  () => route.params.data_id === '_new' || !route.params.data_id
)
const isModifyMode = ref(false)
const isEditorExpanded = ref(false)
const highlightedLines = ref<number[]>(
  route.query.lines
    ? String(route.query.lines)
        .split(',')
        .map((x) => parseInt(x, 10))
        .filter((x) => !isNaN(x))
    : []
)

const handleHighlightedLinesChange = (lines: number[]) => {
  highlightedLines.value = lines
}

watch(
  () => highlightedLines.value,
  (lines) => {
    const query = { ...route.query }
    if (lines && lines.length > 0) {
      query.lines = lines.join(',')
    } else {
      delete query.lines
    }
    router.replace({ query })
  },
  { deep: true }
)

watch(
  () => route.query.lines,
  (newLines) => {
    const list = newLines
      ? String(newLines)
          .split(',')
          .map((x) => parseInt(x, 10))
          .filter((x) => !isNaN(x))
      : []
    const isSame =
      list.length === highlightedLines.value.length &&
      list.every((val, index) => val === highlightedLines.value[index])
    if (!isSame) {
      highlightedLines.value = list
    }
  }
)

const isFieldDisabled = computed(() => {
  if (isNew.value) return false
  return !isModifyMode.value
})

const formData = reactive<Record<string, any>>({
  level_id: '',
  id: '',
  key_id: '',
  priority: 0,
  data: null
})

const jsonValueStr = ref('')

const cursorOffset = ref(0)

const handleCursorOffsetChange = (offset: number) => {
  cursorOffset.value = offset
}

const resolveSchemaRefs = (schema: any, rootSchema: any): any => {
  if (!schema) return null
  if (schema.$ref && schema.$ref.startsWith('#/$defs/')) {
    const defName = schema.$ref.split('/').pop()
    if (
      defName &&
      rootSchema &&
      rootSchema.$defs &&
      rootSchema.$defs[defName]
    ) {
      return resolveSchemaRefs(
        {
          ...rootSchema.$defs[defName],
          $defs: rootSchema.$defs
        },
        rootSchema
      )
    }
  }
  return schema
}

const getSchemaForPath = (schema: any, path: string[]): any => {
  if (!schema) return null
  let current = resolveSchemaRefs(schema, schema)
  for (const part of path) {
    if (!current) return null
    const hasProperty =
      current.properties && current.properties[part] !== undefined
    const isObject =
      current.type === 'object' ||
      (Array.isArray(current.type) && current.type.includes('object')) ||
      current.properties !== undefined
    const isArray =
      current.type === 'array' ||
      (Array.isArray(current.type) && current.type.includes('array')) ||
      current.items !== undefined

    if (isObject && hasProperty) {
      current = resolveSchemaRefs(current.properties[part], schema)
    } else if (isArray && current.items) {
      if (Array.isArray(current.items)) {
        const idx = parseInt(part, 10)
        if (!isNaN(idx) && current.items[idx] !== undefined) {
          current = resolveSchemaRefs(current.items[idx], schema)
        } else {
          return null
        }
      } else {
        current = resolveSchemaRefs(current.items, schema)
      }
    } else {
      return null
    }
  }
  return current
}

const parseJsonRanges = (
  json: string
): Array<{ path: string[]; start: number; end: number }> => {
  const ranges: Array<{ path: string[]; start: number; end: number }> = []
  let index = 0

  const skipWhitespace = () => {
    while (index < json.length && /\s/.test(json[index])) {
      index++
    }
  }

  const parseValue = (currentPath: string[], startPos: number) => {
    skipWhitespace()
    if (index >= json.length) return

    const char = json[index]
    if (char === '{') {
      parseObject(currentPath)
    } else if (char === '[') {
      parseArray(currentPath)
    } else if (char === '"') {
      parseString()
    } else {
      while (
        index < json.length &&
        !/[{}[\]:,]/.test(json[index]) &&
        !/\s/.test(json[index])
      ) {
        index++
      }
    }
    const endPos = index
    ranges.push({
      path: currentPath,
      start: startPos,
      end: endPos
    })
  }

  const parseString = (): string => {
    const start = index
    index++
    while (index < json.length) {
      if (json[index] === '\\') {
        index += 2
      } else if (json[index] === '"') {
        index++
        break
      } else {
        index++
      }
    }
    return json.substring(start + 1, index - 1)
  }

  const parseObject = (currentPath: string[]) => {
    index++
    while (index < json.length) {
      skipWhitespace()
      if (json[index] === '}') {
        index++
        break
      }
      if (json[index] === '"') {
        const keyStart = index
        const key = parseString()
        const keyEnd = index
        ranges.push({
          path: [...currentPath, key],
          start: keyStart,
          end: keyEnd
        })
        skipWhitespace()
        if (json[index] === ':') {
          index++
          skipWhitespace()
          const valueStart = index
          parseValue([...currentPath, key], valueStart)
        }
      } else {
        index++
      }
      skipWhitespace()
      if (json[index] === ',') {
        index++
      }
    }
  }

  const parseArray = (currentPath: string[]) => {
    index++
    let arrayIndex = 0
    while (index < json.length) {
      skipWhitespace()
      if (json[index] === ']') {
        index++
        break
      }
      const valueStart = index
      parseValue([...currentPath, String(arrayIndex)], valueStart)
      arrayIndex++
      skipWhitespace()
      if (json[index] === ',') {
        index++
      }
    }
  }

  try {
    parseValue([], 0)
  } catch {
    void 0
  }

  return ranges
}

const getPathAtOffset = (json: string, offset: number): string[] => {
  const ranges = parseJsonRanges(json)
  let bestMatch: { path: string[]; start: number; end: number } | null = null
  for (const range of ranges) {
    if (offset >= range.start && offset <= range.end) {
      if (
        !bestMatch ||
        range.end - range.start < bestMatch.end - bestMatch.start
      ) {
        bestMatch = range
      }
    }
  }
  return bestMatch ? bestMatch.path : []
}

const currentJsonPath = computed(() => {
  return getPathAtOffset(jsonValueStr.value, cursorOffset.value)
})

const currentSubSchema = computed(() => {
  if (!resolvedSchema.value) return null
  return getSchemaForPath(resolvedSchema.value, currentJsonPath.value)
})

const levels = ref<string[]>()
const keys = ref<string[]>()

const title = computed(() => {
  if (isNew.value) {
    return 'New Hiera Level Data'
  }
  return `Level Data ${route.params.level_id}/${route.params.data_id}/${route.params.key_id}`
})

const handleBack = () => {
  router.push({
    name: props.resourceDef.routeNames.search
  })
}

const factValues = reactive<Record<string, string>>({})
const factSuggestions = reactive<Record<string, string[]>>({})

const factFields = computed(() => {
  if (!formData.level_id) return []
  const regex = /\{([^}]+)\}/g
  const fields = []
  let match
  while ((match = regex.exec(formData.level_id)) !== null) {
    fields.push(match[1])
  }
  return fields
})

watch(
  factFields,
  (newFields) => {
    Object.keys(factValues).forEach((key) => {
      if (!newFields.includes(key)) {
        delete factValues[key]
      }
    })
    Object.keys(factSuggestions).forEach((key) => {
      if (!newFields.includes(key)) {
        delete factSuggestions[key]
      }
    })
    newFields.forEach((field) => {
      if (!(field in factValues)) {
        factValues[field] = ''
      }
      if (!(field in factSuggestions)) {
        factSuggestions[field] = []
      }
    })
  },
  {
    immediate: true
  }
)

const autoGeneratedDataId = computed(() => {
  if (!formData.level_id) return ''
  let dataId = formData.level_id
  factFields.value.forEach((field) => {
    const value = factValues[field] || ''
    dataId = dataId.replace(`{${field}}`, value)
  })
  return dataId
})

watch(autoGeneratedDataId, (newValue) => {
  if (isNew.value) {
    formData.id = newValue
  }
})

watch(
  () => formData.level_id,
  async (newLevelId) => {
    if (isNew.value && newLevelId) {
      try {
        const levelData = await api.get<{ priority: number }>(
          `/api/v1/hiera/levels/${encodeURIComponent(newLevelId)}`,
          undefined,
          true
        )
        if (levelData && levelData.priority !== undefined) {
          formData.priority = levelData.priority
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
)

const searchFactSuggestions = async (
  event: { query: string },
  field: string
) => {
  try {
    const params: Record<string, any> = {
      fact_id: field,
      limit: 10,
      sort_by: 'value',
      sort_order: 'ascending'
    }
    const response = await api.get<{ result: Array<{ value: any }> }>(
      '/api/v1/nodes/_distinct_fact_values',
      params,
      true
    )
    if (response && response.result) {
      const allValues = response.result.map((item) => String(item.value))
      if (event.query) {
        const queryLower = event.query.toLowerCase()
        const filtered = allValues.filter((val) =>
          val.toLowerCase().includes(queryLower)
        )
        if (!filtered.some((x) => x.toLowerCase() === queryLower)) {
          filtered.push(event.query)
        }
        factSuggestions[field] = filtered
      } else {
        factSuggestions[field] = allValues
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function normalizeSchema(schema: any): any {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema
  }

  const newSchema = JSON.parse(JSON.stringify(schema))

  const walk = (s: any) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return

    const nullableFields = new Set<string>()

    if (s.properties) {
      for (const [key, propSchema] of Object.entries(s.properties)) {
        let isNullable = false
        if (propSchema && typeof propSchema === 'object') {
          const prop = propSchema as Record<string, any>
          if (Array.isArray(prop.anyOf)) {
            isNullable = prop.anyOf.some(
              (branch: any) => branch.type === 'null'
            )
          } else if (Array.isArray(prop.type)) {
            isNullable = prop.type.includes('null')
          }
        }

        if (isNullable) {
          nullableFields.add(key)
        }
        walk(propSchema)
      }
    }

    if (s.required && Array.isArray(s.required)) {
      s.required = s.required.filter(
        (field: string) => !nullableFields.has(field)
      )
      if (s.required.length === 0) {
        delete s.required
      }
    }

    if (Array.isArray(s.anyOf)) {
      const nonNullTypes = s.anyOf.filter(
        (branch: any) => branch.type !== 'null'
      )
      const hasNull = s.anyOf.some((branch: any) => branch.type === 'null')

      if (hasNull && nonNullTypes.length === 1) {
        const actual = nonNullTypes[0]
        delete s.anyOf

        const title = s.title
        const description = s.description
        const defValue = s.default

        Object.assign(s, actual)

        if (title) s.title = title
        if (description) s.description = description
        if (defValue !== undefined) s.default = defValue

        if (Array.isArray(s.enum)) {
          s.oneOf = s.enum.map((v: any) => ({
            const: v,
            title: v === null ? 'null' : String(v)
          }))
          if (!s.oneOf.some((o: any) => o.const === null)) {
            s.oneOf.push({ const: null, title: 'null' })
          }
          delete s.enum
          delete s.type
        } else if (
          s.type &&
          !['object', 'array'].includes(s.type) &&
          !Array.isArray(s.type)
        ) {
          s.type = [s.type, 'null']
        }
      }
    }

    if (s.properties) {
      Object.values(s.properties).forEach(walk)
    }
    if (s.items) {
      walk(s.items)
    }
    if (s.$defs) {
      Object.values(s.$defs).forEach(walk)
    }
  }

  walk(newSchema)
  return newSchema
}

const resolvedSchema = computed(() => {
  if (
    !keyModelSchema.value ||
    !keyModelSchema.value.properties ||
    !keyModelSchema.value.properties.data
  ) {
    return null
  }

  const baseSchema = keyModelSchema.value.properties.data
  let finalSchema = null

  if (baseSchema.$ref && baseSchema.$ref.startsWith('#/$defs/')) {
    const defName = baseSchema.$ref.split('/').pop()
    if (
      defName &&
      keyModelSchema.value.$defs &&
      keyModelSchema.value.$defs[defName]
    ) {
      finalSchema = {
        ...keyModelSchema.value.$defs[defName],
        $defs: keyModelSchema.value.$defs
      }
    }
  }

  if (!finalSchema) {
    finalSchema = {
      ...baseSchema,
      $defs: keyModelSchema.value.$defs
    }
  }

  return normalizeSchema(finalSchema)
})

const keyModelSchema = ref<any>(null)
const keyModelId = ref<string | null>(null)
const keyModelType = ref<string | null>(null)
const validationError = ref<string | null>(null)

watch(
  () => formData.key_id,
  async (newKeyId) => {
    if (!newKeyId) {
      keyModelSchema.value = null
      keyModelId.value = null
      keyModelType.value = null
      return
    }
    try {
      const keyData = await api.get<{ key_model_id: string }>(
        `/api/v1/hiera/keys/${encodeURIComponent(newKeyId)}`,
        undefined,
        true
      )
      if (keyData && keyData.key_model_id) {
        keyModelId.value = keyData.key_model_id
        const type = keyData.key_model_id.startsWith('static:')
          ? 'static'
          : 'dynamic'
        keyModelType.value = type
        const endpoint = `/api/v1/hiera/key_models/${type}/${encodeURIComponent(keyData.key_model_id)}`
        const modelData = await api.get<{ model: any }>(
          endpoint,
          undefined,
          true
        )
        if (modelData && modelData.model) {
          keyModelSchema.value = modelData.model
        }
      }
    } catch {
      keyModelSchema.value = null
      keyModelId.value = null
      keyModelType.value = null
    }
  },
  {
    immediate: true
  }
)

watch([jsonValueStr, keyModelSchema], ([newVal, schema]) => {
  if (!newVal) {
    validationError.value = null
    return
  }
  let parsed = null
  try {
    parsed = JSON.parse(newVal)
    validationError.value = null
  } catch {
    validationError.value = 'Invalid JSON format'
    return
  }

  if (schema) {
    try {
      const ajv = new Ajv()
      const validate = ajv.compile(schema)
      const wrappedData = {
        data: parsed
      }
      const valid = validate(wrappedData)
      if (!valid) {
        validationError.value = `Schema validation failed: ${ajv.errorsText(validate.errors)}`
      } else {
        validationError.value = null
      }
    } catch (e: any) {
      validationError.value = `Schema compile error: ${e.message}`
    }
  }
})

interface AutocompleteSearchEvent {
  query: string
}

const searchLevels = async (event: AutocompleteSearchEvent) => {
  try {
    const params: Record<string, any> = {
      limit: 10,
      sort_by: 'id',
      sort_order: 'ascending'
    }
    if (event.query) {
      params.level_id = event.query
    }
    const res = await api.get<{ result?: Array<{ id: string }> }>(
      '/api/v1/hiera/levels',
      params,
      true
    )
    if (res && res.result) {
      levels.value = res.result.map((l) => String(l.id))
    }
  } catch (error) {
    console.error(error)
  }
}

const searchKeys = async (event: AutocompleteSearchEvent) => {
  try {
    const params: Record<string, any> = {
      limit: 10,
      sort_by: 'id',
      sort_order: 'ascending'
    }
    if (event.query) {
      params.key_id = event.query
    }
    const res = await api.get<{ result?: Array<{ id: string }> }>(
      '/api/v1/hiera/keys',
      params,
      true
    )
    if (res && res.result) {
      keys.value = res.result.map((k) => String(k.id))
    }
  } catch (error) {
    console.error(error)
  }
}

const loadData = async () => {
  if (isNew.value) {
    const levelId = String(route.params.level_id || '')
    formData.level_id = levelId === '_new' ? '' : levelId
    formData.id = ''
    const keyId = String(route.params.key_id || '')
    formData.key_id = keyId === '_new' ? '' : keyId
    formData.priority = 0
    formData.data = null
    jsonValueStr.value = ''
  } else {
    try {
      const endpoint = `/api/v1/hiera/data/${encodeURIComponent(String(route.params.level_id))}/${encodeURIComponent(String(route.params.data_id))}/${encodeURIComponent(String(route.params.key_id))}`
      const res = await api.get<Record<string, unknown>>(endpoint)
      if (res) {
        Object.assign(formData, res)
        jsonValueStr.value = JSON.stringify(res.data, null, 2)
        if (res.facts) {
          Object.entries(res.facts).forEach(([key, value]) => {
            factValues[key] = String(value)
          })
        }
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load Hiera level data',
        life: 3000
      })
    }
  }
}

const canDelete = computed(() => {
  if (isNew.value) return false
  const deletePerm = props.resourceDef.permissions.delete
  if (!deletePerm) return false
  return deletePerm(auth.hasPermission, formData)
})

const handleSave = async () => {
  if (validationError.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: validationError.value,
      life: 5000
    })
    return
  }
  try {
    let parsedVal = null
    if (jsonValueStr.value) {
      parsedVal = JSON.parse(jsonValueStr.value)
    }
    formData.data = parsedVal
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Hiera value must be valid JSON',
      life: 3000
    })
    return
  }

  try {
    if (isNew.value) {
      const endpoint = `/api/v1/hiera/data/${encodeURIComponent(String(formData.level_id))}/${encodeURIComponent(String(formData.id))}/${encodeURIComponent(String(formData.key_id))}`
      const facts: Record<string, string> = {}
      factFields.value.forEach((field) => {
        facts[field] = factValues[field] || ''
      })
      const payload = {
        facts: facts,
        data: formData.data
      }
      await api.post(endpoint, payload)
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Hiera data created successfully',
        life: 3000
      })
      router.push({ name: props.resourceDef.routeNames.search })
    } else {
      const endpoint = `/api/v1/hiera/data/${encodeURIComponent(String(route.params.level_id))}/${encodeURIComponent(String(route.params.data_id))}/${encodeURIComponent(String(route.params.key_id))}`
      const payload = {
        data: formData.data
      }
      await api.put(endpoint, payload)
      isModifyMode.value = false
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Hiera data updated successfully',
        life: 3000
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Hiera data',
      life: 3000
    })
  }
}

const handleDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this Hiera data?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const endpoint = `/api/v1/hiera/data/${encodeURIComponent(String(route.params.level_id))}/${encodeURIComponent(String(route.params.data_id))}/${encodeURIComponent(String(route.params.key_id))}`
        await api.delete(endpoint)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Hiera data deleted successfully',
          life: 3000
        })
        router.push({ name: props.resourceDef.routeNames.search })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete Hiera data',
          life: 3000
        })
      }
    }
  })
}

const handleCancel = () => {
  if (isNew.value) {
    router.push({ name: props.resourceDef.routeNames.search })
  } else {
    isModifyMode.value = false
    loadData()
  }
}

watch(
  () => [route.params.level_id, route.params.data_id, route.params.key_id],
  () => {
    loadData()
  }
)

onMounted(() => {
  loadData()
})
</script>

<style scoped>
:deep(.control) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
:deep(.control .label),
:deep(.control label) {
  font-size: 0.875rem;
  font-weight: 600;
  color: #52525b;
}
:global(.dark) :deep(.control .label),
:global(.dark) :deep(.control label) {
  color: #d4d4d8;
}
:deep(.control input),
:deep(.control .input),
:deep(.control select),
:deep(.control textarea) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d4d4d8;
  background-color: #fafafa;
  color: #18181b;
  font-size: 0.875rem;
}
:global(.dark) :deep(.control input),
:global(.dark) :deep(.control .input),
:global(.dark) :deep(.control select),
:global(.dark) :deep(.control textarea) {
  border-color: #27272a;
  background-color: #18181b;
  color: #f4f4f5;
}
:deep(.control input:focus),
:deep(.control .input:focus),
:deep(.control select:focus),
:deep(.control textarea:focus) {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #18181b;
}
:global(.dark) :deep(.control input:focus),
:global(.dark) :deep(.control .input:focus),
:global(.dark) :deep(.control select:focus),
:global(.dark) :deep(.control textarea:focus) {
  border-color: #3f3f46;
}
</style>
