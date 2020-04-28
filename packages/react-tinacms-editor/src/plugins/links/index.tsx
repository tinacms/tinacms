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

import { Fragment, Node, Slice } from 'prosemirror-model'
import { Plugin, Transaction, PluginKey, EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { commonPluginKey } from '../Common'
import { isMarkPresent } from '../../utils'

export const HTTP_LINK_REGEX = /\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.,~#?&//=]*)/g

interface LinkPluginState {
  showLinkForm: boolean
}

export const linkPluginKey = new PluginKey('image')

export function links(): Plugin {
  let shiftKey: boolean
  return new Plugin({
    key: linkPluginKey,
    state: {
      init: () => {
        return { showLinkForm: false }
      },
      apply(
        tr: Transaction,
        prev: LinkPluginState,
        _: any,
        state: EditorState
      ) {
        if (tr.getMeta('show_link_toolbar') === false) {
          return {
            show_link_toolbar: false,
          }
        }

        if (tr.getMeta('show_link_toolbar')) {
          return {
            show_link_toolbar: true,
          }
        }

        const { editorFocused } = commonPluginKey.getState(state)
        if (isMarkPresent(state, state.schema.marks.link)) {
          return {
            show_link_toolbar: true,
          }
        } else if (editorFocused) {
          return {
            show_link_toolbar: false,
          }
        }

        return prev
      },
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
      handleClickOn(view: EditorView, _1: any) {
        const { dispatch, state } = view
        const { tr, schema } = state
        if (!isMarkPresent(state, schema.marks.link)) {
          dispatch(tr.setMeta('show_link_toolbar', false))
        }
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
  if (!sibling.parentElement) throw new Error('Sibling must not be an orphan!')
  sibling.parentElement.insertBefore(element, sibling)
}

export function createInvisibleDiv(id: string) {
  const div = document.createElement('div') as HTMLElement
  div.setAttribute('id', id)
  div.style.width = '0'
  div.style.height = '0'
  return div
}
