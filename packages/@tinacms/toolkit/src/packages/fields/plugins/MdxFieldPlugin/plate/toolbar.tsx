// import 'tippy.js/animations/scale.css'
// import 'tippy.js/dist/tippy.css'
import React from 'react'
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
  MediaIcon,
  TableIcon,
  QuoteIcon,
  CodeIcon,
  UnorderedListIcon,
  OrderedListIcon,
  UnderlineIcon,
  UndoIcon,
  RedoIcon,
} from '../../../../icons'

export const ToolbarButtonsBasicElements = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'))

  return (
    <>
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H1)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H2)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H3)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H4)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H5)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H6)}
        icon={<HeadingIcon />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<QuoteIcon />}
      />
      <ToolbarCodeBlock
        type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
        icon={<CodeIcon />}
      />
    </>
  )
}

export const ToolbarButtonsList = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'))

  return (
    <>
      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_UL)}
        icon={<UnorderedListIcon />}
      />
      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_OL)}
        icon={<OrderedListIcon />}
      />
    </>
  )
}

export const ToolbarButtonsBasicMarks = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'))

  return (
    <>
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
    </>
  )
}

export const ToolbarButtons = () => (
  <>
    <ToolbarButtonsBasicElements />
    <ToolbarButtonsList />
    <ToolbarButtonsBasicMarks />
    {/* <ToolbarColorPicker pluginKey={MARK_COLOR} icon={<FormatColorText />} />
    <ToolbarColorPicker pluginKey={MARK_BG_COLOR} icon={<FontDownload />} />
    <ToolbarLink icon={<Link />} />
    <ToolbarImage icon={<Image />} /> */}
  </>
)
