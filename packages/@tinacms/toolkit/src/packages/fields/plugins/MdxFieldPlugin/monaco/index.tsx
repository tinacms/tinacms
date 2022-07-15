/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React from 'react'
import { uuid } from '../plate/plugins/ui/helpers'
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react'
import { parseMDX, stringifyMDX } from '@tinacms/mdx'
import { useEditorContext } from '../plate/editor-context'
import { useDebounce } from './use-debounce'
import type * as monaco from 'monaco-editor'

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

const RawEditor = (props: { input: any }) => {
  const monaco = useMonaco() as Monaco
  const { setRawMode } = useEditorContext()
  const monacoEditorRef =
    React.useRef<Monaco.editor.IStandaloneCodeEditor>(null)
  const [height, setHeight] = React.useState(100)
  const field = props.field
  const inputValue = React.useMemo(() => {
    const res = stringifyMDX(props.input.value, field)
    return typeof props.input.value === 'string' ? props.input.value : res
  }, [])
  const [value, setValue] = React.useState(inputValue)
  const [error, setError] = React.useState(null)

  const debouncedValue = useDebounce(value, 500)

  React.useEffect(() => {
    try {
      const parsedValue = parseMDX(value, field, (value) => {
        console.log('imagecallback', value)
        return value
      })
      console.log(parsedValue)
      props.input.onChange(parsedValue)
      setError(null)
    } catch (e) {
      if (e.message) {
        setError(e.message)
      } else {
        setError('Unable to parse string into markdown')
      }
    }
  }, [JSON.stringify(debouncedValue)])

  const id = React.useMemo(() => uuid(), [])

  React.useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        // disable errors
        noSemanticValidation: true,
        noSyntaxValidation: true,
      })
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
      <style>
        {/* Disable hints (not ideal but it conflicts with the toolbar and other floating elements) */}
        {/* {`.tina-tailwind .monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`} */}
      </style>
      <div className="sticky -top-4 inline-flex shadow rounded-md mb-2 z-50 max-w-full">
        <Button onClick={() => setRawMode(false)}>
          View in rich-text editor
        </Button>
      </div>
      <div style={{ height: `${height}px` }}>
        {error && (
          <div className="text-red-500 absolute top-1 right-0" title={error}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        <MonacoEditor
          path={id}
          onMount={handleEditorDidMount}
          // Setting a custom theme is kind of buggy because it doesn't get defined until monaco has mounted.
          // So we end up with the default (light) theme in some scenarios. Seems like a race condition.
          // theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
            // automaticLayout: true,
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
            lineNumbers: 'off',
            formatOnType: true,
            fixedOverflowWidgets: true,
            // Takes too much horizontal space for iframe
            folding: false,
            renderLineHighlight: 'none',
            scrollbar: {
              verticalScrollbarSize: 1,
              horizontalScrollbarSize: 1,
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
      } bg-white cursor-pointer relative inline-flex items-center px-2 py-2 border border-gray-200 hover:text-white text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
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
