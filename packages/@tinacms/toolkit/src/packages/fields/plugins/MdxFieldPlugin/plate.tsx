import React, { useState } from 'react'
import {
  Plate,
  // editor
  createReactPlugin, // withReact
  createHistoryPlugin, // withHistory

  // elements
  createParagraphPlugin, // paragraph element
  createBlockquotePlugin, // blockquote element
  createCodeBlockPlugin, // code block element
  createHeadingPlugin, // heading elements

  // marks
  createBoldPlugin, // bold mark
  createItalicPlugin, // italic mark
  createUnderlinePlugin, // underline mark
  createStrikethroughPlugin, // strikethrough mark
  createCodePlugin, // code mark
  createPlateComponents,
  createPlateOptions,
} from '@udecode/plate'
import { createDeserializeMDPlugin } from '@udecode/plate-md-serializer'
import type { SlateNodeType } from './types'

const components = createPlateComponents()
const options = createPlateOptions()

const pluginsBasic = [
  // editor
  createReactPlugin(), // withReact
  createHistoryPlugin(), // withHistory

  // elements
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements

  // marks
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
  createDeserializeMDPlugin(),
]

export const RichEditor = (props) => {
  const [value, setValue] = React.useState(
    props.input.value.children
      ? [
          ...props.input.value.children?.map(normalize),
          // { type: 'paragraph', children: [{ type: 'text', text: '' }] },
        ]
      : [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }]
  )

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])

  return (
    <>
      <Plate
        id="1"
        // editableProps={editableProps}
        initialValue={value}
        plugins={pluginsBasic}
        components={components}
        options={options}
        onChange={setValue}
      />
      {/* {value} */}
    </>
  )
}

const normalize = (node: SlateNodeType) => {
  if (['mdxJsxFlowElement', 'mdxJsxTextElement', 'image'].includes(node.type)) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
    }
  }
  //@ts-ignore
  if (node.children) {
    return {
      ...node,
      //@ts-ignore

      children: node.children.map(normalize),
    }
  }
  return node
}
