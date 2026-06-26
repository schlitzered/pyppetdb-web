<template>
  <div
    ref="containerRef"
    class="w-full min-h-[400px] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
  ></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { onBeforeUnmount } from 'vue'
import { watch } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    return new editorWorker()
  }
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    language?: string
    readonly?: boolean
    highlightedLines?: number[]
  }>(),
  {
    language: 'json',
    readonly: false,
    highlightedLines: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'cursor-offset-change', offset: number): void
  (e: 'highlighted-lines-change', lines: number[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let observer: MutationObserver | null = null
let decorations: string[] = []

const updateDecorations = () => {
  if (!editor) return
  const newDecorations = (props.highlightedLines || []).map((line) => ({
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      className:
        'bg-yellow-500/20 dark:bg-yellow-500/10 border-l-4 border-yellow-500',
      glyphMarginClassName: 'pi pi-bookmark-fill text-yellow-500'
    }
  }))
  decorations = editor.deltaDecorations(decorations, newDecorations)
}

const getThemeName = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'vs-dark' : 'vs'
}

const handleRejection = (event: PromiseRejectionEvent) => {
  if (
    event.reason &&
    (event.reason.name === 'Canceled' || event.reason.message === 'Canceled')
  ) {
    event.preventDefault()
  }
}

const updateTheme = () => {
  if (editor) {
    const theme = getThemeName()
    monaco.editor.setTheme(theme)
  }
}

onMounted(() => {
  window.addEventListener('unhandledrejection', handleRejection)
  if (!containerRef.value) return

  const theme = getThemeName()

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: theme,
    readOnly: props.readonly,
    automaticLayout: true,
    glyphMargin: true,
    minimap: {
      enabled: false
    },
    wordBasedSuggestions: 'off',
    scrollBeyondLastLine: false,
    tabSize: 2
  })

  editor.onDidChangeModelContent(() => {
    const val = editor?.getValue() || ''
    emit('update:modelValue', val)
  })

  editor.onDidChangeCursorPosition((e) => {
    if (editor) {
      const model = editor.getModel()
      if (model) {
        const offset = model.getOffsetAt(e.position)
        emit('cursor-offset-change', offset)
      }
    }
  })

  editor.onMouseDown((e) => {
    if (!editor) return
    const target = e.target
    if (
      target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
      target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
    ) {
      const line = target.position?.lineNumber
      if (line) {
        const currentLines = [...(props.highlightedLines || [])]
        const idx = currentLines.indexOf(line)
        if (idx > -1) {
          currentLines.splice(idx, 1)
        } else {
          currentLines.push(line)
        }
        emit('highlighted-lines-change', currentLines)
      }
    }
  })

  updateDecorations()

  observer = new MutationObserver(() => {
    updateTheme()
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('unhandledrejection', handleRejection)
  if (editor) {
    const editorInstance = editor
    editor = null
    const model = editorInstance.getModel()
    setTimeout(() => {
      try {
        editorInstance.dispose()
      } catch {
        void 0
      }
      if (model) {
        try {
          model.dispose()
        } catch {
          void 0
        }
      }
    }, 0)
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editor && newVal !== editor.getValue()) {
      editor.setValue(newVal)
      updateDecorations()
    }
  }
)

watch(
  () => props.readonly,
  (newVal) => {
    if (editor) {
      editor.updateOptions({
        readOnly: newVal
      })
    }
  }
)

watch(
  () => props.highlightedLines,
  () => {
    updateDecorations()
  },
  { deep: true }
)
</script>
