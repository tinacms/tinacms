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
  getNodeEntries,
  unwrapNodes,
  setNodes,
  wrapNodes,
  PlateEditor,
  isCollapsed,
  getAboveNode,
  getPluginType,
  createLinkPlugin,
  ELEMENT_LINK,
} from '@udecode/plate-headless'
import { Editor, Element, BaseRange, Transforms } from 'slate'
import { NestedForm } from '../../nested-form'

export { createLinkPlugin }

type LinkElement = {
  url?: string
  title?: string
  text: string | undefined
}

export const wrapOrRewrapLink = (editor) => {
  const baseLink = {
    type: 'a',
    url: '',
    title: '',
    children: [{ text: '' }],
  }

  // if our cursor is inside an existing link, but don't have the text selected, select it now
  if (isCollapsed(editor.selection)) {
    const [, path] = getAboveNode(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        getPluginType(editor, ELEMENT_LINK),
    })
    Transforms.select(editor, path)
  }
  if (isLinkActive(editor)) {
    const [link] = getLinks(editor)
    baseLink.url = link[0].url
    baseLink.title = link[0].title

    unwrapLink(editor)
  }

  wrapNodes(editor, baseLink, { split: true })
}

export const LinkForm = (props) => {
  const editor = useEditorState()!
  // Memoize selection so we hang onto when editor loses focus
  const selection = React.useMemo(() => editor.selection, [])

  const handleChange = (values) => {
    const linksInSelection = getNodeEntries<LinkElement>(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === ELEMENT_LINK,
      at: selection,
    })
    if (linksInSelection) {
      for (const [, location] of linksInSelection) {
        setNodes(editor, values, {
          match: (n) => {
            return (
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              n.type === ELEMENT_LINK
            )
          },
          at: location,
        })
      }
    }
  }
  const [link] = getLinks(editor)

  return (
    <NestedForm
      id="link-form"
      label="Link"
      fields={[
        { label: 'URL', name: 'url', component: 'text' },
        { label: 'Title', name: 'title', component: 'text' },
      ]}
      initialValues={{
        url: link ? link[0].url : '',
        title: link ? link[0].title : '',
      }}
      onChange={handleChange}
      onClose={props.onClose}
    />
  )
}

export const isLinkActive = (editor) => {
  const [link] = getLinks(editor)
  return !!link
}

export const unwrapLink = (editor: PlateEditor, selection?: BaseRange) => {
  unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === ELEMENT_LINK,
    at: selection || undefined,
  })
}

export const getLinks = (editor) => {
  return getNodeEntries<LinkElement>(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === ELEMENT_LINK,
  })
}
