import { expect } from 'vitest'
import { toMatchFile } from 'jest-file-snapshot'

const join = function (...parts: string[]) {
  // From: https://stackoverflow.com/questions/29855098/is-there-a-built-in-javascript-function-similar-to-os-path-join
  /* This function takes zero or more strings, which are concatenated
  together to form a path or URL, which is returned as a string. This
  function intelligently adds and removes slashes as required, and is
  aware that `file` URLs will contain three adjacent slashes. */

  const [first, last, slash] = [0, parts.length - 1, '/']

  const matchLeadingSlash = new RegExp('^' + slash)
  const matchTrailingSlash = new RegExp(slash + '$')

  parts = parts.map(function (part, index) {
    if (index === first && part === 'file://') return part

    if (index > first) part = part.replace(matchLeadingSlash, '')

    if (index < last) part = part.replace(matchTrailingSlash, '')

    return part
  })

  return parts.join(slash)
}

expect.extend({ toMatchFile })

// @ts-ignore
export function removePosition(tree) {
  ;[...walkThrough(tree)]

  return tree
}

export const print = (tree: object) => {
  return `${JSON.stringify(removePosition(tree), null, 2)}\n`
}

export const nodePath = (dir: string) => {
  return join(dir, './node.json')
}

export const mdPath = (dir: string) => {
  return join(dir, './out.md')
}

const walkThrough = function* (obj: object) {
  // @ts-ignore
  const walk = function* (x: object & { position?: object }, previous = []) {
    if (x) {
      for (const key of Object.keys(x)) {
        if (key === 'position') {
          delete x.position
        }
        // @ts-ignore
        if (typeof x[key] === 'object') yield* walk(x[key], [...previous, key])
        // @ts-ignore
        else yield [[...previous, key], x[key]]
      }
    }
  }
  yield* walk(obj)
}
