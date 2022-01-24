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
  useEditorState,
  setNodes,
  getNodes,
  unwrapNodes,
} from '@udecode/plate-core'
import { Transforms, Editor, Range, Element } from 'slate'
import { NestedFormInner } from '../../nested-form'
import { createLinkPlugin } from '@udecode/plate-link'

export { createLinkPlugin }

type LinkElement = {
  url?: string
  title?: string
  text: string | undefined
}

export const LinkForm = (props) => {
  const editor = useEditorState()!
  const [hasInserted, setHasInserted] = React.useState(false)
  const [values, setValues] = React.useState<{ url?: string }>({})

  /**
   * There can be multiple links for a given selection because
   * whenever a selection spans multiple block elements each
   * link is a separate node within its respective block.
   *
   * When there is no link yet, insert it. Otherwise update it's value
   */
  React.useEffect(() => {
    if (values.url) {
      if (hasInserted) {
        updateLinks(editor, values)
      } else {
        insertLinks(editor, values)
        setHasInserted(true)
      }
    }
  }, [editor, hasInserted, JSON.stringify(values)])

  const [link] = getLinks(editor)

  return (
    <NestedFormInner
      id="link-form"
      label="Link"
      fields={[
        { label: 'URL', name: 'url', component: 'text' },
        { label: 'Title', name: 'title', component: 'text' },
      ]}
      initialValues={{
        url: link ? link[0]?.url || '' : '',
        title: link ? link[0]?.title || '' : '',
      }}
      onChange={(values) => setValues(values)}
      onClose={props.onClose}
    />
  )
}

/**
 * Borrowed from https://github.com/ianstormtaylor/slate/blob/main/site/examples/inlines.tsx
 */
const isLinkActive = (editor) => {
  const [link] = getLinks(editor)
  return !!link
}

const insertLinks = (editor, values) => {
  if (editor.selection) {
    wrapLink(editor, values)
  }
}
const updateLinks = (editor, values) => {
  if (editor.selection) {
    const links = getLinks(editor)
    if (links) {
      for (const [, location] of links) {
        setNodes(
          editor,
          { url: values.url, title: values.title },
          { at: location }
        )
      }
    }
  }
}
const wrapLink = (editor, values) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link = {
    type: 'a',
    url: values.url,
    title: values.title || '',
    children: isCollapsed ? [{ text: values.url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, [link])
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

export const unwrapLink = (editor) => {
  unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'a',
  })
}

const getLinks = (editor) => {
  return getNodes<LinkElement>(editor, {
    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'a',
  })
}
