export function parseLinkDestination(md: any, state: any, pos: any): any {
  let isSpace = md.utils.isSpace
  let unescapeAll = md.utils.unescapeAll
  let str = state.src
  let max = state.posMax

  let code
  let level: number
  let lines = 0
  let start = pos
  let result = {
    ok: false,
    pos: 0,
    lines: 0,
    str: "",
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
