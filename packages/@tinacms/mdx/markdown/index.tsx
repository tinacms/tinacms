import { fromMarkdown } from 'mdast-util-from-markdown'
import { Explorer2 } from './explorer'
import MonacoEditor from 'react-monaco-editor'
import { useState } from 'react'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { directive, directiveHtml } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'

import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter'
// import { dump, load } from "js-yaml";
import md1 from './examples/forestryio/1.md?raw'
import { TinaMarkdown } from './renderer'
import { tinaDirective } from './extensions/tina-shortcodes/extension'
import { tinaDirectiveFromMarkdown } from './extensions/tina-shortcodes/from-markdown'

const fromMarkdownWithDirectives = (string: string) => {
  const tree = fromMarkdown(string, {
    extensions: [directive(), gfm(), frontmatter(), tinaDirective()],
    mdastExtensions: [
      directiveFromMarkdown,
      frontmatterFromMarkdown(),
      gfmFromMarkdown(),
      tinaDirectiveFromMarkdown,
    ],
  })
  return tree
}

const ast = fromMarkdownWithDirectives(md1)

export type Ast = typeof ast

export const MarkdownPlayground = () => {
  const [state, setState] = useState(ast)
  return (
    <div className="px-2 mx-auto h-screen">
      <div className="grid grid-cols-3 h-screen">
        <div className="bg-white py-5 h-screen">
          <MonacoEditor
            height="100%"
            width="100%"
            language="markdown"
            theme="vs-light"
            value={md1}
            options={{
              minimap: {
                autohide: true,
              },
              wordWrap: 'on',
            }}
            onChange={(value) => setState(fromMarkdownWithDirectives(value))}
          />
        </div>
        <div className="bg-white p-3 h-screen overflow-scroll">
          <Json src={state} />
        </div>
        <div className="bg-white p-3 h-screen overflow-scroll prose">
          <TinaMarkdown content={state} />
        </div>
      </div>
    </div>
  )
}

export const Json = (props: { src: object }) => (
  <Explorer2
    value={props.src}
    renderValue={({ value, keyName, parentValue, parentKeyName }) => {
      if (typeof value === 'string') {
        return <span className="text-orange-600">{value}</span>
      }
      if (typeof value === 'number') {
        return <span className="text-blue-600">{value}</span>
      }
      if (typeof value === 'boolean') {
        return (
          <span className="text-green-600">
            {value === false ? 'false' : value === true ? 'true' : ''}
          </span>
        )
      }
      return <span />
    }}
  />
)
