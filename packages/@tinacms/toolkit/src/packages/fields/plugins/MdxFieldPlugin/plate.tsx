import React, { useState } from 'react'
import { Transforms, Editor } from 'slate'
import {
  Plate,
  // editor
  createReactPlugin, // withReact
  createHistoryPlugin, // withHistory
  unwrapList,
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
  createLinkPlugin,
  createListPlugin,
  createAutoformatPlugin,
  createHorizontalRulePlugin,
  createSoftBreakPlugin,
  createExitBreakPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_DEFAULT,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  MARK_ITALIC,
  MARK_BOLD,
  MARK_STRIKETHROUGH,
  AutoformatBlockRule,
  AutoformatRule,
  getParent,
  isElement,
  isType,
  SPEditor,
  TEditor,
  toggleList,
} from '@udecode/plate'
import { createDeserializeMDPlugin } from '@udecode/plate-md-serializer'
import type { SlateNodeType } from './types'

export const clearBlockFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor as SPEditor)

export const format = (editor: TEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParent(editor, editor.selection)
    if (!parentEntry) return
    const [node] = parentEntry
    if (
      isElement(node) &&
      !isType(editor as SPEditor, node, ELEMENT_CODE_BLOCK) &&
      !isType(editor as SPEditor, node, ELEMENT_CODE_LINE)
    ) {
      customFormatting()
    }
  }
}

export const formatList = (editor: TEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor as SPEditor, {
      type: elementType,
    })
  )
}

export const formatText = (editor: TEditor, text: string) => {
  format(editor, () => editor.insertText(text))
}

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    preFormat: clearBlockFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['1. ', '1) '],
    preFormat: clearBlockFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[] ',
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[x] ',
    format: (editor) =>
      Transforms.setNodes<TElement<TodoListItemNodeData>>(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => Editor.isBlock(editor, n),
        }
      ),
  },
]

const components = createPlateComponents()
const options = createPlateOptions()

const pluginsBasic = [
  // editor
  createReactPlugin(), // withReact
  createHistoryPlugin(), // withHistory
  createHorizontalRulePlugin(),
  // elements
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
  createLinkPlugin(), // link elements
  createListPlugin(),
  createAutoformatPlugin({
    rules: [
      ...autoformatLists,
      {
        mode: 'block',
        type: ELEMENT_H1,
        match: '# ',
      },
      {
        mode: 'block',
        type: ELEMENT_HR,
        match: ['---', '—-', '___ '],
        preFormat: clearBlockFormat,
        format: (editor) => {
          Transforms.setNodes(editor, { type: ELEMENT_HR })
          Transforms.insertNodes(editor, {
            type: ELEMENT_DEFAULT,
            children: [{ text: '' }],
          })
        },
      },
    ],
  }),
  createSoftBreakPlugin({
    rules: [
      {
        hotkey: 'mod+enter',
      },
    ],
  }),
  createExitBreakPlugin({
    rules: [
      {
        hotkey: 'enter',
      },
    ],
  }),
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '35px',
        }}
      >
        <label
          style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}
        >
          {props.field.label}
        </label>
      </div>
      <div
        style={{
          padding: '10px',
          marginBottom: '18px',
          background: 'white',
          borderRadius: '4px',
          border: '1px solid #efefef',
        }}
        className="slate-tina-field"
      >
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
      </div>
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
