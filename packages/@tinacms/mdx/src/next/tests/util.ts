import { visit } from 'unist-util-visit'
import { expect } from 'vitest'
import { toMatchFile } from 'jest-file-snapshot'
import path from 'path'

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
  return path.join(dir, './node.json')
}

export const mdPath = (dir: string) => {
  return path.join(dir, './out.md')
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
