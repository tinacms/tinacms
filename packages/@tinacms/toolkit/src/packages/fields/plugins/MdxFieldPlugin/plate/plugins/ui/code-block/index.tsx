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
import {
  ELEMENT_DEFAULT,
  insertNodes,
  PlateEditor,
  setNodes,
  TElement,
  isElement,
  findNodePath,
  getPointAfter,
  focusEditor,
  getPointBefore,
  isCollapsed,
} from '@udecode/plate-headless'
import { Dropdown } from '../dropdown'
import { uuid } from '../helpers'
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { useSelected } from 'slate-react'

type Monaco = typeof monaco

// 0.33.0 has a bug https://github.com/microsoft/monaco-editor/issues/2947
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs' },
})

const languages: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  css: 'CSS',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown',
}

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

export const CodeBlock = ({
  attributes,
  editor,
  element,
  language: restrictLanguage,
  ...props
}: {
  attributes: Record<string, unknown>
  element: TElement
  editor: PlateEditor
  language?: string
  children: React.ReactNode
}) => {
  const [navigateAway, setNavigateAway] = React.useState<
    'up' | 'down' | 'insertNext' | 'remove' | null
  >(null)
  const monaco = useMonaco() as Monaco
  const monacoEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor>(null)
  const selected = useSelected()
  const [height, setHeight] = React.useState(28)

  React.useEffect(() => {
    if (selected && isCollapsed(editor.selection)) {
      retryFocus(monacoEditorRef)
    }
  }, [selected, monacoEditorRef.current])

  const value = element.value || ''
  if (typeof value !== 'string') {
    throw new Error(`Element must be of type string for code block`)
  }

  const language = restrictLanguage || element.lang
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

  const items = Object.entries(languages).map(([key, item]) => {
    return {
      key,
      onClick: () => {
        setNodes(editor, { lang: key })
      },
      render: item,
    }
  })

  React.useEffect(() => {
    if (navigateAway) {
      setNavigateAway(null)
      switch (navigateAway) {
        case 'remove':
          {
            focusEditor(editor)
            setNodes(
              editor,
              {
                type: 'p',
                children: [{ text: '' }],
                lang: undefined,
                value: undefined,
              },
              {
                match: (n) => {
                  if (isElement(n) && n.type === element.type) {
                    return true
                  }
                },
              }
            )
          }
          break
        case 'insertNext':
          {
            insertNodes(
              editor,
              [
                {
                  type: ELEMENT_DEFAULT,
                  children: [{ text: '' }],
                  lang: undefined,
                  value: undefined,
                },
              ],
              { select: true }
            )
            focusEditor(editor)
          }
          break
        case 'up':
          {
            const path = findNodePath(editor, element)
            if (!path) {
              return // Not sure if/when this would happen
            }
            const previousNodePath = getPointBefore(editor, path)
            if (!previousNodePath) {
              focusEditor(editor)
              insertNodes(
                editor,
                [
                  {
                    type: ELEMENT_DEFAULT,
                    children: [{ text: '' }],
                    lang: undefined,
                    value: undefined,
                  },
                ],
                // Insert a new node at the current path, resulting in the code_block
                // moving down one block
                { at: path, select: true }
              )
              return
            }

            focusEditor(editor, previousNodePath)
          }
          break
        case 'down': {
          const path = findNodePath(editor, element)
          if (!path) {
            return // Not sure if/when this would happen
          }

          const nextNodePath = getPointAfter(editor, path)
          if (!nextNodePath) {
            // No next children, insert an empty block
            insertNodes(
              editor,
              [
                {
                  type: ELEMENT_DEFAULT,
                  children: [{ text: '' }],
                  lang: undefined,
                  value: undefined,
                },
              ],
              { select: true }
            )
            focusEditor(editor)
          } else {
            focusEditor(editor, nextNodePath)
          }
          break
        }
      }
    }
  }, [navigateAway])

  function handleEditorDidMount(
    monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoEditorRef.current = monacoEditor
    monacoEditor.onDidContentSizeChange(() => {
      setHeight(monacoEditor.getContentHeight())
      monacoEditor.layout()
    })

    monacoEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (monacoEditor.hasTextFocus()) {
        setNavigateAway('insertNext')
      }
    })
    monacoEditor.onKeyDown((l) => {
      if (l.code === 'ArrowUp') {
        const selection = monacoEditor.getSelection()
        if (selection.endLineNumber === 1 && selection.startLineNumber === 1) {
          setNavigateAway('up')
        }
      }
      if (l.code === 'ArrowDown') {
        const selection = monacoEditor.getSelection()
        const totalLines = monacoEditor.getModel().getLineCount()
        if (
          selection.endLineNumber === totalLines &&
          selection.startLineNumber === totalLines
        ) {
          setNavigateAway('down')
        }
      }
      if (l.code === 'Backspace') {
        const selection = monacoEditor.getSelection()
        if (
          selection.endColumn === 1 &&
          selection.endLineNumber === 1 &&
          selection.positionColumn === 1 &&
          selection.positionLineNumber === 1 &&
          selection.selectionStartColumn === 1 &&
          selection.selectionStartLineNumber === 1 &&
          selection.startColumn === 1 &&
          selection.startLineNumber === 1
        ) {
          setNavigateAway('remove')
        }
      }
    })
  }

  const activeLanguageLabel =
    typeof language === 'string' ? languages[language] : 'Plaintext'

  return (
    <div
      {...attributes}
      className="relative mb-2 mt-0.5 rounded-lg shadow-md p-2 border-gray-200 border"
    >
      <style>
        {/* Disable hints (not ideal but it conflicts with the toolbar and other floating elements) */}
        {`.tina-tailwind .monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`}
      </style>
      {props.children}
      <div contentEditable={false}>
        {!restrictLanguage && (
          <div className="flex justify-between pb-2">
            <div />
            <Dropdown label={activeLanguageLabel} items={items} />
          </div>
        )}
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
            language={String(language)}
            value={String(element.value)}
            onChange={(value) => {
              // FIXME: if a void is focused first, onChange doesn't fire until
              // https://github.com/udecode/plate/issues/1519#issuecomment-1184933602
              setNodes(editor, { value, lang: language })
            }}
          />
        </div>
      </div>
    </div>
  )
}
