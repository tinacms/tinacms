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
  createPluginFactory,
  insertNodes,
  getPlugin,
  unwrapNodes,
} from '@udecode/plate-core'
import { computePosition, flip, shift } from '@floating-ui/dom'
import { Element, Transforms } from 'slate'
import { ReactEditor, useFocused, useSelected } from 'slate-react'
import { SearchAutocomplete } from '../ui/combobox'
import { insertMDX } from '../create-mdx-plugins'
import type { MdxTemplate } from '../../types'

export const ELEMENT_MAYBE_MDX = 'maybe_mdx'

/**
 * `ELEMENT_MAYBE_MDX` is inserted by a forward slash (`/`)
 * that indicates we may drop in an MDX component from the combobox.
 * This can probably be customized to whatever command
 * the developer wants (eg. `<`)
 */
export const withMaybeMDX = (editor) => {
  const { type } = getPlugin(editor, ELEMENT_MAYBE_MDX)
  const { insertText } = editor
  editor.insertText = (text) => {
    if (!editor.selection || text !== '/') {
      return insertText(text)
    }
    insertNodes(editor, {
      type,
      children: [{ type: 'text', text: '/' }],
    })
  }

  return editor
}

export const createSlashPlugin = createPluginFactory({
  key: ELEMENT_MAYBE_MDX,
  isElement: true,
  isInline: true,
  withOverrides: withMaybeMDX,
  component: (props) => <SlashCombobox {...props} />,
})

const SlashCombobox = (props: {
  editor: ReactEditor
  element: Element
  attributes: object
  className: string
  children: React.ReactNode
  templates: MdxTemplate[]
}) => {
  const ref = React.useRef<HTMLDivElement | null>()
  const focused = useFocused()
  const selected = useSelected()
  const onCancel = () => {
    unwrapNodes(props.editor, {
      match: (n) => Element.isElement(n) && n.type === ELEMENT_MAYBE_MDX,
    })
  }

  const onValue = (value: MdxTemplate) => {
    // Effectively replaces the existing node with the MDX element
    Transforms.removeNodes(props.editor, {
      match: (n) => {
        // @ts-ignore bad type from slate
        if (Element.isElement(n) && n.type === ELEMENT_MAYBE_MDX) {
          return true
        }
      },
    })
    insertMDX(props.editor, value)
  }
  // @ts-ignore
  const fullValue = props.element.children[0]?.text
  const value = fullValue.slice(1) as string
  const [matches, setMatches] = React.useState(0)
  const { selection } = props.editor

  React.useEffect(() => {
    if (!selected || !focused) {
      unwrapNodes(props.editor, {
        at: selection,
        match: (n) => Element.isElement(n) && n.type === ELEMENT_MAYBE_MDX,
      })
    }
  }, [focused, selected, JSON.stringify(selection)])

  React.useEffect(() => {
    if (matches === 0 && value.endsWith(' ')) {
      unwrapNodes(props.editor, {
        match: (n) => Element.isElement(n) && n.type === ELEMENT_MAYBE_MDX,
      })
    }
  }, [matches, value])

  // If the full value no longer starts with "/", cancel
  React.useEffect(() => {
    if (!fullValue.startsWith('/')) {
      unwrapNodes(props.editor, {
        match: (n) => Element.isElement(n) && n.type === ELEMENT_MAYBE_MDX,
      })
    }
  }, [fullValue])

  React.useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    const run = async () => {
      if (ref.current) {
        const domSelection = window.getSelection()
        const domRange = domSelection.getRangeAt(0)
        const { x, y } = await computePosition(domRange, ref.current, {
          placement: 'bottom-start',
          middleware: [flip(), shift()],
        })
        if (ref.current) {
          Object.assign(ref.current.style, {
            left: `${x}px`,
            top: `${y}px`,
          })
        }
      }
    }
    run()
  }, [JSON.stringify(selection), ref.current])

  return (
    <span {...props.attributes} className={`${props.className}`}>
      {props.children}
      {selected && (
        <span ref={ref} className="block absolute z-50" contentEditable={false}>
          <SearchAutocomplete
            value={value}
            onValue={onValue}
            onCancel={onCancel}
            onMatches={(count) => setMatches(count)}
          />
        </span>
      )}
    </span>
  )
}
