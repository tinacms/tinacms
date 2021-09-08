import { unified } from 'unified'
import markdown from 'remark-parse'
import mdx from 'remark-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'
import { stringify } from './slate/serialize'
import deserialize from './slate/deserialize'
import { TinaField } from '../..'
import { visit } from 'unist-util-visit'
import type { RichTypeWithNamespace } from '../types'

export const parseMDX = (value: string, field: RichTypeWithNamespace) => {
  const tree = unified().use(markdown).use(mdx).parse(value)
  return parseMDXInner(tree, field)
}
export const parseMDXInner = (tree: any, field: RichTypeWithNamespace) => {
  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
    let props = {}
    if (!node.name) {
      const mdx = parseMDXInner(
        { type: 'root', children: node.children },
        field
      )
      props = mdx
    }
    const template = field.templates.find(
      (template) => template.name === node.name
    )
    if (node.children.length > 0) {
      node.attributes.push({
        value: node.children,
        name: 'children',
        type: 'mdxJsxAttribute',
      })
    }
    node.children = null
    node.attributes.forEach((attribute) => {
      if (attribute.type === 'mdxJsxAttribute') {
        if (typeof template === 'string') {
          throw new Error('Global templates not yet supported')
        }
        if (!template) {
        } else {
          const field = template.fields.find(
            (field) => field.name === attribute.name
          )
          if (!field) {
            // FIXME: should probably allow these to pass through untouched
            throw new Error(
              `Unknown property '${attribute.name}' for embedded structure '${node.name}'`
            )
          }

          switchFields(attribute, field, props)
        }
      } else {
        console.log(`Not sure what this is, type: ${attribute.type}`)
      }
    })
    delete node.attributes
    node.props = props
  })
  for (const node of walk(tree, field)) {
    // remove unnecessary positional info
    if (node.position) {
      delete node.position
    }
  }

  const slateTree = tree.children.map(deserialize)
  return { type: 'root', children: slateTree }
}

export const stringifyMDX = (value: unknown, field: RichTypeWithNamespace) => {
  // @ts-ignore: FIXME: validate this shape
  const slateTree: SlateNodeType[] = value.children
  try {
    const tree = slateTree.map((item) => stringify(item, field))
    const out = toMarkdown(
      {
        type: 'root',
        children: tree,
      },
      {
        extensions: [
          mdxToMarkdown,
          // mdxExpressionToMarkdown,
        ],
      }
    )
    return out.replace(/&#x22;/g, `"`)
  } catch (e) {
    console.log(e)
  }
}

export function* walk(maybeNode: any, field): any {
  if (['string', 'number'].includes(typeof maybeNode)) {
    return
  }
  if (!maybeNode) {
    return
  }

  for (const [key, value] of Object.entries(maybeNode)) {
    if (Array.isArray(value)) {
      for (const element of value) {
        yield* walk(element, field)
      }
    } else {
      yield* walk(value, field)
    }
  }
  if (maybeNode.type) {
    if (['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(maybeNode.type)) {
      // console.log(maybeNode)
      yield maybeNode, field
    }
    if (['mdxJsxAttributeValueExpression'].includes(maybeNode.type)) {
      if (maybeNode.value.startsWith('<>')) {
        // console.log(field.templates[0])
        const correctField = field.templates[0].fields.find(
          (f) => f.name === 'richText'
        )
        maybeNode.field = correctField
        yield maybeNode
      }
    }
  }
}

const switchFields = (attribute, field: TinaField, props) => {
  switch (field.type) {
    case 'boolean':
    case 'datetime':
    case 'image':
    case 'number':
    case 'string':
      if (field.list) {
        // Must be an expression of literals
        if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              if (item.expression.type === 'ArrayExpression') {
                props[field.name] = item.expression.elements.map((element) => {
                  if (element.type === 'Literal') {
                    return element.value
                  } else {
                    throw new Error(
                      `Only literals are supported for array expressions`
                    )
                  }
                })
              }
            }
          })
        }
      } else {
        if (attribute.type === 'Property') {
          if (attribute.value.type === 'Literal') {
            props[attribute.key.name] = attribute.value.value
          }
        } else if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
          // can be an expression (of a single literal) or just a literal
          // name={"Hello"} or name="hello"
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              // Only literals are accepted
              if (item.expression.type === 'Literal') {
                props[field.name] = item.expression.value
              }
              if (item.expression.type === 'ArrayExpression') {
                throw new Error(
                  `Unexpected array expression for non-list field ${field.name}`
                )
              }
              if (item.expression.type === 'TemplateLiteral') {
                // eg. <MyComp name={`Hello`} />
                throw new Error(`Template literals are not yet supported`)
              }
            }
          })
        } else {
          props[field.name] = attribute.value
        }
      }
      break
    case 'object':
      if (attribute.type === 'mdxJsxAttribute') {
        if (attribute.value.type === 'mdxJsxAttributeValueExpression') {
          // console.log(JSON.stringify(attribute.value, null, 2))
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              // Only literals are accepted
              if (item.expression.type === 'ObjectExpression') {
                const objectProps = {}
                item.expression.properties.forEach((property) => {
                  if (property.key.type !== 'Identifier') {
                    throw new Error(`Unexptected key type ${property.key.type}`)
                  }
                  if (property.value.type !== 'Literal') {
                    throw new Error(
                      `Unexptected value type ${property.value.type}`
                    )
                  }
                  // TODO: support templates when single object templates are supported
                  if (field.fields) {
                    if (typeof field.fields === 'string') {
                      throw new Error(
                        `Global fields not supported at this time`
                      )
                    }
                    field.fields.forEach((field) => {
                      switchFields(property, field, objectProps)
                    })
                  }
                })
                props[field.name] = objectProps
              } else if (item.expression.type === 'ArrayExpression') {
                const objectArrayProps = []
                item.expression.elements.forEach((element) => {
                  if (element.type === 'ObjectExpression') {
                    const objectProps = {}
                    element.properties.forEach((property) => {
                      if (property.key.type !== 'Identifier') {
                        throw new Error(
                          `Unexptected key type ${property.key.type}`
                        )
                      }
                      if (property.value.type !== 'Literal') {
                        throw new Error(
                          `Unexptected value type ${property.value.type}`
                        )
                      }
                      // objectProps[property.key.name] = property.value.value
                      if (field.fields) {
                        if (typeof field.fields === 'string') {
                          throw new Error(
                            `Global fields not supported at this time`
                          )
                        }
                        field.fields.forEach((field) => {
                          switchFields(property, field, objectProps)
                        })
                      }
                      if (field.templates) {
                        field.templates.forEach((fieldTemplate) => {
                          if (typeof fieldTemplate === 'string') {
                            throw new Error(
                              `Global fields not supported at this time`
                            )
                          }
                          fieldTemplate.fields.forEach((field) => {
                            switchFields(property, field, objectProps)
                          })
                        })
                      }
                    })
                    objectArrayProps.push(objectProps)
                  } else {
                    throw new Error(
                      `Unexpected expression type ${element.type}`
                    )
                  }
                  props[field.name] = objectArrayProps
                })
              } else {
                throw new Error('Only object expressions are supported')
              }
            }
          })
        }
      }
      break

    case 'rich-text':
      if (attribute.value) {
        if (Array.isArray(attribute.value)) {
          const mdx = parseMDXInner(
            { type: 'root', children: attribute.value },
            field
          )
          if (mdx) {
            props[field.name] = mdx
          }
        } else {
          try {
            // console.log(attribute.value)
            const mdx = parseMDX(attribute.value.value, field)

            // console.log(props, JSON.stringify(mdx, null, 2))
            // console.log(field.name)
            props[field.name] = mdx.children[0].props
          } catch (e) {
            console.log(e)
          }
        }
      } else {
        console.log('nothing', field.name, mdx)
      }
      break
  }
}
