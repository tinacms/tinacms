import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'
import type { RichTypeInner } from '../types'
import { SlateNodeType } from './parse'
import type { Content, PhrasingContent, StaticPhrasingContent } from 'mdast'

export const stringifyMDX = (value: unknown, field: RichTypeInner) => {
  // @ts-ignore: FIXME: validate this shape
  const slateTree: SlateNodeType[] = value.children
  try {
    const tree = slateTree.map((item) => stringify(item, field))
    const out = toMarkdown(
      {
        type: 'root',
        // @ts-ignore
        children: tree,
      },
      {
        extensions: [mdxToMarkdown],
      }
    )
    return out.replace(/&#x22;/g, `"`)
  } catch (e) {
    console.log(e)
  }
}

export const stringify = (
  node: SlateNodeType,
  field: RichTypeInner
): Content => {
  if (!node.type) {
    return {
      type: 'text',
      // @ts-ignore
      value: node.text || '',
    }
  }

  switch (node.type) {
    case 'heading_one':
      return {
        type: 'heading',
        depth: 1,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_two':
      return {
        type: 'heading',
        depth: 2,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_three':
      return {
        type: 'heading',
        depth: 3,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_four':
      return {
        type: 'heading',
        depth: 4,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_five':
      return {
        type: 'heading',
        depth: 5,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_six':
      return {
        type: 'heading',
        depth: 6,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'paragraph':
      return {
        type: 'paragraph',
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'link':
      return {
        type: 'link',
        url: node.link,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as StaticPhrasingContent[],
      }
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      try {
        let children = []
        const atts = []
        const template = field.templates?.find((fieldTemplate) => {
          if (typeof fieldTemplate === 'string') {
            throw new Error(`Global templates not yet supported`)
          } else {
            return fieldTemplate.name === node.name
          }
        })
        if (typeof template === 'string') {
          throw new Error(`Global templates not yet supported`)
        }
        Object.entries(node.props).map(([key, value]) => {
          if (template.fields) {
            const field = template.fields.find((field) => field.name === key)
            if (!field) {
              throw new Error(`Unknown field for key ${key}`)
            }
            switch (field.type) {
              case 'boolean':
              case 'datetime':
              case 'image':
              case 'number':
              case 'string':
                if (field.list) {
                  const v = {
                    type: 'mdxJsxAttributeValueExpression',
                    value: `[${value.map((item) => {
                      switch (field.type) {
                        case 'boolean':
                        case 'number':
                          return `${item}`
                        case 'image':
                        case 'datetime':
                        case 'string':
                          return `"${item}"`
                      }
                    })}]`,
                  }
                  atts.push({ type: 'mdxJsxAttribute', name: key, value: v })
                } else {
                  atts.push({
                    type: 'mdxJsxAttribute',
                    name: key,
                    value: `${value}`,
                  })
                }
                break

              case 'object':
                if (field.list) {
                  const values = []
                  value.forEach((item) => {
                    if (field.fields) {
                      const v = {}
                      if (typeof field.fields === 'string') {
                        throw new Error(
                          `Global templates not yet supported for rich text`
                        )
                      }
                      field.fields.forEach((field) => {
                        const fieldValue = item[field.name]
                        if (fieldValue) {
                          switch (field.type) {
                            case 'boolean':
                            case 'number':
                              v[field.name] = `${fieldValue}`
                              break
                            case 'image':
                            case 'datetime':
                            case 'string':
                              v[field.name] = `"${fieldValue}"`
                              break
                          }
                        }
                        values.push(v)
                      })
                    } else {
                      value.forEach((item) => {
                        // Only take the first item
                        const [itemTemplateName, itemValues] =
                          Object.entries(item)[0]
                        const template = field.templates.find((template) => {
                          const templateName =
                            typeof template === 'string'
                              ? template
                              : template.name
                          console.log(itemTemplateName)
                          return templateName === itemTemplateName
                        })
                        if (typeof template === 'string') {
                          throw new Error(
                            `Global templates not yet supported for rich text`
                          )
                        }
                        if (!template) {
                          throw new Error(
                            `Unable to find template for field ${field.name}`
                          )
                        }
                        const v = {}
                        template.fields.forEach((field) => {
                          const fieldValue = itemValues[field.name]
                          if (fieldValue) {
                            switch (field.type) {
                              case 'boolean':
                              case 'number':
                                v[field.name] = `${fieldValue}`
                                break
                              case 'image':
                              case 'datetime':
                              case 'string':
                                v[field.name] = `"${fieldValue}"`
                                break
                            }
                            v['_template'] = `"${template.name}"`
                          }
                        })
                        values.push(v)
                      })
                    }
                  })
                  if (values.length > 0) {
                    const ast = {
                      type: 'mdxJsxAttributeValueExpression',
                      name: key,
                      value: {
                        value: `[${values
                          .map((item) => {
                            return `{${Object.entries(item)
                              .map(([key, value]) => {
                                return `${key}: ${value}`
                              })
                              .join(', ')}}`
                          })
                          .join(', ')}]`,
                      },
                    }
                    atts.push({ name: key, ...ast })
                  }
                } else {
                  if (field.fields) {
                    const v = {}
                    if (typeof field.fields === 'string') {
                      throw new Error(
                        `Global templates not yet supported for rich text`
                      )
                    }
                    field.fields.forEach((field) => {
                      const fieldValue = value[field.name]
                      switch (field.type) {
                        case 'boolean':
                        case 'number':
                          v[field.name] = `${fieldValue}`
                          break
                        case 'image':
                        case 'datetime':
                        case 'string':
                          v[field.name] = `"${fieldValue}"`
                          break
                      }
                    })
                    const ast = {
                      type: 'mdxJsxAttributeValueExpression',
                      name: key,
                      value: {
                        value: `{${Object.entries(v)
                          .map(([key, value]) => {
                            return `${key}: ${value}`
                          })
                          .join(', ')}}`,
                      },
                    }
                    atts.push({ name: key, ...ast })
                  } else {
                    throw new Error('Templates not yet')
                  }
                }
                break
              case 'rich-text':
                const tree = value.children
                  .map((item) => stringify(item, field))
                  .filter((item) => {
                    if (item.type === 'text' && !item.text) {
                      return false
                    }

                    return true
                  })
                if (field.name === 'children') {
                  children = tree
                } else {
                  const out = toMarkdown(
                    {
                      type: 'root',
                      children: tree,
                    },
                    { extensions: [mdxToMarkdown] }
                  )
                  if (out) {
                    atts.push({
                      type: 'mdxJsxAttribute',
                      name: key,
                      value: {
                        value: `
<>
${out}
</>
`,
                      },
                    })
                  }
                }
                break
              default:
                atts.push({
                  type: 'mdxJsxAttribute',
                  name: key,
                  value: 'not yet',
                })
                break
            }
          } else {
            throw new Error(`Templates not yet supported`)
          }
        })

        return {
          ...node,
          children: children,
          //@ts-ignore
          attributes: atts,
        }
      } catch (e) {
        console.log(e)
      }

    case 'text':
      return {
        type: 'text',
        // @ts-ignore
        value: node.text || '',
      }
    default:
      console.log(`Unrecognized field type: ${node.type}`)
      break
  }
  return { type: 'text', value: '' }
}
