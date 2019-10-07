// Parse image size
//
'use strict'

type Result = {
  ok: boolean
  pos: number
  value?: number
  width?: number
  height?: number
}

function parseNextNumber(str: string, pos: number, max: number) {
  let code
  const start = pos
  const result: Result = {
    ok: false,
    pos: pos,
  }

  code = str.charCodeAt(pos)

  while (
    (pos < max && (code >= 0x30 /* 0 */ && code <= 0x39)) /* 9 */ ||
    code === 0x25 /* % */
  ) {
    code = str.charCodeAt(++pos)
  }

  result.ok = true
  result.pos = pos
  result.value = Number(str.slice(start, pos))

  return result
}

export function parseImageSize(str: string, pos: number, max: number) {
  let code,
    result: Result = {
      ok: false,
      pos: 0,
    }

  if (pos >= max) {
    return result
  }

  code = str.charCodeAt(pos)

  if (code !== 0x3d /* = */) {
    return result
  }

  pos++

  // size must follow = without any white spaces as follows
  // (1) =300x200
  // (2) =300x
  // (3) =x200
  code = str.charCodeAt(pos)
  if (code !== 0x78 /* x */ && (code < 0x30 || code > 0x39) /* [0-9] */) {
    return result
  }

  // parse width
  const resultW = parseNextNumber(str, pos, max)
  pos = resultW.pos

  // next charactor must be 'x'
  code = str.charCodeAt(pos)
  if (code !== 0x78 /* x */) {
    return result
  }

  pos++

  // parse height
  const resultH = parseNextNumber(str, pos, max)
  pos = resultH.pos

  result.width = resultW.value
  result.height = resultH.value
  result.pos = pos
  result.ok = true
  return result
}
