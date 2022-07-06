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
import { setNodes } from '@udecode/plate-core'
import { Dropdown } from './dropdown'
import { uuid } from './helpers'
import Editor, { useMonaco } from '@monaco-editor/react'

const languages = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  css: 'CSS',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown',
}

export const CodeBlock = ({ attributes, editor, element, ...props }) => {
  const monaco = useMonaco()

  React.useEffect(() => {
    if (monaco) {
      // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      //   jsx: monaco.languages.typescript.JsxEmit.React,
      // });
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        // disable errors
        // noSemanticValidation: true,
        // noSyntaxValidation: true,
      })
    }
  }, [monaco])

  const items = Object.entries(languages).map(([key, item]) => {
    return {
      key,
      onClick: () => {
        console.log('setnodes', item)
        setNodes(editor, { lang: key })
      },
      render: item,
    }
  })
  const language = element.lang

  const editorRef = React.useRef(null)

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
    if (editorRef.current) {
      // editorRef.current.focus()
      // console.log(editorRef)
    }
  }

  const value = element.value || ''
  const height = value.split('\n').length * 28
  const id = React.useMemo(() => uuid(), [])

  return (
    <div
      {...attributes}
      className="relative mb-2 mt-0.5 rounded-lg shadow-lg p-2"
      // FIXME: z-index should be some sane number, but does seem
      // to need to override most other elements
      style={{ backgroundColor: '#1e1e1e', zIndex: 1000 }}
      contentEditable={false}
    >
      <div className="flex justify-between pb-2">
        <div />
        <Dropdown label={languages[element.lang] || 'Language'} items={items} />
      </div>
      <Editor
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
      <span {...props} />
    </div>
  )
}
