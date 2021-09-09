import { defaultNodeTypes, NodeTypes, SlateNodeType } from './deserialize'
import type {
  Root,
  Content,
  PhrasingContent,
  StaticPhrasingContent,
} from 'mdast'
import { RichTypeWithNamespace } from '../../types'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'

export interface LeafType {
  text: string
  strikeThrough?: boolean
  bold?: boolean
  italic?: boolean
  code?: boolean
  // parentType?: string
}

export interface BlockType {
  type: string
  // parentType?: string
  link?: string
  caption?: string
  language?: string
  break?: boolean
  children: Array<BlockType | LeafType>
}

interface Options {
  nodeTypes: NodeTypes
  listDepth?: number
  ignoreParagraphNewline?: boolean
}

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return typeof (node as LeafType).text === 'string'
}

const VOID_ELEMENTS: Array<keyof NodeTypes> = ['thematic_break']

const BREAK_TAG = '<br>'

export const stringify = (
  chunk: SlateNodeType,
  field: RichTypeWithNamespace
): Content => {
  if (!chunk.type) {
    return {
      type: 'text',
      // @ts-ignore
      value: chunk.text || '',
    }
  }
  const blockChunk = chunk

  switch (blockChunk.type) {
    case 'heading_one':
      return {
        type: 'heading',
        depth: 1,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_two':
      return {
        type: 'heading',
        depth: 2,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_three':
      return {
        type: 'heading',
        depth: 3,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_four':
      return {
        type: 'heading',
        depth: 4,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_five':
      return {
        type: 'heading',
        depth: 5,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'heading_six':
      return {
        type: 'heading',
        depth: 6,
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'paragraph':
      return {
        type: 'paragraph',
        children: blockChunk.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case 'link':
      return {
        type: 'link',
        url: blockChunk.link,
        children: blockChunk.children.map((child) =>
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
            return fieldTemplate.name === blockChunk.name
          }
        })
        if (typeof template === 'string') {
          throw new Error(`Global templates not yet supported`)
        }
        Object.entries(blockChunk.props).map(([key, value]) => {
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
                    // value: '["feature 1"]',
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
                        const template = field.templates.find(
                          (template) => template.name === item._template
                        )
                        const v = {}
                        template.fields.forEach((field) => {
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

        // console.log({
        //   ...blockChunk,
        //   attributes: atts,
        // })
        return {
          ...blockChunk,
          children: children,
          attributes: atts,
        }
      } catch (e) {
        console.log(e)
      }

    case 'text':
      return {
        type: 'text',
        value: blockChunk.text,
      }
    default:
      console.log(`Unrecognized field type: ${blockChunk.type}`)
      break
  }
  return { type: 'text', value: '' }
}

export default function serialize(
  chunk: BlockType | LeafType,
  opts: Options = { nodeTypes: defaultNodeTypes }
) {
  const {
    nodeTypes: userNodeTypes = defaultNodeTypes,
    ignoreParagraphNewline = false,
    listDepth = 0,
  } = opts

  let text = (chunk as LeafType).text || ''
  let type = (chunk as BlockType).type || ''

  const nodeTypes: NodeTypes = {
    ...defaultNodeTypes,
    ...userNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...userNodeTypes.heading,
    },
  }

  const LIST_TYPES = [nodeTypes.ul_list, nodeTypes.ol_list]

  let children = text

  if (!isLeafNode(chunk)) {
    children = chunk.children
      .map((c: BlockType | LeafType) => {
        const isList = !isLeafNode(c)
          ? LIST_TYPES.includes(c.type || '')
          : false

        const selfIsList = LIST_TYPES.includes(chunk.type || '')

        // Links can have the following shape
        // In which case we don't want to surround
        // with break tags
        // {
        //  type: 'paragraph',
        //  children: [
        //    { text: '' },
        //    { type: 'link', children: [{ text: foo.com }]}
        //    { text: '' }
        //  ]
        // }
        let childrenHasLink = false

        if (!isLeafNode(chunk) && Array.isArray(chunk.children)) {
          childrenHasLink = chunk.children.some(
            (f) => !isLeafNode(f) && f.type === nodeTypes.link
          )
        }

        return serialize(
          { ...c, parentType: type },
          {
            nodeTypes,
            // WOAH.
            // what we're doing here is pretty tricky, it relates to the block below where
            // we check for ignoreParagraphNewline and set type to paragraph.
            // We want to strip out empty paragraphs sometimes, but other times we don't.
            // If we're the descendant of a list, we know we don't want a bunch
            // of whitespace. If we're parallel to a link we also don't want
            // to respect neighboring paragraphs
            ignoreParagraphNewline:
              (ignoreParagraphNewline ||
                isList ||
                selfIsList ||
                childrenHasLink) &&
              // if we have c.break, never ignore empty paragraph new line
              !(c as BlockType).break,

            // track depth of nested lists so we can add proper spacing
            listDepth: LIST_TYPES.includes((c as BlockType).type || '')
              ? listDepth + 1
              : listDepth,
          }
        )
      })
      .join('')
  }

  // This is pretty fragile code, check the long comment where we iterate over children
  if (
    !ignoreParagraphNewline &&
    (text === '' || text === '\n') &&
    chunk.parentType === nodeTypes.paragraph
  ) {
    type = nodeTypes.paragraph
    children = BREAK_TAG
  }

  if (children === '' && !VOID_ELEMENTS.find((k) => nodeTypes[k] === type))
    return

  // Never allow decorating break tags with rich text formatting,
  // this can malform generated markdown
  // Also ensure we're only ever applying text formatting to leaf node
  // level chunks, otherwise we can end up in a situation where
  // we try applying formatting like to a node like this:
  // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
  // which is invalid markup and can mess everything up
  if (children !== BREAK_TAG && isLeafNode(chunk)) {
    if (chunk.strikeThrough && chunk.bold && chunk.italic) {
      children = retainWhitespaceAndFormat(children, '~~***')
    } else if (chunk.bold && chunk.italic) {
      children = retainWhitespaceAndFormat(children, '***')
    } else {
      if (chunk.bold) {
        children = retainWhitespaceAndFormat(children, '**')
      }

      if (chunk.italic) {
        children = retainWhitespaceAndFormat(children, '_')
      }

      if (chunk.strikeThrough) {
        children = retainWhitespaceAndFormat(children, '~~')
      }

      if (chunk.code) {
        children = retainWhitespaceAndFormat(children, '`')
      }
    }
  }

  switch (type) {
    case nodeTypes.heading[1]:
      return `# ${children}\n`
    case nodeTypes.heading[2]:
      return `## ${children}\n`
    case nodeTypes.heading[3]:
      return `### ${children}\n`
    case nodeTypes.heading[4]:
      return `#### ${children}\n`
    case nodeTypes.heading[5]:
      return `##### ${children}\n`
    case nodeTypes.heading[6]:
      return `###### ${children}\n`

    case nodeTypes.block_quote:
      // For some reason, marked is parsing blockquotes w/ one new line
      // as contiued blockquotes, so adding two new lines ensures that doesn't
      // happen
      return `> ${children}\n\n`

    case nodeTypes.code_block:
      return `\`\`\`${
        (chunk as BlockType).language || ''
      }\n${children}\n\`\`\`\n`

    case nodeTypes.link:
      return `[${children}](${(chunk as BlockType).link || ''})`
    case nodeTypes.image:
      return `![${(chunk as BlockType).caption}](${
        (chunk as BlockType).link || ''
      })`

    case nodeTypes.ul_list:
    case nodeTypes.ol_list:
      return `\n${children}\n`

    case nodeTypes.listItem:
      const isOL = chunk && chunk.parentType === nodeTypes.ol_list

      let spacer = ''
      for (let k = 0; listDepth > k; k++) {
        if (isOL) {
          // https://github.com/remarkjs/remark-react/issues/65
          spacer += '   '
        } else {
          spacer += '  '
        }
      }
      return `${spacer}${isOL ? '1.' : '-'} ${children}`

    case nodeTypes.paragraph:
      return `${children}\n`

    case nodeTypes.thematic_break:
      return `---\n`

    default:
      return children
  }
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
function retainWhitespaceAndFormat(string: string, format: string) {
  // we keep this for a comparison later
  const frozenString = string.trim()

  // children will be mutated
  let children = frozenString

  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const fullFormat = `${format}${children}${reverseStr(format)}`

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat
  }

  // if we do have whitespace, let's add our formatting around our trimmed string
  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const formattedString = format + children + reverseStr(format)

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString)
}

const reverseStr = (string: string) => string.split('').reverse().join('')
