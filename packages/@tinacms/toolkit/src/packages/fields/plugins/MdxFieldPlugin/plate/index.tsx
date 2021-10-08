import React from 'react'
import { MdxField, PopupAdder, ImageField } from '../field'
import type { InputProps } from '../../../components'
import { Transforms, Editor } from 'slate'
import styled from 'styled-components'
import { Form } from '../../../../forms'
import {
  withPlate,
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
  createImagePlugin,
  createBasicMarkPlugins,
  createListPlugin,
  createAutoformatPlugin,
  createResetNodePlugin,
  createTrailingBlockPlugin,
  createHorizontalRulePlugin,
  createSelectOnBackspacePlugin,
  useStoreEditorRef,
  createSoftBreakPlugin,
  createExitBreakPlugin,
  getPlatePluginTypes,
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
  HeadingToolbar,
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
  ELEMENT_LIC,
  MARK_ITALIC,
  MARK_BOLD,
  MARK_STRIKETHROUGH,
  // not going to use
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  getRenderElement,
  getPlatePluginType,
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

import {
  optionsAutoformat,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from './pluginOptions'
import { ToolbarButtons } from './toolbar'
import { useCMS } from '../../../../react-core'

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

export const createTinaImagePlugin = () => {
  return {
    pluginKeys: 'img',
    voidTypes: getPlatePluginTypes('img'),
    renderElement: getRenderElement('img'),
  }
}

export const createMDXPlugin = (): PlatePlugin => ({
  pluginKeys: 'mdxJsxFlowElement',
  voidTypes: getPlatePluginTypes('mdxJsxFlowElement'),
  renderElement: getRenderElement('mdxJsxFlowElement'),
})

export const createMDXTextPlugin = (): PlatePlugin => ({
  pluginKeys: 'mdxJsxTextElement',
  voidTypes: getPlatePluginTypes('mdxJsxTextElement'),
  inlineTypes: getPlatePluginTypes('mdxJsxTextElement'),
  renderElement: getRenderElement('mdxJsxTextElement'),
})

const options = createPlateOptions()

// Transform encoded data URL to File (for image updloads)
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const Img = (props) => {
  const editor = useStoreEditorRef(props.name)
  const isFocused = useFocused()
  const isSelected = useSelected()
  const cms = useCMS()

  const [localState, setLocalState] = React.useState({
    caption: props.element.caption,
    url: props.element.url,
  })
  React.useEffect(() => {
    const run = async () => {
      if (props.element.url) {
        // If it's base64 encoded, that means it came as a result of drag and drop, so upload
        // it to the media source
        if (props.element.url.startsWith('data')) {
          // FIXME: the name "tina-upload" will actually be sent to Cloudinary and stored as part
          // of the name, not currently an easy way to grab the name of the
          // dropped file in the base64 url
          const file = dataURLtoFile(props.element.url, 'tina-upload')
          const allMedia = await cms.media.persist([
            {
              directory: '',
              file,
            },
          ])
          // FIXME: if the user submits the form before this is updated they'll get
          // the base64 data url stored in markdown, which would be bad because it's
          // potentially very large. We should probably freeze form submission until
          // this is updated to mitigate that.
          setLocalState({ ...localState, url: allMedia[0].previewSrc })
        }
      }
      Transforms.setNodes(editor, localState, {
        // @ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
        at: ReactEditor.findPath(editor, props.element),
        match: (node) => {
          if (node.type === 'img') {
            return true
          } else {
            return false
          }
        },
      })
    }
    run()
  }, [editor, JSON.stringify(localState)])
  const id = props.element.name + Math.floor(Math.random() * 100)
  const form = React.useMemo(() => {
    return new Form({
      id,
      label: id,
      initialValues: {
        url: props.element.url,
        caption: props.element.caption,
        alt: props.element.alt,
      },
      onChange: ({ values }) => {
        setLocalState(values)
      },
      onSubmit: () => {},
      fields: [
        {
          name: 'url',
          label: 'Source',
          component: 'image',
        },
        {
          name: 'caption',
          label: 'Caption',
          component: 'text',
        },
        {
          name: 'alt',
          label: 'Alt',
          component: 'text',
        },
      ],
    })
  }, [setLocalState])
  return (
    <div
      {...props.attributes}
      style={{
        boxShadow: isSelected && isFocused ? '0 0 0 3px #B4D5FF' : 'none',
      }}
    >
      <div
        style={{
          userSelect: 'none',
        }}
        contentEditable={false}
      >
        <ImageField tinaForm={form}>
          <figure>
            <img
              style={{ width: '100%' }}
              src={localState.url}
              alt={props.element.alt}
            />
            <figcaption
              style={{
                display: 'block',
                margin: '8px auto 0',
                textAlign: 'center',
              }}
            >
              {localState.caption}
            </figcaption>
          </figure>
        </ImageField>
      </div>
      {props.children}
    </div>
  )
}

export const RichEditor = wrapFieldsWithMeta<
  InputProps,
  { templates: unknown[] }
>((props) => {
  const [value, setValue] = React.useState(
    props.input.value.children
      ? [...props.input.value.children?.map(normalize)]
      : [{ type: 'p', children: [{ type: 'text', text: '' }] }]
  )

  const templates = props.field.templates

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])
  const name = props.input.name
  const components = createPlateComponents({
    img: (props) => <Img {...props} name={name} />,
    mdxJsxTextElement: (props) => {
      return <MdxPicker {...props} templates={templates} inline={true} />
    },
    mdxJsxFlowElement: (props) => {
      return <MdxPicker {...props} templates={templates} inline={false} />
    },
  })

  const pluginsBasic = [
    createTinaImagePlugin(),
    createMDXPlugin(),
    createMDXTextPlugin(),
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
    createImagePlugin(),
    // marks
    createBoldPlugin(), // bold mark
    createItalicPlugin(), // italic mark
    createUnderlinePlugin(), // underline mark
    createStrikethroughPlugin(), // strikethrough mark
    createCodePlugin(), // code mark
    ...createBasicMarkPlugins(),
    // autoformat rules
    createAutoformatPlugin(optionsAutoformat),
    createResetNodePlugin(optionsResetBlockTypePlugin),
    createSoftBreakPlugin(optionsSoftBreakPlugin),
    createExitBreakPlugin(optionsExitBreakPlugin),
    createTrailingBlockPlugin({
      type: ELEMENT_PARAGRAPH,
    }),
    createSelectOnBackspacePlugin({
      allow: [ELEMENT_IMAGE],
    }),
  ]
  return (
    <>
      <Wrapper>
        <ToolbarWrapper>
          <div>
            <ToolbarButtons name={props.input.name} templates={templates} />
          </div>
        </ToolbarWrapper>
        <PlateWrapper>
          <Plate
            id={props.input.name}
            initialValue={value}
            plugins={pluginsBasic}
            components={components}
            options={options}
            onChange={(value) => {
              setValue(value)
            }}
          />
        </PlateWrapper>
      </Wrapper>
    </>
  )
})

const normalize = (node: SlateNodeType) => {
  if (['mdxJsxFlowElement', 'mdxJsxTextElement', 'img'].includes(node.type)) {
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
  const editor = useStoreEditorRef(props.name)
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
        const isInline = props.element.type === 'mdxJsxTextElement'
        if (isInline) {
          const newProperties = {
            props: values,
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
            props: values,
          }

          // @ts-ignore BaseEditor fix
          Transforms.setNodes(editor, newProperties, {
            // ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
            at: ReactEditor.findPath(editor, props.element),
          })
        }
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

const Wrapper = styled.div`
  /* background: white;
  border-radius: 4px;
  border: 1px solid #efefef; */
`
const ToolbarWrapper = styled.div`
  /* position: sticky; */
  /* top: 30px; */
  z-index: 100;
  /* box-shadow: 0 0 3px rgb(0 0 0 / 7%), 2px 0 8px rgb(0 0 0 / 7%); */
  & > div {
    display: flex;
    flex-wrap: wrap;
  }
`
const PlateWrapper = styled.div`
  background: white;
  border-radius: 4px;
  border: 1px solid #efefef;
  padding: 10px;
  ul {
    list-style: disc;
  }
  ol {
    list-style: decimal;
  }
`
