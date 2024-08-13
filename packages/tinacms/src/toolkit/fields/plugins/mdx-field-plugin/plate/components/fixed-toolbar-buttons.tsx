import {
  ELEMENT_OL,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
} from '@udecode/plate'
import React from 'react'
import { ToolbarGroup } from './plate-ui/toolbar'
import { MarkToolbarButton } from './plate-ui/mark-toolbar-button'
import { Icons } from './plate-ui/icons'
import { IndentListToolbarButton } from './plate-ui/indent-list-toolbar-button'
import { HeadingsMenu } from './headings-dropdown'
import { LinkToolbarButton } from './plate-ui/link-toolbar-button'
import { QuoteToolbarButton } from './plate-ui/quote-toolbar-button'
import { CodeBlockToolbarButton } from './plate-ui/code-block-toolbar-button'
import { ImageToolbarButton } from './plate-ui/image-toolbar-button'
import { RawMarkdownToolbarButton } from './plate-ui/raw-markdown-toolbar-button'
import TemplatesToolbarButton from './plate-ui/templates-toolbar-button'
import {
  EMBED_ICON_WIDTH,
  ICON_WIDTH,
  type ToolbarOverrideType,
} from '../toolbar/toolbar-overrides'
import { useResize } from '../hooks/use-resize'
import OverflowMenu from './plate-ui/overflow-menu'
import { useToolbarContext } from '../toolbar/toolbar-provider'

export type ToolbarItem = {
  label: string
  Component: React.ReactNode
}

const toolbarItems: { [key in ToolbarOverrideType]: ToolbarItem } = {
  heading: {
    label: 'Headings',
    Component: (
      <ToolbarGroup noSeparator>
        <HeadingsMenu />
      </ToolbarGroup>
    ),
  },
  link: {
    label: 'Link',
    Component: <LinkToolbarButton />,
  },
  image: {
    label: 'Image',
    Component: <ImageToolbarButton />,
  },
  quote: {
    label: 'Quote',
    Component: <QuoteToolbarButton tooltip="Quote Quote (⌘+⇧+.)" />,
  },
  ul: {
    label: 'Unordered List',
    Component: <IndentListToolbarButton nodeType={ELEMENT_UL} />,
  },
  ol: {
    label: 'Ordered List',
    Component: <IndentListToolbarButton nodeType={ELEMENT_OL} />,
  },
  bold: {
    label: 'Bold',
    Component: (
      <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
        <Icons.bold />
      </MarkToolbarButton>
    ),
  },
  italic: {
    label: 'Italic',
    Component: (
      <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
        <Icons.italic />
      </MarkToolbarButton>
    ),
  },
  code: {
    label: 'Code',
    Component: (
      <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
        <Icons.code />
      </MarkToolbarButton>
    ),
  },
  codeBlock: {
    label: 'Code Block',
    Component: <CodeBlockToolbarButton />,
  },
  raw: {
    label: 'Raw Markdown',
    Component: <RawMarkdownToolbarButton />,
  },
  embed: {
    label: 'Templates',
    Component: <TemplatesToolbarButton />,
  },
}

export default function FixedToolbarButtons() {
  const toolbarRef = React.useRef(null)
  const [itemsShown, setItemsShown] = React.useState(11)
  const { overrides } = useToolbarContext()

  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width
    const itemsShown = (width - EMBED_ICON_WIDTH) / ICON_WIDTH

    setItemsShown(Math.floor(itemsShown))
  })

  const toolbarItemsArray: ToolbarItem[] =
    overrides === undefined
      ? Object.values(toolbarItems)
      : overrides
          .map((item) => toolbarItems[item])
          .filter((item) => item !== undefined)

  return (
    <div className="w-full overflow-hidden" ref={toolbarRef}>
      <div
        className="flex"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        <>
          {toolbarItemsArray.slice(0, itemsShown).map((item, index) => (
            <React.Fragment key={item.label}>{item.Component}</React.Fragment>
          ))}
          {toolbarItemsArray.length > itemsShown && (
            <OverflowMenu>
              {toolbarItemsArray.slice(itemsShown).flatMap((c) => (
                <React.Fragment key={c.label}>{c.Component}</React.Fragment>
              ))}
            </OverflowMenu>
          )}
        </>
      </div>
    </div>
  )
}
