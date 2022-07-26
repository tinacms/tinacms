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

type ErrorType = {
  message: string
  position?: {
    startColumn: number
    endColumn: number
    startLineNumber: number
    endLineNumber: number
  }
}
export const buildError = (element: InvalidMarkdownElement): ErrorType => {
  return {
    message: element.message,
    position: element.position && {
      endColumn: element.position.end.column,
      startColumn: element.position.start.column,
      startLineNumber: element.position.start.line,
      endLineNumber: element.position.end.line,
    },
  }
}
export const buildErrorMessage = (element: InvalidMarkdownElement): string => {
  if (!element) {
    return ''
  }
  const errorMessage = buildError(element)
  const message = errorMessage
    ? `${errorMessage.message}${
        errorMessage.position
          ? ` at line: ${errorMessage.position.startLineNumber}, column: ${errorMessage.position.startColumn}`
          : ''
      }`
    : null
  return message
}

const RawEditor = (props: RichTextType) => {
  const monaco = useMonaco() as Monaco
  const { setRawMode } = useEditorContext()
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
    if (parsedValue.children[0]) {
      if (parsedValue.children[0].type === 'invalid_markdown') {
        const invalidMarkdown = parsedValue.children[0]
        setError(invalidMarkdown)
        return
      }
    }
    props.input.onChange(parsedValue)
    setError(null)
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
      <div className="sticky -top-4 w-full flex justify-between mb-2 z-50 max-w-full">
        <Button onClick={() => setRawMode(false)}>
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

/* This example requires Tailwind CSS v2.0+ */
import { XCircleIcon } from '@heroicons/react/solid'
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { RichTextType } from '../../..'
import { InvalidMarkdownElement } from '@tinacms/mdx/src/parse/plate'

function ErrorMessage({ error }: { error: InvalidMarkdownElement }) {
  const message = buildErrorMessage(error)

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button
            className={`p-2 shaodw-lg border ${
              error ? '' : ' opacity-0 hidden '
            }`}
          >
            <span className="sr-only">Errors</span>
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute top-8 w-[300px] -right-3 z-10 mt-3 px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 whitespace-pre-wrap">
                        {message}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
