import * as React from 'react'
import {
  useEditorState,
  toggleMark,
  toggleNodeType,
  toggleList,
  ELEMENT_LINK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_CODE,
} from '@udecode/plate-headless'
import { ToolbarItem, ToolbarItemType, EmbedButton } from './toolbar-item'
import { OverflowMenu } from './overflow-menu'
import { helpers } from '../../core/common'
import { classNames } from '../helpers'
import { useResize } from '../../../hooks/use-resize'
import { FloatingToolbarWrapper } from './floating-toolbar'
import { unwrapLink } from '../../create-link-plugin'
import { ELEMENT_IMG } from '../../create-img-plugin'

import type { MdxTemplate } from '../../../types'
import { useEditorContext } from '../../../editor-context'
import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block'

const headers = [
  {
    name: ELEMENT_H1,
    render: <h1 className="my-0 text-4xl font-medium">Heading 1</h1>,
  },
  {
    name: ELEMENT_H2,
    render: <h2 className="my-0 text-3xl font-medium">Heading 2</h2>,
  },
  {
    name: ELEMENT_H3,
    render: <h3 className="my-0 text-2xl font-semibold">Heading 3</h3>,
  },
  {
    name: ELEMENT_H4,
    render: <h4 className="my-0 text-xl font-bold">Heading 4</h4>,
  },
  /** Tailwind prose doesn't style h5 and h6 elements */
  {
    name: ELEMENT_H5,
    render: <h5 className="my-0 text-lg font-bold">Heading 5</h5>,
  },
  {
    name: ELEMENT_H6,
    render: <h6 className="my-0 text-base font-bold">Heading 6</h6>,
  },
  { name: ELEMENT_PARAGRAPH, render: <p className="my-0">Paragraph</p> },
]

const ICON_WIDTH = 40
const EMBED_ICON_WIDTH = 85

export function Toolbar({
  templates,
}: {
  inlineOnly: boolean
  templates: MdxTemplate[]
}) {
  const { setRawMode } = useEditorContext()
  const showEmbed = templates.length > 0
  const toolbarRef = React.useRef(null)
  const editor = useEditorState()!
  const isBoldActive = helpers.isMarkActive(editor, MARK_BOLD)
  const isCodeActive = helpers.isMarkActive(editor, MARK_CODE)
  const isItalicActive = helpers.isMarkActive(editor, MARK_ITALIC)
  const isLinkActive = helpers.isNodeActive(editor, ELEMENT_LINK)
  const ulActive = helpers.isListActive(editor, ELEMENT_UL)
  const olActive = helpers.isListActive(editor, ELEMENT_OL)
  const codeBlockActive = helpers.isNodeActive(editor, ELEMENT_CODE_BLOCK)
  const blockQuoteActive = helpers.isNodeActive(editor, ELEMENT_BLOCKQUOTE)
  const isImgActive = helpers.isNodeActive(editor, ELEMENT_IMG)

  const toolbarItems: ToolbarItemType[] = [
    {
      name: 'heading',
      label: 'Heading',
      active: false,
      options: headers.map((item) => (
        <span
          key={item.name}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleNodeType(editor, { activeType: item.name })
          }}
          className={classNames(
            'hover:bg-gray-100 hover:text-gray-900 cursor-pointer block px-4 py-2 text-sm w-full text-left'
          )}
        >
          {item.render}
        </span>
      )),
    },
    {
      name: 'link',
      label: 'Link',
      active: isLinkActive,
    },
    {
      name: 'image',
      label: 'Image',
      active: isImgActive,
    },
    {
      name: 'quote',
      label: 'Quote',
      active: blockQuoteActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleNodeType(editor, { activeType: ELEMENT_BLOCKQUOTE })
      },
    },
    {
      name: 'ul',
      label: 'Bullet List',
      active: ulActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleList(editor, { type: ELEMENT_UL })
      },
    },
    {
      name: 'ol',
      label: 'List',
      active: olActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleList(editor, { type: ELEMENT_OL })
      },
    },
    {
      name: 'code',
      label: 'Code',
      active: isCodeActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleMark(editor, { key: MARK_CODE })
      },
    },
    {
      name: 'codeBlock',
      label: 'Code Block',
      active: codeBlockActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        insertEmptyCodeBlock(editor)
      },
    },
    {
      name: 'bold',
      label: 'Bold',
      active: isBoldActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleMark(editor, { key: MARK_BOLD })
      },
    },
    {
      name: 'italic',
      label: 'Italic',
      active: isItalicActive,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleMark(editor, { key: MARK_ITALIC })
      },
    },
    {
      name: 'raw',
      label: 'Raw',
      active: false,
      onMouseDown: () => setRawMode(true),
    },
  ]
  const [itemsShown, setItemsShown] = React.useState(toolbarItems.length)

  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width
    const itemsShown = (width - (showEmbed ? EMBED_ICON_WIDTH : 0)) / ICON_WIDTH
    setItemsShown(Math.floor(itemsShown))
  })

  return (
    <div
      className="sticky top-1 inline-flex shadow rounded-md mb-2 z-50 max-w-full"
      style={{
        width: `${
          toolbarItems.length * ICON_WIDTH + (showEmbed ? EMBED_ICON_WIDTH : 0)
        }px`,
      }}
    >
      <div
        ref={toolbarRef}
        className="grid w-full"
        style={{
          gridTemplateColumns: showEmbed ? `1fr ${EMBED_ICON_WIDTH}px` : `1fr`,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${ICON_WIDTH}px, 1fr))`,
            gridTemplateRows: 'auto',
            gridAutoRows: 0,
          }}
        >
          {toolbarItems.map((toolbarItem, index) => {
            const isLastItem = index + 1 === itemsShown
            const hidden = index + 1 > itemsShown
            if (itemsShown < toolbarItems.length) {
              if (isLastItem) {
                return (
                  <OverflowMenu
                    key={toolbarItem.name}
                    itemsShown={itemsShown}
                    toolbarItems={toolbarItems}
                    showEmbed={showEmbed}
                  />
                )
              } else {
                return (
                  <ToolbarItem
                    key={toolbarItem.name}
                    name={toolbarItem.name}
                    hidden={hidden}
                    active={toolbarItem.active}
                    onMouseDown={toolbarItem.onMouseDown}
                    label={toolbarItem.label}
                    options={toolbarItem.options}
                    icon={toolbarItem.name}
                    isLastItem={isLastItem && !showEmbed}
                  />
                )
              }
            } else {
              return (
                <ToolbarItem
                  key={toolbarItem.name}
                  name={toolbarItem.name}
                  hidden={hidden}
                  active={toolbarItem.active}
                  onMouseDown={toolbarItem.onMouseDown}
                  label={toolbarItem.label}
                  options={toolbarItem.options}
                  icon={toolbarItem.name}
                  isLastItem={isLastItem && !showEmbed}
                />
              )
            }
          })}
        </div>
        {showEmbed && <EmbedButton templates={templates} editor={editor} />}
      </div>
    </div>
  )
}

export const FloatingToolbar = ({
  templates,
}: {
  templates: MdxTemplate[]
}) => {
  return (
    <FloatingToolbarWrapper>
      <Toolbar templates={templates} inlineOnly={true} />
    </FloatingToolbarWrapper>
  )
}

export const FloatingLink = () => {
  const editor = useEditorState()!
  const isLinkActive = helpers.isNodeActive(editor, ELEMENT_LINK)
  return (
    <FloatingToolbarWrapper position="bottom">
      {isLinkActive && (
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            unwrapLink(editor)
          }}
          className="mt-2 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-md bg-gray-100 text-gray-600 py-1 px-2"
        >
          Clear
        </button>
      )}
    </FloatingToolbarWrapper>
  )
}
