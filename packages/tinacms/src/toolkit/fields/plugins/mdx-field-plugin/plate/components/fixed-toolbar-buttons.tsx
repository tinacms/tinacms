import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  ListStyleType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate'
import React from 'react'
import { ToolbarGroup } from './plate-ui/toolbar'
import { MarkToolbarButton } from './plate-ui/mark-toolbar-button'
import { Icons } from './plate-ui/icons'
import { IndentListToolbarButton } from './plate-ui/indent-list-toolbar-button'
import { HeadingsMenu } from './headings-dropdown'

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

export type toolbarItemName =
  | 'heading'
  | 'link'
  | 'image'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'code'
  | 'codeBlock'
  | 'bold'
  | 'italic'
  | 'raw'

export default function FixedToolbarButtons() {
  return (
    <div className="w-full overflow-hidden ">
      <div
        className="flex"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        <>
          <ToolbarGroup noSeparator>
            <HeadingsMenu />
          </ToolbarGroup>
          <ToolbarGroup>
            <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
              <Icons.bold />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
              <Icons.italic />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
              <Icons.code />
            </MarkToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <IndentListToolbarButton nodeType={ListStyleType.Disc} />
            <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
          </ToolbarGroup>
        </>
      </div>
    </div>
  )
}
