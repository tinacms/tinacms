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
            <QuoteToolbarButton tooltip="Quote Quote (⌘+⇧+.)" />
            <CodeBlockToolbarButton />
          </ToolbarGroup>
          <ToolbarGroup>
            <IndentListToolbarButton nodeType={ELEMENT_UL} />
            <IndentListToolbarButton nodeType={ELEMENT_OL} />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />
            <ImageToolbarButton />
            <RawMarkdownToolbarButton />
            <TemplatesToolbarButton />
          </ToolbarGroup>
        </>
      </div>
    </div>
  )
}
