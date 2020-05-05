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

// Process [link](<to> "stuff")
// https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/link.js
'use strict'

import { parseLinkDestination } from '../helpers/parseLinkDestination'

function _link(md: any) {
  return function(state: any, silent: any) {
    const normalizeReference = state.md.utils.normalizeReference
    const isSpace = state.md.utils.isSpace

    let attrs,
      code,
      label,
      pos,
      res,
      ref,
      title,
      token,
      href = '',
      start = state.pos,
      parseReference = true

    const oldPos = state.pos,
      max = state.posMax

    if (state.src.charCodeAt(state.pos) !== 0x5b /* [ */) {
      return false
    }

    const labelStart = state.pos + 1
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true)

    // parser failed to find ']', so it's not a valid link
    if (labelEnd < 0) {
      return false
    }

    pos = labelEnd + 1
    if (pos < max && state.src.charCodeAt(pos) === 0x28 /* ( */) {
      //
      // Inline link
      //

      // might have found a valid shortcut link, disable reference parsing
      parseReference = false

      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos)
        if (!isSpace(code) && code !== 0x0a) {
          break
        }
      }
      if (pos >= max) {
        return false
      }

      start = pos
      res = parseLinkDestination(md, state, pos)
      if (res.ok) {
        href = res.str
        if (state.md.validateLink(href)) {
          pos = res.pos
        } else {
          href = ''
        }
      }

      // [link](  <href>  "title"  )
      //                ^^ skipping these spaces
      start = pos
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos)
        if (!isSpace(code) && code !== 0x0a) {
          break
        }
      }

      // [link](  <href>  "title"  )
      //                  ^^^^^^^ parsing link title
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax)
      if (pos < max && start !== pos && res.ok) {
        title = res.str
        pos = res.pos

        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
        for (; pos < max; pos++) {
          code = state.src.charCodeAt(pos)
          if (!isSpace(code) && code !== 0x0a) {
            break
          }
        }
      } else {
        title = ''
      }

      if (pos >= max || state.src.charCodeAt(pos) !== 0x29 /* ) */) {
        // parsing a valid shortcut link failed, fallback to reference
        parseReference = true
      }
      pos++
    }

    if (parseReference) {
      //
      // Link reference
      //
      if (typeof state.env.references === 'undefined') {
        return false
      }

      if (pos < max && state.src.charCodeAt(pos) === 0x5b /* [ */) {
        start = pos + 1
        pos = state.md.helpers.parseLinkLabel(state, pos)
        if (pos >= 0) {
          label = state.src.slice(start, pos++)
        } else {
          pos = labelEnd + 1
        }
      } else {
        pos = labelEnd + 1
      }

      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
      if (!label) {
        label = state.src.slice(labelStart, labelEnd)
      }

      ref = state.env.references[normalizeReference(label)]
      if (!ref) {
        state.pos = oldPos
        return false
      }
      href = ref.href
      title = ref.title
    }

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      state.pos = labelStart
      state.posMax = labelEnd

      token = state.push('link_open', 'a', 1)
      token.attrs = attrs = [['href', href]]
      if (title) {
        attrs.push(['title', title])
      }

      state.md.inline.tokenize(state)

      token = state.push('link_close', 'a', -1)
    }

    state.pos = pos
    state.posMax = max
    return true
  }
}

export function link(md: any) {
  md.inline.ruler.before('emphasis', 'link', _link(md))
}
