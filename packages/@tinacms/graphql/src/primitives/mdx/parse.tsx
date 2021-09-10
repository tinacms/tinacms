import { unified } from 'unified'
import markdown from 'remark-parse'
import mdx from 'remark-mdx'
import deserialize from './slate/deserialize'
import { TinaField } from '../..'
import { visit } from 'unist-util-visit'
import type { RichTypeInner } from '../types'

export const parseMDX = (value: string, field: RichTypeInner) => {
  const tree = unified().use(markdown).use(mdx).parse(value)
  return parseMDXInner(tree, field)
}
export const parseMDXInner = (tree: any, field: RichTypeInner) => {
  // Delete useless position info
  visit(tree, (node) => {
    delete node.position
  })
  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
    let props = {}
    if (!node.name) {
      props = parseMDXInner({ type: 'root', children: node.children }, field)
    }
    const template = field.templates.find((template) => {
      const templateName =
        typeof template === 'string' ? template : template.name
      return templateName === node.name
    })

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

  const slateTree = tree.children.map(deserialize)
  return { type: 'root', children: slateTree }
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
        /**
         * this is MDX as a children prop, meaning it doesn't have fragment wrappers (<>Some MDX</>)
         * <Hero>
         *   # This is MDX in the children prop
         * </Hero>
         */
        if (field.name === 'children') {
          if (Array.isArray(attribute.value)) {
            // console.log(field.name)
            props[field.name] = parseMDXInner(
              { type: 'root', children: attribute.value },
              field
            )
          } else {
            throw Error(
              `Expected an array of MDX strings for rich-text field with the special name 'children'`
            )
          }
        } else {
          /**
           * this is MDX as a non-children prop, it has fragment wrappers, so we need
           * to dig down to the first child and grab its props, since that's effectively the MDX we actually care about:
           *
           * <Hero
           *  subHeader={<>
           *    # This is MDX in a non-children prop    <---- this is the part we actually care about
           *  </>}
           * />
           */
          try {
            const mdx = parseMDX(attribute.value.value, field)
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
