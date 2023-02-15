import { visit } from 'unist-util-visit'
import { expect } from 'vitest'
import { toMatchFile } from 'jest-file-snapshot'
import path from 'path'

expect.extend({ toMatchFile })

// @ts-ignore
export function removePosition(tree) {
  visit(tree, remove)

  return tree

  // @ts-ignore
  function remove(node) {
    // @ts-ignore
    node?.attributes?.forEach((att) => {
      if (att?.value?.data) {
        delete att?.value?.data
      }
      delete att.data
    })
    delete node.position
  }
}

export const print = (tree: object) => {
  return `${JSON.stringify(removePosition(tree), null, 2)}\n`
}

export const nodePath = (dir: string) => {
  return path.join(dir, './node.json')
}
