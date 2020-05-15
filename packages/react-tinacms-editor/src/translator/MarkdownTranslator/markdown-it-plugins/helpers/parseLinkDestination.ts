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

export function parseLinkDestination(md: any, state: any, pos: any): any {
  const isSpace = md.utils.isSpace
  const unescapeAll = md.utils.unescapeAll
  const str = state.src
  const max = state.posMax

  let code
  let level: number
  const lines = 0
  const start = pos
  const result = {
    ok: false,
    pos: 0,
    lines: 0,
    str: '',
  }

  if (str.charCodeAt(pos) === 0x3c /* < */) {
    pos++
    while (pos < max) {
      code = str.charCodeAt(pos)
      if (code === 0x0a /* \n */ || isSpace(code)) {
        return result
      }
      if (code === 0x3e /* > */) {
        result.pos = pos + 1
        result.str = unescapeAll(str.slice(start + 1, pos))
        result.ok = true
        return result
      }
      if (code === 0x5c /* \ */ && pos + 1 < max) {
        pos += 2
        continue
      }

      pos++
    }

    // no closing '>'
    return result
  }

  // this should be ... } else { ... branch

  level = 0
  while (pos < max) {
    code = str.charCodeAt(pos)

    if (
      code == 61 /* = */ ||
      code == 34 /* " */ ||
      code == 39 /* ' */
      // code === 0x20
    ) {
      pos--
      break
    }

    // ascii control characters
    if (code < 0x20 || code === 0x7f) {
      break
    }

    if (code === 0x5c /* \ */ && pos + 1 < max) {
      pos += 2
      continue
    }

    if (code === 0x28 /* ( */) {
      level++
    }

    if (code === 0x29 /* ) */) {
      if (level === 0) {
        break
      }
      level--
    }

    pos++
  }

  if (start === pos) {
    return result
  }
  if (level !== 0) {
    return result
  }

  result.str = unescapeAll(str.slice(start, pos))
  result.lines = lines
  result.pos = pos
  result.ok = true
  return result
}
