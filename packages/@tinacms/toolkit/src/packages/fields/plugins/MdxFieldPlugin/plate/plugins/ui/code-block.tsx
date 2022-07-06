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
import { insertBlockElement } from '../core/common'
import { Element, Transforms } from 'slate'
import { ReactEditor, useSelected } from 'slate-react'

const languages = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  css: 'CSS',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown',
}
const nightOwl = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      background: '011627',
      token: '',
    },
    {
      foreground: '637777',
      token: 'comment',
    },
    {
      foreground: 'addb67',
      token: 'string',
    },
    {
      foreground: 'ecc48d',
      token: 'vstring.quoted',
    },
    {
      foreground: 'ecc48d',
      token: 'variable.other.readwrite.js',
    },
    {
      foreground: '5ca7e4',
      token: 'string.regexp',
    },
    {
      foreground: '5ca7e4',
      token: 'string.regexp keyword.other',
    },
    {
      foreground: '5f7e97',
      token: 'meta.function punctuation.separator.comma',
    },
    {
      foreground: 'f78c6c',
      token: 'constant.numeric',
    },
    {
      foreground: 'f78c6c',
      token: 'constant.character.numeric',
    },
    {
      foreground: 'addb67',
      token: 'variable',
    },
    {
      foreground: 'c792ea',
      token: 'keyword',
    },
    {
      foreground: 'c792ea',
      token: 'punctuation.accessor',
    },
    {
      foreground: 'c792ea',
      token: 'storage',
    },
    {
      foreground: 'c792ea',
      token: 'meta.var.expr',
    },
    {
      foreground: 'c792ea',
      token:
        'meta.class meta.method.declaration meta.var.expr storage.type.jsm',
    },
    {
      foreground: 'c792ea',
      token: 'storage.type.property.js',
    },
    {
      foreground: 'c792ea',
      token: 'storage.type.property.ts',
    },
    {
      foreground: 'c792ea',
      token: 'storage.type.property.tsx',
    },
    {
      foreground: '82aaff',
      token: 'storage.type',
    },
    {
      foreground: 'ffcb8b',
      token: 'entity.name.class',
    },
    {
      foreground: 'ffcb8b',
      token: 'meta.class entity.name.type.class',
    },
    {
      foreground: 'addb67',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '82aaff',
      token: 'entity.name.function',
    },
    {
      foreground: 'addb67',
      token: 'punctuation.definition.variable',
    },
    {
      foreground: 'd3423e',
      token: 'punctuation.section.embedded',
    },
    {
      foreground: 'd6deeb',
      token: 'punctuation.terminator.expression',
    },
    {
      foreground: 'd6deeb',
      token: 'punctuation.definition.arguments',
    },
    {
      foreground: 'd6deeb',
      token: 'punctuation.definition.array',
    },
    {
      foreground: 'd6deeb',
      token: 'punctuation.section.array',
    },
    {
      foreground: 'd6deeb',
      token: 'meta.array',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.definition.list.begin',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.definition.list.end',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.separator.arguments',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.definition.list',
    },
    {
      foreground: 'd3423e',
      token: 'string.template meta.template.expression',
    },
    {
      foreground: 'd6deeb',
      token: 'string.template punctuation.definition.string',
    },
    {
      foreground: 'c792ea',
      fontStyle: 'italic',
      token: 'italic',
    },
    {
      foreground: 'addb67',
      fontStyle: 'bold',
      token: 'bold',
    },
    {
      foreground: '82aaff',
      token: 'constant.language',
    },
    {
      foreground: '82aaff',
      token: 'punctuation.definition.constant',
    },
    {
      foreground: '82aaff',
      token: 'variable.other.constant',
    },
    {
      foreground: '7fdbca',
      token: 'support.function.construct',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.other.new',
    },
    {
      foreground: '82aaff',
      token: 'constant.character',
    },
    {
      foreground: '82aaff',
      token: 'constant.other',
    },
    {
      foreground: 'f78c6c',
      token: 'constant.character.escape',
    },
    {
      foreground: 'addb67',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: 'd7dbe0',
      token: 'variable.parameter',
    },
    {
      foreground: '7fdbca',
      token: 'entity.name.tag',
    },
    {
      foreground: 'cc2996',
      token: 'punctuation.definition.tag.html',
    },
    {
      foreground: 'cc2996',
      token: 'punctuation.definition.tag.begin',
    },
    {
      foreground: 'cc2996',
      token: 'punctuation.definition.tag.end',
    },
    {
      foreground: 'addb67',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: 'addb67',
      token: 'entity.name.tag.custom',
    },
    {
      foreground: '82aaff',
      token: 'support.function',
    },
    {
      foreground: '82aaff',
      token: 'support.constant',
    },
    {
      foreground: '7fdbca',
      token: 'upport.constant.meta.property-value',
    },
    {
      foreground: 'addb67',
      token: 'support.type',
    },
    {
      foreground: 'addb67',
      token: 'support.class',
    },
    {
      foreground: 'addb67',
      token: 'support.variable.dom',
    },
    {
      foreground: '7fdbca',
      token: 'support.constant',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.other.special-method',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.other.new',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.other.debugger',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.control',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.comparison',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.flow.js',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.flow.ts',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.flow.tsx',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.ruby',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.module.ruby',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.class.ruby',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.def.ruby',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.loop.js',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.loop.ts',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.import.js',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.import.ts',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.import.tsx',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.from.js',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.from.ts',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.control.from.tsx',
    },
    {
      foreground: 'ffffff',
      background: 'ff2c83',
      token: 'invalid',
    },
    {
      foreground: 'ffffff',
      background: 'd3423e',
      token: 'invalid.deprecated',
    },
    {
      foreground: '7fdbca',
      token: 'keyword.operator',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.relational',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.assignement',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.arithmetic',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.bitwise',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.increment',
    },
    {
      foreground: 'c792ea',
      token: 'keyword.operator.ternary',
    },
    {
      foreground: '637777',
      token: 'comment.line.double-slash',
    },
    {
      foreground: 'cdebf7',
      token: 'object',
    },
    {
      foreground: 'ff5874',
      token: 'constant.language.null',
    },
    {
      foreground: 'd6deeb',
      token: 'meta.brace',
    },
    {
      foreground: 'c792ea',
      token: 'meta.delimiter.period',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.definition.string',
    },
    {
      foreground: 'ff5874',
      token: 'constant.language.boolean',
    },
    {
      foreground: 'ffffff',
      token: 'object.comma',
    },
    {
      foreground: '7fdbca',
      token: 'variable.parameter.function',
    },
    {
      foreground: '80cbc4',
      token: 'support.type.vendor.property-name',
    },
    {
      foreground: '80cbc4',
      token: 'support.constant.vendor.property-value',
    },
    {
      foreground: '80cbc4',
      token: 'support.type.property-name',
    },
    {
      foreground: '80cbc4',
      token: 'meta.property-list entity.name.tag',
    },
    {
      foreground: '57eaf1',
      token: 'meta.property-list entity.name.tag.reference',
    },
    {
      foreground: 'f78c6c',
      token: 'constant.other.color.rgb-value punctuation.definition.constant',
    },
    {
      foreground: 'ffeb95',
      token: 'constant.other.color',
    },
    {
      foreground: 'ffeb95',
      token: 'keyword.other.unit',
    },
    {
      foreground: 'c792ea',
      token: 'meta.selector',
    },
    {
      foreground: 'fad430',
      token: 'entity.other.attribute-name.id',
    },
    {
      foreground: '80cbc4',
      token: 'meta.property-name',
    },
    {
      foreground: 'c792ea',
      token: 'entity.name.tag.doctype',
    },
    {
      foreground: 'c792ea',
      token: 'meta.tag.sgml.doctype',
    },
    {
      foreground: 'd9f5dd',
      token: 'punctuation.definition.parameters',
    },
    {
      foreground: 'ecc48d',
      token: 'string.quoted',
    },
    {
      foreground: 'ecc48d',
      token: 'string.quoted.double',
    },
    {
      foreground: 'ecc48d',
      token: 'string.quoted.single',
    },
    {
      foreground: 'addb67',
      token: 'support.constant.math',
    },
    {
      foreground: 'addb67',
      token: 'support.type.property-name.json',
    },
    {
      foreground: 'addb67',
      token: 'support.constant.json',
    },
    {
      foreground: 'c789d6',
      token: 'meta.structure.dictionary.value.json string.quoted.double',
    },
    {
      foreground: '80cbc4',
      token: 'string.quoted.double.json punctuation.definition.string.json',
    },
    {
      foreground: 'ff5874',
      token:
        'meta.structure.dictionary.json meta.structure.dictionary.value constant.language',
    },
    {
      foreground: 'd6deeb',
      token: 'variable.other.ruby',
    },
    {
      foreground: 'ecc48d',
      token: 'entity.name.type.class.ruby',
    },
    {
      foreground: 'ecc48d',
      token: 'keyword.control.class.ruby',
    },
    {
      foreground: 'ecc48d',
      token: 'meta.class.ruby',
    },
    {
      foreground: '7fdbca',
      token: 'constant.language.symbol.hashkey.ruby',
    },
    {
      foreground: 'e0eddd',
      background: 'a57706',
      fontStyle: 'italic',
      token: 'meta.diff',
    },
    {
      foreground: 'e0eddd',
      background: 'a57706',
      fontStyle: 'italic',
      token: 'meta.diff.header',
    },
    {
      foreground: 'ef535090',
      fontStyle: 'italic',
      token: 'markup.deleted',
    },
    {
      foreground: 'a2bffc',
      fontStyle: 'italic',
      token: 'markup.changed',
    },
    {
      foreground: 'a2bffc',
      fontStyle: 'italic',
      token: 'meta.diff.header.git',
    },
    {
      foreground: 'a2bffc',
      fontStyle: 'italic',
      token: 'meta.diff.header.from-file',
    },
    {
      foreground: 'a2bffc',
      fontStyle: 'italic',
      token: 'meta.diff.header.to-file',
    },
    {
      foreground: '219186',
      background: 'eae3ca',
      token: 'markup.inserted',
    },
    {
      foreground: 'd3201f',
      token: 'other.package.exclude',
    },
    {
      foreground: 'd3201f',
      token: 'other.remove',
    },
    {
      foreground: '269186',
      token: 'other.add',
    },
    {
      foreground: 'ff5874',
      token: 'constant.language.python',
    },
    {
      foreground: '82aaff',
      token: 'variable.parameter.function.python',
    },
    {
      foreground: '82aaff',
      token: 'meta.function-call.arguments.python',
    },
    {
      foreground: 'b2ccd6',
      token: 'meta.function-call.python',
    },
    {
      foreground: 'b2ccd6',
      token: 'meta.function-call.generic.python',
    },
    {
      foreground: 'd6deeb',
      token: 'punctuation.python',
    },
    {
      foreground: 'addb67',
      token: 'entity.name.function.decorator.python',
    },
    {
      foreground: '8eace3',
      token: 'source.python variable.language.special',
    },
    {
      foreground: '82b1ff',
      token: 'markup.heading.markdown',
    },
    {
      foreground: 'c792ea',
      fontStyle: 'italic',
      token: 'markup.italic.markdown',
    },
    {
      foreground: 'addb67',
      fontStyle: 'bold',
      token: 'markup.bold.markdown',
    },
    {
      foreground: '697098',
      token: 'markup.quote.markdown',
    },
    {
      foreground: '80cbc4',
      token: 'markup.inline.raw.markdown',
    },
    {
      foreground: 'ff869a',
      token: 'markup.underline.link.markdown',
    },
    {
      foreground: 'ff869a',
      token: 'markup.underline.link.image.markdown',
    },
    {
      foreground: 'd6deeb',
      token: 'string.other.link.title.markdown',
    },
    {
      foreground: 'd6deeb',
      token: 'string.other.link.description.markdown',
    },
    {
      foreground: '82b1ff',
      token: 'punctuation.definition.string.markdown',
    },
    {
      foreground: '82b1ff',
      token: 'punctuation.definition.string.begin.markdown',
    },
    {
      foreground: '82b1ff',
      token: 'punctuation.definition.string.end.markdown',
    },
    {
      foreground: '82b1ff',
      token: 'meta.link.inline.markdown punctuation.definition.string',
    },
    {
      foreground: '7fdbca',
      token: 'punctuation.definition.metadata.markdown',
    },
    {
      foreground: '82b1ff',
      token: 'beginning.punctuation.definition.list.markdown',
    },
  ],
  colors: {
    'editor.foreground': '#d6deeb',
    'editor.background': '#011627',
    'editor.selectionBackground': '#5f7e9779',
    'editor.lineHighlightBackground': '#010E17',
    'editorCursor.foreground': '#80a4c2',
    'editorWhitespace.foreground': '#2e2040',
    'editorIndentGuide.background': '#5e81ce52',
    'editor.selectionHighlightBorder': '#122d42',
  },
}

export const CodeBlock = ({ attributes, editor, element, ...props }) => {
  const monaco = useMonaco()
  const value = element.value || ''
  const height = value.split('\n').length * 28
  const id = React.useMemo(() => uuid(), [])

  React.useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('nightOwl', nightOwl)

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
        setNodes(editor, { lang: key })
      },
      render: item,
    }
  })
  const language = element.lang

  const editorRef = React.useRef(null)
  const [shouldUnwrap, setShouldUnwrap] = React.useState(false)
  const [shouldBreak, setShouldBreak] = React.useState(false)

  React.useEffect(() => {
    if (shouldBreak) {
      const editorEl = ReactEditor.toDOMNode(editor, element)
      editorEl.focus()
      setTimeout(() => {
        Transforms.insertNodes(
          editor,
          [
            {
              type: 'p',
              children: [{ text: '' }],
              lang: undefined,
              value: undefined,
            },
          ],
          { select: true }
        )
        setShouldBreak(false)
      }, 1)
    }
  }, [shouldBreak])
  React.useEffect(() => {
    if (shouldUnwrap) {
      const editorEl = ReactEditor.toDOMNode(editor, element)
      editorEl.focus()
      setTimeout(() => {
        Transforms.setNodes(
          editor,
          {
            type: 'p',
            children: [{ text: '' }],
            lang: undefined,
            value: undefined,
          },
          {
            match: (n) => {
              // @ts-ignore bad type from slate
              if (Element.isElement(n) && n.type === 'code_block') {
                return true
              }
            },
          }
        )
        insertBlockElement(editor, { type: 'p', children: [{ text: '' }] })
      }, 1)
      setShouldUnwrap(false)
    }
  }, [shouldUnwrap])

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () =>
      setShouldBreak(true)
    )
    if (editorRef.current) {
      editor.onKeyDown((l, h, f) => {
        if (l.code === 'Backspace') {
          const selection = editor.getSelection()
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
            setShouldUnwrap(true)
          }
        }
      })
    }
  }
  const selected = useSelected()
  // FIXME: monaco mounts too slowly to focus immediately
  React.useEffect(() => {
    if (selected) {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    }
  }, [selected])

  return (
    <div
      {...attributes}
      className="relative mb-2 mt-0.5 rounded-lg shadow-lg p-2"
      // FIXME: z-index should be some sane number, but does seem
      // to need to override most other elements
      style={{ backgroundColor: '#1e1e1e', zIndex: 1000 }}
    >
      {props.children}
      <div contentEditable={false}>
        <div className="flex justify-between pb-2">
          <div />
          <Dropdown
            label={languages[element.lang] || 'Language'}
            items={items}
          />
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
          onChange={(value, ev) => {
            setNodes(editor, { value, lang: language })
          }}
        />
      </div>
    </div>
  )
}
