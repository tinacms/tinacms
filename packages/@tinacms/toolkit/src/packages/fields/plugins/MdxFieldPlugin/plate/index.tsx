import React from 'react'
import { MdxField, PopupAdder } from '../field'
import type { InputProps } from '../../../components'
import { Transforms, Editor } from 'slate'
import { Form } from '../../../../forms'
import {
  Plate,
  createReactPlugin, // withReact
  createHistoryPlugin, // withHistory
  unwrapList,
  createParagraphPlugin, // paragraph element
  createBlockquotePlugin, // blockquote element
  createCodeBlockPlugin, // code block element
  createHeadingPlugin, // heading elements
  createBoldPlugin, // bold mark
  createItalicPlugin, // italic mark
  createUnderlinePlugin, // underline mark
  createStrikethroughPlugin, // strikethrough mark
  createCodePlugin, // code mark
  createPlateComponents,
  createPlateOptions,
  createLinkPlugin,
  createBasicMarkPlugins,
  createListPlugin,
  createAutoformatPlugin,
  createHorizontalRulePlugin,
  useStoreEditorRef,
  createSoftBreakPlugin,
  createExitBreakPlugin,
  TElement,
  TodoListItemNodeData,
  AutoformatBlockRule,
  AutoformatRule,
  getParent,
  isElement,
  isType,
  SPEditor,
  TEditor,
  PlatePlugin,
  toggleList,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_DEFAULT,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  MARK_ITALIC,
  MARK_BOLD,
  MARK_STRIKETHROUGH,
  // not going to use
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_LIC,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
} from '@udecode/plate'
import { useSelected, useFocused, ReactEditor } from 'slate-react'
import type { SlateNodeType } from '../types'
import { wrapFieldsWithMeta } from '../../wrapFieldWithMeta'
import {
  HeadingIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  MediaIcon,
  TableIcon,
  QuoteIcon,
  CodeIcon,
  OrderedListIcon,
  UnderlineIcon,
  UndoIcon,
  RedoIcon,
} from '../../../../icons'

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
        // @ts-ignore BaseEditor fix
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => Editor.isBlock(editor, n),
        }
      ),
  },
]

export const createMDXPlugin = ({ templates }): PlatePlugin => ({
  pluginKeys: 'mdxJsxTextElement',
  voidTypes: () => ['mdxJsxTextElement', 'mdxJsxFlowElement'],
  inlineTypes: () => ['mdxJsxTextElement'],
  renderElement: (editor) => (props) => {
    const isInline = props.element.type === 'mdxJsxTextElement'
    return (
      <MdxPicker
        {...props}
        templates={templates}
        inline={isInline}
        onChange={(value) => {
          if (isInline) {
            const newProperties = {
              props: value,
            }
            // @ts-ignore BaseEditor fix
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
              match: (node) => {
                // @ts-ignore BaseEditor fix
                if (node.type === 'mdxJsxTextElement') {
                  return true
                }
                return false
              },
              // @ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
              at: ReactEditor.findPath(editor, props.element),
            })
          } else {
            const newProperties = {
              props: value,
            }
            // @ts-ignore BaseEditor fix
            Transforms.setNodes(editor, newProperties, {
              // @ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
              at: ReactEditor.findPath(editor, props.element),
            })
          }
        }}
      />
    )
  },
})

const components = createPlateComponents()
const options = createPlateOptions()

const Toolbar = () => {
  return (
    <div style={{ display: 'flex' }}>
      {[
        HeadingIcon,
        BoldIcon,
        ItalicIcon,
        StrikethroughIcon,
        MediaIcon,
        TableIcon,
        QuoteIcon,
        CodeIcon,
        OrderedListIcon,
        UnderlineIcon,
        UndoIcon,
        RedoIcon,
      ].map((Icon) => {
        return (
          <div style={{ width: '28px' }}>
            <Icon />
          </div>
        )
      })}
    </div>
  )
}

export const RichEditor = wrapFieldsWithMeta<
  InputProps,
  { templates: unknown[] }
>((props) => {
  const editor = useStoreEditorRef(props.input.name)

  const [value, setValue] = React.useState(
    props.input.value.children
      ? [...props.input.value.children?.map(normalize)]
      : [{ type: 'p', children: [{ type: 'text', text: '' }] }]
  )

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
    createMDXPlugin({ templates }),
    // marks
    createBoldPlugin(), // bold mark
    createItalicPlugin(), // italic mark
    createUnderlinePlugin(), // underline mark
    createStrikethroughPlugin(), // strikethrough mark
    createCodePlugin(), // code mark
    createBasicMarkPlugins(),
    // autoformat rules
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
            // @ts-ignore BaseEditor fix
            Transforms.setNodes(editor, { type: ELEMENT_HR })
            Transforms.insertNodes(editor, {
              // @ts-ignore BaseEditor fix
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
  ]
  return (
    <>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Toolbar />
          </div>
          <PopupAdder
            showButton={true}
            onAdd={(template) => {
              Transforms.insertNodes(editor, [
                {
                  type: template.inline
                    ? 'mdxJsxTextElement'
                    : 'mdxJsxFlowElement',
                  name: template.name,
                  props: template.defaultItem,
                  ordered: false,
                  children: [
                    {
                      // @ts-ignore BaseEditor fix
                      type: 'text',
                      text: '',
                    },
                  ],
                },
              ])
            }}
            templates={templates}
          />
        </div>

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
})

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
        props.onChange(values)
      },
      onSubmit: () => {},
      fields: activeTemplate ? activeTemplate.fields : [],
    })
  }, [])

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
          inline={props.inline}
          tinaForm={form}
          field={activeTemplate}
        />
      </div>
      {props.children}
    </div>
  )
}
