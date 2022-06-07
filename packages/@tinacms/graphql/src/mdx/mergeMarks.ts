// @ts-nocheck FIXME: plate elements and SlateNodeType needs to be merged
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

import { visit, SKIP } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'
import type { Content, PhrasingContent, StaticPhrasingContent } from 'mdast'

export const mergeMarks = (tree) => {
  visit(tree, 'link', (node, index, parent) => {
    if (node.children.length === 1) {
      // console.log(JSON.stringify(parent, null, 2))
      // console.log(node)
    }
  })
}

export const mergeMarks2 = (tree) => {
  visit(tree, 'link', (node, index, parent) => {
    let text
    let hasMergableLink = false
    if (node.children.length === 1) {
      hasMergableLink = true
    }
    const map = []
    visitParents(node, 'text', (textNode, ancestors) => {
      ancestors.forEach((ancestor, i) => {
        if (i === 0) {
          // skip because this is the `link` parent
        } else {
          map.push(ancestor.type)
        }
      })
      text = textNode
    })
    node.children = [text]
    const linkNode = node
    if (hasMergableLink) {
      const previousChildren = parent.children.slice(0, index - 1)
      const previousChild = parent.children[index - 1]
      const nextChild = parent.children[index + 1]
      let previousChildInner
      let nextChildInner
      if (previousChild && nextChild) {
        let previousMap
        visitParents(previousChild, (node, ancestors) => {
          previousMap = []
          ancestors.forEach((ancestor, i) => {
            previousMap.push(ancestor.type)
          })
          previousChildInner = node
          previousMap.push(node.type)
        })
        let nextMap
        visitParents(nextChild, (node, ancestors) => {
          nextMap = []
          ancestors.forEach((ancestor, i) => {
            nextMap.push(ancestor.type)
          })
          nextChildInner = node
          nextMap.push(node.type)
        })

        if (
          equals([...map, 'text'], previousMap) &&
          equals([...map, 'text'], nextMap)
        ) {
          let accum = [previousChildInner, linkNode, nextChildInner]
          visitParents(previousChild, 'text', (node, ancestors) => {
            ancestors.reverse().forEach((parentNode) => {
              accum = [{ ...parentNode, children: accum }]
            })
          })
          const marksUsed = []
          const children = [...previousChildren, ...accum]
          const node = { children }
          visit(node, (node, index, parent) => {
            if (marksUsed.includes(node.type)) {
              parent.children = node.children
            }
            if (['strong', 'emphasis'].includes(node.type)) {
              marksUsed.push(node.type)
            }
          })
          parent.children = node.children
          return
        }
      }

      if (previousChild) {
        visitParents(previousChild, (node, ancestors) => {
          const previousMap = []
          ancestors.forEach((ancestor, i) => {
            previousMap.push(ancestor.type)
          })
          previousMap.push(node.type)

          if (equals(map, previousMap)) {
            node.children.push(linkNode)
            parent.children = parent.children.filter((child, i) => i !== index)
            return
          }
        })
      }
      if (nextChild) {
        visitParents(nextChild, (node, ancestors) => {
          const nextMap = []
          ancestors.forEach((ancestor, i) => {
            nextMap.push(ancestor.type)
          })
          nextMap.push(node.type)
          if (equals(map, nextMap)) {
            node.children.unshift(linkNode)
            parent.children = parent.children.filter((child, i) => i !== index)
          }
        })
      }
    }
  })
  return tree
}

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
