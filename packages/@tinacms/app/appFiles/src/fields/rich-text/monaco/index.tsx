/**



*/

import React from 'react'
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react'
/**
 * MDX is built directly to the app because of how we load dependencies.
 * Since we drop the package.json in to the end users folder, we can't
 * easily install the current version of the mdx package in all scenarios
 * (when we're working in the monorepo, or working with a tagged npm version)
 */
import { parseMDX, stringifyMDX } from './mdx'
import { useDebounce } from './use-debounce'
import type * as monaco from 'monaco-editor'
import {
  buildError,
  ErrorMessage,
  InvalidMarkdownElement,
} from './error-message'
import { RichTextType } from 'tinacms'

export const uuid = () => {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
}

type Monaco = typeof monaco

// 0.33.0 has a bug https://github.com/microsoft/monaco-editor/issues/2947
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs' },
})

/**
 * Since monaco lazy-loads we may have a delay from when the block is inserted
 * to when monaco has intantiated, keep trying to focus on it.
 *
 * Will try for 3 seconds before moving on
 */
let retryCount = 0
const retryFocus = (ref) => {
  if (ref.current) {
    ref.current.focus()
  } else {
    if (retryCount < 30) {
      setTimeout(() => {
        retryCount = retryCount + 1
        retryFocus(ref)
      }, 100)
    }
  }
}

export const RawEditor = (props: RichTextType) => {
  const monaco = useMonaco() as Monaco
  const monacoEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor>(null)
  const [height, setHeight] = React.useState(100)
  const id = React.useMemo(() => uuid(), [])
  const field = props.field
  const inputValue = React.useMemo(() => {
    // @ts-ignore no access to the rich-text type from this package
    const res = stringifyMDX(props.input.value, field, (value) => value)
    return typeof props.input.value === 'string' ? props.input.value : res
  }, [])
  const [value, setValue] = React.useState(inputValue)
  const [error, setError] = React.useState<InvalidMarkdownElement>(null)

  const debouncedValue = useDebounce(value, 500)

  React.useEffect(() => {
    // @ts-ignore no access to the rich-text type from this package
    const parsedValue = parseMDX(value, field, (value) => value)
    if (
      parsedValue.children[0] &&
      parsedValue.children[0].type === 'invalid_markdown'
    ) {
      const invalidMarkdown = parsedValue.children[0]
      setError(invalidMarkdown)
    } else {
      setError(null)
    }
    props.input.onChange(parsedValue)
  }, [JSON.stringify(debouncedValue)])

  React.useEffect(() => {
    if (monacoEditorRef.current) {
      if (error) {
        const errorMessage = buildError(error)
        monaco.editor.setModelMarkers(monacoEditorRef.current.getModel(), id, [
          {
            ...errorMessage.position,
            message: errorMessage.message,
            severity: 8,
          },
        ])
      } else {
        monaco.editor.setModelMarkers(
          monacoEditorRef.current.getModel(),
          id,
          []
        )
      }
    }
  }, [JSON.stringify(error), monacoEditorRef.current])

  React.useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        // disable errors
        noSemanticValidation: true,
        noSyntaxValidation: true,
      })
      // TODO: autocomplete suggestions
      // monaco.languages.registerCompletionItemProvider('markdown', {
      //   provideCompletionItems: function (model, position) {
      //     const word = model.getWordUntilPosition(position)
      //     const range = {
      //       startLineNumber: position.lineNumber,
      //       endLineNumber: position.lineNumber,
      //       startColumn: word.startColumn,
      //       endColumn: word.endColumn,
      //     }
      //     return {
      //       suggestions: [
      //         {
      //           label: '<DateTime />',
      //           insertText: '<DateTime format="iso" />',
      //           kind: 0,
      //           range,
      //         },
      //       ],
      //     }
      //   },
      // })
    }
  }, [monaco])

  function handleEditorDidMount(
    monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoEditorRef.current = monacoEditor
    monacoEditor.onDidContentSizeChange(() => {
      // FIXME: if the window is too tall the performance degrades, come up with a nice
      // balance between the two
      setHeight(Math.min(Math.max(100, monacoEditor.getContentHeight()), 1000))
      monacoEditor.layout()
    })
  }

  return (
    <div className="relative">
      <div className="sticky -top-4 w-full flex justify-between mb-2 z-50 max-w-full">
        <Button onClick={() => props.setRawMode(false)}>
          View in rich-text editor
        </Button>
        <ErrorMessage error={error} />
      </div>
      <div style={{ height: `${height}px` }}>
        <MonacoEditor
          path={id}
          onMount={handleEditorDidMount}
          // Setting a custom theme is kind of buggy because it doesn't get defined until monaco has mounted.
          // So we end up with the default (light) theme in some scenarios. Seems like a race condition.
          // theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
            tabSize: 2,
            disableLayerHinting: true,
            accessibilitySupport: 'off',
            codeLens: false,
            wordWrap: 'on',
            minimap: {
              enabled: false,
            },
            fontSize: 14,
            lineHeight: 2,
            formatOnPaste: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 2,
            formatOnType: true,
            fixedOverflowWidgets: true,
            // Takes too much horizontal space for iframe
            folding: false,
            renderLineHighlight: 'none',
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              // https://github.com/microsoft/monaco-editor/issues/2007#issuecomment-644425664
              alwaysConsumeMouseWheel: false,
            },
          }}
          language={'markdown'}
          value={value}
          onChange={(value) => {
            try {
              setValue(value)
            } catch (e) {
              console.log('error', e)
            }
          }}
        />
      </div>
    </div>
  )
}

const Button = (props) => {
  return (
    <button
      className={`${
        props.align === 'left'
          ? 'rounded-l-md border-r-0'
          : 'rounded-r-md border-l-0'
      } shadow rounded-md bg-white cursor-pointer relative inline-flex items-center px-2 py-2 border border-gray-200 hover:text-white text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
      type="button"
      onClick={props.onClick}
    >
      <span className="text-sm font-semibold tracking-wide align-baseline mr-1">
        {props.children}
      </span>
    </button>
  )
}

export default RawEditor
