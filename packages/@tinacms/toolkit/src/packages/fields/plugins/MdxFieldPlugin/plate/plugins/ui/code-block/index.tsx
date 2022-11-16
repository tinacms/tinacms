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
import { uuid } from '../helpers'
import MonacoEditor, { useMonaco, loader } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { useSelected } from 'slate-react'
import { Autocomplete } from '../autocomplete'

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
 *
 * This also takes the autocomplete combobox into consideration, if that element was
 * what the user clicked on first, then we should re-focus that element after focusing
 * the code block container.
 */
let retryCount = 0
const retryFocus = (
  ref: { current: monaco.editor.IStandaloneCodeEditor },
  containerRef: React.MutableRefObject<HTMLDivElement>
) => {
  const activeElement = document.activeElement
  if (ref.current) {
    ref.current.focus()
    if (containerRef.current.contains(activeElement)) {
      if (activeElement instanceof HTMLElement) {
        // refocus the element
        activeElement.focus()
      }
    }
  } else {
    if (retryCount < 30) {
      setTimeout(() => {
        retryCount = retryCount + 1
        retryFocus(ref, containerRef)
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
  const containerRef = React.useRef<HTMLDivElement>(null)
  const selected = useSelected()
  const [height, setHeight] = React.useState(28)

  React.useEffect(() => {
    if (selected && isCollapsed(editor.selection)) {
      if (monacoEditorRef.current) {
        retryFocus(monacoEditorRef, containerRef)
      }
    }
  }, [selected, monacoEditorRef.current, containerRef.current])

  const value = element.value || ''
  if (typeof value !== 'string') {
    throw new Error(`Element must be of type string for code block`)
  }

  const language =
    restrictLanguage || (typeof element.lang === 'string' && element.lang) || ''
  const id = React.useMemo(() => uuid(), [])
  const items: { key: string; label: string }[] = React.useMemo(() => {
    const defaultLangSet = { key: '', label: 'Plain text' }
    if (!monaco) return [defaultLangSet]
    // Some languages are sort of obscure, we can always turn them back on if asked
    const includedLanguages = [
      'plaintext',
      'json',
      // 'abap',
      // 'apex',
      // 'azcli',
      // 'bat',
      // 'bicep',
      // 'cameligo',
      'clojure',
      'coffeescript',
      'c',
      // 'cpp',
      'csharp',
      // 'csp',
      'css',
      'dart',
      'dockerfile',
      // 'ecl',
      'elixir',
      // 'flow9',
      'fsharp',
      'go',
      'graphql',
      'handlebars',
      // 'hcl',
      'html',
      // 'ini',
      'java',
      'javascript',
      // 'julia',
      'kotlin',
      'less',
      // 'lexon',
      'lua',
      // 'liquid',
      // 'm3',
      'markdown',
      // 'mips',
      // 'msdax',
      // 'mysql', // just SQL should be enough
      'objective-c',
      // 'pascal',
      // 'pascaligo',
      'perl',
      // 'pgsql', // just SQL should be enough
      'php',
      // 'pla',
      // 'postiats',
      // 'powerquery',
      'powershell',
      // 'proto',
      'pug',
      'python',
      'qsharp',
      'r',
      'razor',
      'redis',
      // 'redshift',
      // 'restructuredtext',
      'ruby',
      'rust',
      // 'sb',
      'scala',
      // 'scheme',
      'scss',
      'shell',
      // 'sol',
      // 'aes',
      // 'sparql',
      'sql',
      // 'st',
      'swift',
      // 'systemverilog',
      // 'verilog',
      // 'tcl',
      'twig',
      'typescript',
      'vb',
      'xml',
      'yaml',
    ]
    return monaco.languages
      .getLanguages()
      .filter((cv) => {
        if (includedLanguages.includes(cv.id)) {
          return true
        }
        return false
      })
      .map((cv) => {
        if (cv.id === 'plaintext') {
          return {
            key: '',
            label: 'Plain text',
          }
        }
        const label = cv.aliases?.length > 0 ? cv.aliases[0] : cv.id
        return {
          key: cv.id,
          label: label,
        }
      })
  }, [monaco])

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

  const currentItem = React.useMemo(() => {
    if (!language) {
      return {
        key: '',
        label: 'Plain Text',
      }
    }
    return (
      items.find((item) => item.key === language) ?? {
        key: language,
        label: language,
      }
    )
  }, [items, language])

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
      <div contentEditable={false} ref={containerRef}>
        {!restrictLanguage && (
          <div className="flex justify-between pb-2">
            <div />
            <Autocomplete
              items={items}
              value={currentItem}
              defaultQuery={'plaintext'}
              onChange={(item) => setNodes(editor, { lang: item.key })}
            />
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
