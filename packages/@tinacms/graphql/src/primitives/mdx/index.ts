import unified from 'unified'
import markdown from 'remark-parse'
import mdx from 'remark-mdx'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxjs } from 'micromark-extension-mdxjs'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { stringify } from './slate/serialize'
import deserialize from './slate/deserialize'

export const parseMDX = (value: string) => {
  const tree = unified.unified().use(markdown).use(mdx).parse(value)
  for (const node of walk(tree)) {
    // remove unnecessary positional info
    if (node.position) {
      delete node.position
    }
    if (node.type === 'mdxJsxFlowElement') {
      const attributes = {}
      node.attributes.forEach((attribute) => {
        if (attribute.type === 'mdxJsxAttribute') {
          if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
            attribute.value.data.estree.body.forEach((item) => {
              if (item.type === 'ExpressionStatement') {
                if (item.expression.type === 'ArrayExpression') {
                  const elements = []
                  item.expression.elements.forEach((element) => {
                    if (element.type === 'Literal') {
                      elements.push(element.value)
                    }
                  })
                  attributes[attribute.name] = elements
                }
                if (item.expression.type === 'ObjectExpression') {
                  item.expression.properties.forEach((property) => {
                    attributes[attribute.name] = {
                      [property.key.name]: property.value.value,
                    }
                  })
                }
              }
            })

            // attributes[attribute.name] =
          } else {
            attributes[attribute.name] = attribute.value
          }
        } else {
          console.log(`Not sure what this is, type: ${attribute.type}`)
        }
      })
      node.attributes = attributes
    }
  }
  const slateTree = tree.children.map(deserialize)
  // console.log(JSON.stringify(slateTree, null, 2))
  return slateTree
}

export const stringifyMDX = (slateTree: object[]) => {
  const tree = slateTree.map(stringify)

  try {
    const out = toMarkdown(
      {
        type: 'root',
        children: tree,
      },
      { extensions: [mdxToMarkdown] }
    )
    return out
  } catch (e) {
    console.log(e)
  }
}

export function* walk(maybeNode: any): any {
  if (['string', 'number'].includes(typeof maybeNode)) {
    return
  }

  if (!maybeNode) {
    return
  }

  for (const value of Object.values(maybeNode)) {
    if (Array.isArray(value)) {
      for (const element of value) {
        yield* walk(element)
      }
    } else {
      yield* walk(value)
    }
  }
  yield maybeNode
}
