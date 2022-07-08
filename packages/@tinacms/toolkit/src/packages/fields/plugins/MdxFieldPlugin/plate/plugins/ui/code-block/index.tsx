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
  toDOMNode,
  TElement,
  isElement,
  findNodePath,
  setSelection,
  getNextSiblingNodes,
  getParentNode,
  selectEndOfBlockAboveSelection,
  getBlockAbove,
  getLeafNode,
  select,
  getPointAfter,
  focusEditor,
  getPointBefore,
} from '@udecode/plate-headless'
import { Dropdown } from '../dropdown'
import { uuid } from '../helpers'
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { insertBlockElement } from '../../core/common'
import { Element, Transforms } from 'slate'
import { ReactEditor, useSelected } from 'slate-react'
import { nightOwl } from './nightOwl'

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

export const CodeBlock = ({
  attributes,
  editor,
  element,
  ...props
}: {
  attributes: Record<string, unknown>
  element: TElement
  editor: PlateEditor
  children: React.ReactNode
}) => {
  const [navigateAway, setNavigateAway] = React.useState<
    'up' | 'down' | 'insertNext' | 'remove' | null
  >(null)
  const monaco = useMonaco() as Monaco
  const monacoEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor>(null)
  const selected = useSelected()

  React.useEffect(() => {
    if (selected) {
      console.log('selection', JSON.stringify(editor.selection))
      monacoEditorRef.current.focus()
    }
  }, [selected, monacoEditorRef.current])

  const value = element.value || ''
  if (typeof value !== 'string') {
    throw new Error(`Element must be of type string for code block`)
  }

  const language = element.lang
  const height = value.split('\n').length * 28
  const id = React.useMemo(() => uuid(), [])

  React.useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('nightOwl', nightOwl)

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
      switch (navigateAway) {
        case 'remove':
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
                if (isElement(n) && n.type === 'code_block') {
                  return true
                }
              },
            }
          )
          // insertNodes(editor, [{ type: 'p', children: [{ text: '' }] }])
          break
        case 'insertNext':
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
            { select: true }
          )
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
        case 'down':
          const path = findNodePath(editor, element)
          if (!path) {
            return // Not sure if/when this would happen
          }

          const nextNodePath = getPointAfter(editor, path)
          if (!nextNodePath) {
            // No next children, insert an empty block
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
              { select: true }
            )
            return
          }

          focusEditor(editor, nextNodePath)
          break
      }
      setNavigateAway(null)
    }
  }, [navigateAway])

  function handleEditorDidMount(
    monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoEditorRef.current = monacoEditor
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
      className="relative mb-2 mt-0.5 rounded-lg shadow-lg p-2"
      // FIXME: z-index should be some sane number, but does seem
      // to need to override most other elements
      // style={{ backgroundColor: '#1e1e1e', zIndex: 1000 }}
      style={{ backgroundColor: '#1e1e1e' }}
    >
      <style>
        {/* Disable hints (not ideal but it conflicts with the toolbar and other floating elements) */}
        {`.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`}
      </style>
      {props.children}
      <div contentEditable={false}>
        <div className="flex justify-between pb-2">
          <div />
          <Dropdown label={activeLanguageLabel} items={items} />
        </div>
        <MonacoEditor
          height={`${height}px`}
          path={id}
          onMount={handleEditorDidMount}
          theme="vs-dark"
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
          language={language}
          value={element.value}
          onChange={(value) => {
            setNodes(editor, { value, lang: language })
          }}
        />
      </div>
    </div>
  )
}
