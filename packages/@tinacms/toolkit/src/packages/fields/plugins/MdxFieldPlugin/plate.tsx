import React, { useState } from 'react'
import { MdxField, PopupAdder } from './field'
import { Transforms, Editor, BaseRange } from 'slate'
import { Form } from '../../../forms'
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
  getRenderElement,
  getPlatePluginTypes,
  TEditor,
  PlatePlugin,
  toggleList,
} from '@udecode/plate'
import {
  useSelected,
  useFocused,
  Slate,
  Editable,
  withReact,
  ReactEditor,
} from 'slate-react'
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

// export const createMDXFlowPlugin = ({
//   templates,
//   voidSelection,
// }): PlatePlugin => ({
//   pluginKeys: 'mdxJsxFlowElement',
//   renderElement: (editor) => (props) => {
//     return (
//       <MdxPicker
//         inline={false}
//         {...props}
//         templates={templates}
//         isReady={!!voidSelection}
//         voidSelection={voidSelection}
//         onChange={(value, selection) => {
//           // const newProperties: Partial<Element> = {
//           //   props: value,
//           // }
//           // Transforms.setNodes(editor, newProperties, {
//           //   at: selection,
//           // })
//         }}
//       />
//     )
//   },
// })

export const createMDXTextPlugin = ({
  templates,
  voidSelection,
}): PlatePlugin => ({
  pluginKeys: 'mdxJsxTextElement',
  voidTypes: (editor) => ['mdxJsxTextElement', 'mdxJsxFlowElement'],
  inlineTypes: (editor) => ['mdxJsxTextElement'],
  renderElement: (editor) => (props) => {
    return (
      <MdxPicker
        editor={editor}
        {...props}
        templates={templates}
        inline={false}
        isReady={!!voidSelection}
        voidSelection={voidSelection}
        onChange={(value, selection) => {
          const newProperties: Partial<Element> = {
            props: value,
          }
          Transforms.setNodes(editor, newProperties, {
            /**
             * match traverses the ancestors of the relevant node
             * so matching on type works for this, but likely won't work
             * on more complex nested mdxJsxTextElement nodes. I think
             * we'll want to match the path to the selection path, but
             * they're off by one:
             * selection.focus.path => [0, 1, 0]
             * and path is [0, 1]. I believe that's because the last
             * 0 in the focus.path array is referring to the text node
             */
            match: (node, path) => {
              // console.log(selection.focus);
              if (node.type === 'mdxJsxTextElement') {
                console.log(node)

                return true
              }
              return false
            },
            at: ReactEditor.findPath(editor, props.element),
          })
        }}
      />
    )
  },
})

const components = createPlateComponents()
const options = createPlateOptions()

export const RichEditor = (props) => {
  const [value, setValue] = React.useState(
    props.input.value.children
      ? [...props.input.value.children?.map(normalize)]
      : [{ type: 'p', children: [{ type: 'text', text: '' }] }]
  )
  const [voidSelection, setVoidSelectionInner] = React.useState<BaseRange>(null)
  const setVoidSelection = (selection: BaseRange) => {
    setVoidSelectionInner(selection)
  }

  const templates = props.field.templates

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])

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
    // createMDXFlowPlugin({ templates, voidSelection }),
    createMDXTextPlugin({ templates, voidSelection }),
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
  // console.log(initialValue)
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
          id={props.input.name}
          // editableProps={editableProps}
          initialValue={value}
          plugins={pluginsBasic}
          components={components}
          options={options}
          onChange={(value) => {
            setValue(value)
          }}
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

export const MdxPicker = (props) => {
  const isFocused = useFocused()
  const isSelected = useSelected()
  const initialValues = props.element.props
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.name
  )
  const id = props.element.name + Math.floor(Math.random() * 100)
  const form = React.useMemo(() => {
    return new Form({
      id,
      label: id,
      initialValues,
      onChange: ({ values }) => {
        props.onChange(values, props.voidSelection)
      },
      onSubmit: () => {},
      fields: activeTemplate ? activeTemplate.fields : [],
    })
  }, [JSON.stringify(props.voidSelection)])

  return (
    <div
      {...props.attributes}
      style={{
        display: props.inline ? 'inline-block' : 'block',
        boxShadow: isSelected && isFocused ? '0 0 0 3px #B4D5FF' : 'none',
      }}
    >
      <div
        style={{
          userSelect: 'none',
        }}
        contentEditable={false}
      >
        <MdxField
          editor={props.editor}
          inline={props.inline}
          tinaForm={form}
          field={activeTemplate}
        />
      </div>
      {props.children}
    </div>
  )
}
