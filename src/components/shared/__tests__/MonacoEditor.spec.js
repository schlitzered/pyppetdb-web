import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import * as monaco from 'monaco-editor'
import MonacoEditor from '../MonacoEditor.vue'

vi.mock(
  'monaco-editor/esm/vs/editor/editor.worker?worker',
  () => {
    return {
      default: class {}
    }
  }
)

vi.mock(
  'monaco-editor/esm/vs/language/json/json.worker?worker',
  () => {
    return {
      default: class {}
    }
  }
)

const mockEditor = {
  getValue: vi.fn().mockReturnValue(''),
  setValue: vi.fn(),
  onDidChangeModelContent: vi.fn().mockImplementation(
    (cb) => {
      mockEditor._onDidChangeModelContentCb = cb
      return {
        dispose: vi.fn()
      }
    }
  ),
  onDidChangeCursorPosition: vi.fn().mockImplementation(
    (cb) => {
      mockEditor._onDidChangeCursorPositionCb = cb
      return {
        dispose: vi.fn()
      }
    }
  ),
  onMouseDown: vi.fn().mockImplementation(
    (cb) => {
      mockEditor._onMouseDownCb = cb
      return {
        dispose: vi.fn()
      }
    }
  ),
  getModel: vi.fn().mockReturnValue({
    getOffsetAt: vi.fn().mockReturnValue(42),
    dispose: vi.fn()
  }),
  deltaDecorations: vi.fn().mockReturnValue([]),
  updateOptions: vi.fn(),
  dispose: vi.fn(),
  _onDidChangeModelContentCb: null,
  _onDidChangeCursorPositionCb: null,
  _onMouseDownCb: null
}

vi.mock(
  'monaco-editor',
  () => {
    return {
      editor: {
        create: vi.fn().mockImplementation(
          () => {
            return mockEditor
          }
        ),
        setTheme: vi.fn(),
        MouseTargetType: {
          GUTTER_LINE_NUMBERS: 1,
          GUTTER_GLYPH_MARGIN: 2
        }
      },
      Range: class {
        constructor(
          startLineNumber,
          startColumn,
          endLineNumber,
          endColumn
        ) {
          this.startLineNumber = startLineNumber
          this.startColumn = startColumn
          this.endLineNumber = endLineNumber
          this.endColumn = endColumn
        }
      }
    }
  }
)

describe(
  'MonacoEditor',
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks()
        mockEditor.getValue.mockReturnValue('')
        mockEditor._onDidChangeModelContentCb = null
        mockEditor._onDidChangeCursorPositionCb = null
        mockEditor._onMouseDownCb = null
      }
    )

    it(
      'renders container div and initializes editor',
      () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{"foo": "bar"}',
              language: 'json'
            }
          }
        )

        expect(
          wrapper.find('div').exists()
        ).toBe(true)

        expect(
          monaco.editor.create
        ).toHaveBeenCalled()
      }
    )

    it(
      'watches modelValue and calls setValue when updated',
      async () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{"foo": "bar"}'
            }
          }
        )

        mockEditor.getValue.mockReturnValue('{"foo": "bar"}')
        await wrapper.setProps({
          modelValue: '{"foo": "baz"}'
        })

        expect(
          mockEditor.setValue
        ).toHaveBeenCalledWith('{"foo": "baz"}')
      }
    )

    it(
      'watches readonly and calls updateOptions when updated',
      async () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}',
              readonly: false
            }
          }
        )

        await wrapper.setProps({
          readonly: true
        })

        expect(
          mockEditor.updateOptions
        ).toHaveBeenCalledWith({
          readOnly: true
        })
      }
    )

    it(
      'emits update:modelValue on editor content changes',
      () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}'
            }
          }
        )

        expect(
          mockEditor._onDidChangeModelContentCb
        ).not.toBeNull()

        mockEditor.getValue.mockReturnValue('{"changed": true}')
        mockEditor._onDidChangeModelContentCb()

        expect(
          wrapper.emitted('update:modelValue')[0]
        ).toEqual([
          '{"changed": true}'
        ])
      }
    )

    it(
      'emits cursor-offset-change on cursor position changes',
      () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}'
            }
          }
        )

        expect(
          mockEditor._onDidChangeCursorPositionCb
        ).not.toBeNull()

        mockEditor._onDidChangeCursorPositionCb({
          position: {
            lineNumber: 1,
            column: 2
          }
        })

        expect(
          wrapper.emitted('cursor-offset-change')[0]
        ).toEqual([
          42
        ])
      }
    )

    it(
      'emits highlighted-lines-change when gutter is clicked',
      () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}',
              highlightedLines: [1]
            }
          }
        )

        expect(
          mockEditor._onMouseDownCb
        ).not.toBeNull()

        mockEditor._onMouseDownCb({
          target: {
            type: monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS,
            position: {
              lineNumber: 1
            }
          }
        })

        expect(
          wrapper.emitted('highlighted-lines-change')[0]
        ).toEqual([
          []
        ])

        mockEditor._onMouseDownCb({
          target: {
            type: monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS,
            position: {
              lineNumber: 2
            }
          }
        })

        expect(
          wrapper.emitted('highlighted-lines-change')[1]
        ).toEqual([
          [1, 2]
        ])
      }
    )

    it(
      'defines MonacoEnvironment getWorker',
      () => {
        expect(
          window.MonacoEnvironment
        ).toBeDefined()
        const worker1 = window.MonacoEnvironment.getWorker(
          null,
          'json'
        )
        expect(
          worker1
        ).toBeDefined()
        const worker2 = window.MonacoEnvironment.getWorker(
          null,
          'css'
        )
        expect(
          worker2
        ).toBeDefined()
      }
    )

    it(
      'handles promise rejection cancelation',
      () => {
        const preventDefault = vi.fn()
        const event = new Event(
          'unhandledrejection'
        )
        Object.defineProperty(
          event,
          'reason',
          {
            value: {
              name: 'Canceled'
            }
          }
        )
        Object.defineProperty(
          event,
          'preventDefault',
          {
            value: preventDefault
          }
        )
        window.dispatchEvent(
          event
        )
        expect(
          preventDefault
        ).toHaveBeenCalled()
      }
    )

    it(
      'handles promise rejection cancelation message',
      () => {
        const preventDefault = vi.fn()
        const event = new Event(
          'unhandledrejection'
        )
        Object.defineProperty(
          event,
          'reason',
          {
            value: {
              message: 'Canceled'
            }
          }
        )
        Object.defineProperty(
          event,
          'preventDefault',
          {
            value: preventDefault
          }
        )
        window.dispatchEvent(
          event
        )
        expect(
          preventDefault
        ).toHaveBeenCalled()
      }
    )

    it(
      'ignores other promise rejections',
      () => {
        const preventDefault = vi.fn()
        const event = new Event(
          'unhandledrejection'
        )
        Object.defineProperty(
          event,
          'reason',
          {
            value: {
              name: 'Other'
            }
          }
        )
        Object.defineProperty(
          event,
          'preventDefault',
          {
            value: preventDefault
          }
        )
        window.dispatchEvent(
          event
        )
        expect(
          preventDefault
        ).not.toHaveBeenCalled()
      }
    )

    it(
      'updates theme when dark class changes',
      async () => {
        mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}'
            }
          }
        )
        document.documentElement.classList.add(
          'dark'
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          monaco.editor.setTheme
        ).toHaveBeenCalledWith(
          'vs-dark'
        )
        document.documentElement.classList.remove(
          'dark'
        )
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              0
            )
          }
        )
        expect(
          monaco.editor.setTheme
        ).toHaveBeenCalledWith(
          'vs'
        )
      }
    )

    it(
      'cleans up editor and observer on unmount',
      () => {
        vi.useFakeTimers()
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}'
            }
          }
        )
        wrapper.unmount()
        vi.runAllTimers()
        vi.useRealTimers()
        expect(
          mockEditor.dispose
        ).toHaveBeenCalled()
      }
    )

    it(
      'watches highlightedLines and updates decorations',
      async () => {
        const wrapper = mount(
          MonacoEditor,
          {
            props: {
              modelValue: '{}',
              highlightedLines: [1]
            }
          }
        )
        await wrapper.setProps({
          highlightedLines: [1, 2]
        })
        expect(
          mockEditor.deltaDecorations
        ).toHaveBeenCalled()
      }
    )
  }
)
