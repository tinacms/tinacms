// import 'tippy.js/animations/scale.css'
// import 'tippy.js/dist/tippy.css'
import React from 'react'
import { Transforms, Editor, createEditor } from 'slate'
import styled from 'styled-components'
import {
  addColumn,
  addRow,
  BalloonToolbar,
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_UL,
  insertTable,
  MARK_BOLD,
  ToolbarButton,
  MARK_CODE,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  ToolbarAlign,
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarList,
  ToolbarMark,
  ToolbarTable,
  ToolbarLink,
  ToolbarImage,
  useStoreEditorRef,
  useEventEditorId,
  getPlatePluginType,
  MARK_HIGHLIGHT,
  MARK_COLOR,
  MARK_BG_COLOR,
  ToolbarColorPicker,
} from '@udecode/plate'
import {
  HeadingIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ImageIcon,
  QuoteIcon,
  OrderedListIcon,
  CodeIcon,
  UnorderedListIcon,
  UnderlineIcon,
  LinkIcon,
  LightningIcon,
} from './icons'
import { PopupAdder } from '../field'
import { HeaderPopup } from '../heading'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  .slate-ToolbarButton-active {
    svg,
    strong {
      color: var(--tina-color-primary-light);
    }
  }
`

export const ToolbarButtons = ({ name, templates }) => {
  const editor = useStoreEditorRef(name)
  const popup = {
    showButton: true,
    onAdd: (template) => {
      Transforms.insertNodes(editor, [
        {
          type: template.inline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement',
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
    },
    templates: templates,
  }
  return (
    <Wrapper>
      <HeaderPopup icon={<HeadingIcon />}>
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H1)}
          icon={<strong>H1</strong>}
        />
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H2)}
          icon={<strong>H2</strong>}
        />
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H3)}
          icon={<strong>H3</strong>}
        />
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H4)}
          icon={<strong>H4</strong>}
        />
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H5)}
          icon={<strong>H5</strong>}
        />
        <ToolbarElement
          type={getPlatePluginType(editor, ELEMENT_H6)}
          icon={<strong>H6</strong>}
        />
      </HeaderPopup>
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<QuoteIcon />}
      />
      <ToolbarCodeBlock
        type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
        icon={<CodeIcon />}
      />
      <ToolbarLink icon={<LinkIcon />} />
      {/* <ToolbarImage icon={<ImageIcon />} /> */}
      <ToolbarButton
        icon={<ImageIcon />}
        onMouseDown={() => {
          Transforms.insertNodes(editor, [
            {
              type: 'img',
              url: 'http://placehold.it/300x200?text=Image',
              alt: 'Some Image',
              caption: '',
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
      />

      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_UL)}
        icon={<UnorderedListIcon />}
      />
      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_OL)}
        icon={<OrderedListIcon />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_BOLD)}
        icon={<BoldIcon />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_ITALIC)}
        icon={<ItalicIcon />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_UNDERLINE)}
        icon={<UnderlineIcon />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_STRIKETHROUGH)}
        icon={<StrikethroughIcon />}
      />
      <PopupAdder {...popup} icon={<LightningIcon />} />
    </Wrapper>
  )
}
