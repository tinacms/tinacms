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

import { Fragment, Node } from 'prosemirror-model'

/**
 * Taken from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
 *
 * Todo: Might be a good idea to replace this with a library that does it really well.
 *
 * @type {RegExp}
 */
export const IMG_REGEX = /\.(jpe?g|png)/

export const HTTP_LINK_REGEX = /\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.,~#?&//=]*)/g

export const linkify = function(fragment: Fragment): Fragment {
  const linkified: Node[] = []
  fragment.forEach(function(child: Node) {
    if (child.isText) {
      const text = child.text as string
      let pos = 0
      let match

      const link = child.type.schema.marks['anchor']
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
