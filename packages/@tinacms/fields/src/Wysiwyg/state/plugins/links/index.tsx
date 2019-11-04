/**

Copyright 2019 Forestry.io Inc

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

import { Fragment, Node, Schema, Slice } from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { LinkFormController } from './LinkFormController'
import { LinkView } from './LinkView'

export const HTTP_LINK_REGEX = /\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.,~#?&//=]*)/g

export function links(
  schema: Schema,
  frame?: { document: Document },
  theme?: any
): Plugin {
  const renderTarget = createInvisibleDiv('links')
  let linkForm: LinkFormController
  let shiftKey: boolean
  return new Plugin({
    filterTransaction(tr: Transaction): boolean {
      switch (tr.getMeta('type')) {
        case 'tinacms/render':
          linkForm.render(tr.getMeta('clickTarget'))
          return false
        case 'tinacms/unmount':
          linkForm.unmount()
          return false
        default:
          return true
      }
    },
    view(editorView: any) {
      insertElBefore(renderTarget, editorView.dom)
      linkForm = new LinkFormController(
        renderTarget,
        editorView as any,
        frame,
        theme
      )
      let doc
      if (frame) {
        doc = frame.document
      }
      return new LinkView(editorView as any, schema, renderTarget, doc)
    },
    props: {
      transformPasted(slice: Slice): Slice {
        if (shiftKey) {
          return slice
        }
        return new Slice(linkify(slice.content), slice.openStart, slice.openEnd)
      },
      handleKeyDown(_x: any, e: any) {
        shiftKey = e.shiftKey
        return false
      },
    },
    // TODO: Fix pls
  } as any)
}

/**
 * Taken from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
 *
 * Todo: Might be a good idea to replace this with a library that does it really well.
 *
 * @type {RegExp}
 */
const IMG_REGEX = /\.(jpe?g|png)/

const linkify = function(fragment: Fragment): Fragment {
  const linkified: Node[] = []
  fragment.forEach(function(child: Node) {
    if (child.isText) {
      const text = child.text as string
      let pos = 0
      let match

      const link = child.type.schema.marks['link']
      const img = child.type.schema.nodes['image']
      const matches: any[] = []

      while ((match = HTTP_LINK_REGEX.exec(text))) {
        const start = match.index
        const end = start + match[0].length
        matches.push({ start, end })
      }

      matches.forEach(({ start, end }: any) => {
        // simply copy across the text from before the match
        if (start > 0) {
          linkified.push(child.cut(pos, start))
        }

        let attrs: any
        const urlText = text.slice(start, end)
        if (IMG_REGEX.test(urlText)) {
          attrs = { src: urlText, title: '', alt: '' }
          linkified.push(img.create(attrs))
        } else {
          attrs = { href: urlText, title: urlText }
          if (matches.length === 1) {
            attrs.editing = 'editing'
            attrs.creating = 'creating'
          }
          linkified.push(
            child.cut(start, end).mark(link.create(attrs).addToSet(child.marks))
          )
        }
        pos = end
      })

      // copy over whatever is left
      if (pos < text.length) {
        linkified.push(child.cut(pos))
      }
    } else {
      linkified.push(child.copy(linkify(child.content)))
    }
  })

  return Fragment.fromArray(linkified)
}

/**
 * Inserts the first element before the second element.
 *
 * @param {Element} element
 * @param {Element} sibling
 */
export function insertElBefore(element: Element, sibling: Element) {
  if (!sibling.parentElement) throw new Error('Sibling must not be an orphan!');
  sibling.parentElement.insertBefore(element, sibling)
}

export function createInvisibleDiv(id: string) {
  const div = document.createElement('div') as HTMLElement
  div.setAttribute('id', id)
  div.style.width = '0'
  div.style.height = '0'
  return div
}
