import {
  ELEMENT_OL,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
} from '@udecode/plate'
import { ELEMENT_TABLE } from '@udecode/plate-table'
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
  STANDARD_ICON_WIDTH,
  CONTAINER_MD_BREAKPOINT,
  type ToolbarOverrideType,
  FLOAT_BUTTON_WIDTH,
  HEADING_ICON_WITH_TEXT,
  HEADING_ICON_ONLY,
  HEADING_LABEL,
} from '../toolbar/toolbar-overrides'
import { useResize } from '../hooks/use-resize'
import OverflowMenu from './plate-ui/overflow-menu'
import { useToolbarContext } from '../toolbar/toolbar-provider'
import { TableDropdownMenu } from './plate-ui/table-dropdown-menu'
import { helpers, unsupportedItemsInTable } from '../plugins/core/common'
import { useEditorState } from '@udecode/plate-common'

type ToolbarItem = {
  label: string
  width: (paragraphIconExists?: boolean) => number // Use function to calculate width
  Component: React.ReactNode
}

const toolbarItems: { [key in ToolbarOverrideType]: ToolbarItem } = {
  heading: {
    label: HEADING_LABEL,
    width: (paragraphIconExists) =>
      paragraphIconExists ? HEADING_ICON_WITH_TEXT : HEADING_ICON_ONLY, // Dynamically handle width based on paragraph icon
    Component: (
      <ToolbarGroup noSeparator>
        <HeadingsMenu />
      </ToolbarGroup>
    ),
  },
  link: {
    label: 'Link',
    width: () => STANDARD_ICON_WIDTH,
    Component: <LinkToolbarButton />,
  },
  image: {
    label: 'Image',
    width: () => STANDARD_ICON_WIDTH,
    Component: <ImageToolbarButton />,
  },
  quote: {
    label: 'Quote',
    width: () => STANDARD_ICON_WIDTH,
    Component: <QuoteToolbarButton tooltip="Quote Quote (⌘+⇧+.)" />,
  },
  ul: {
    label: 'Unordered List',
    width: () => STANDARD_ICON_WIDTH,
    Component: <IndentListToolbarButton nodeType={ELEMENT_UL} />,
  },
  ol: {
    label: 'Ordered List',
    width: () => STANDARD_ICON_WIDTH,
    Component: <IndentListToolbarButton nodeType={ELEMENT_OL} />,
  },
  bold: {
    label: 'Bold',
    width: () => STANDARD_ICON_WIDTH,
    Component: (
      <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
        <Icons.bold />
      </MarkToolbarButton>
    ),
  },
  italic: {
    label: 'Italic',
    width: () => STANDARD_ICON_WIDTH,
    Component: (
      <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
        <Icons.italic />
      </MarkToolbarButton>
    ),
  },
  code: {
    label: 'Code',
    width: () => STANDARD_ICON_WIDTH,
    Component: (
      <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
        <Icons.code />
      </MarkToolbarButton>
    ),
  },
  codeBlock: {
    label: 'Code Block',
    width: () => STANDARD_ICON_WIDTH,
    Component: <CodeBlockToolbarButton />,
  },
  table: {
    label: 'Table',
    width: () => STANDARD_ICON_WIDTH,
    Component: <TableDropdownMenu />,
  },
  raw: {
    label: 'Raw Markdown',
    width: () => STANDARD_ICON_WIDTH,
    Component: <RawMarkdownToolbarButton />,
  },
  embed: {
    label: 'Templates',
    width: () => EMBED_ICON_WIDTH,
    Component: <TemplatesToolbarButton />,
  },
}

export default function FixedToolbarButtons() {
  const toolbarRef = React.useRef(null)
  const [itemsShown, setItemsShown] = React.useState(11)
  const { overrides, templates } = useToolbarContext()
  const showEmbedButton = templates.length > 0

  let items =
    overrides === undefined
      ? Object.values(toolbarItems)
      : overrides
          .map((item) => toolbarItems[item])
          .filter((item) => item !== undefined)

  if (!showEmbedButton) {
    items = items.filter((item) => item.label !== toolbarItems.embed.label)
  }

  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width
    const headingButton = items.find((item) => item.label === HEADING_LABEL)
    const headingWidth = headingButton
      ? headingButton.width(width > CONTAINER_MD_BREAKPOINT)
      : 0

    // Calculate the available width excluding the heading button and float button icon width
    const availableWidth = width - headingWidth - FLOAT_BUTTON_WIDTH

    // Count numbers of buttons can fit into the available width
    const { itemFitCount } = items.reduce(
      (acc, item) => {
        if (
          item.label !== HEADING_LABEL &&
          acc.totalItemsWidth + item.width() <= availableWidth
        ) {
          return {
            totalItemsWidth: acc.totalItemsWidth + item.width(),
            itemFitCount: acc.itemFitCount + 1,
          }
        }
        return acc
      },
      { totalItemsWidth: 0, itemFitCount: 1 }
    ) // Initial values fit count set as 1 becasue heading is always exist

    setItemsShown(itemFitCount)
  })

  return (
    <div className="w-full overflow-hidden @container/toolbar" ref={toolbarRef}>
      <div
        className="flex"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        <>
          {items.slice(0, itemsShown).map((item) => (
            <React.Fragment key={item.label}>{item.Component}</React.Fragment>
          ))}
          {items.length > itemsShown && (
            <OverflowMenu>
              {items.slice(itemsShown).flatMap((c) => (
                <React.Fragment key={c.label}>{c.Component}</React.Fragment>
              ))}
            </OverflowMenu>
          )}
        </>
      </div>
    </div>
  )
}
