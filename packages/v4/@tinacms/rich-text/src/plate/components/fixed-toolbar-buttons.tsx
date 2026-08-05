import { cn } from '@tinacms/ui/lib/utils';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { useEditorState } from '@udecode/plate/react';
import React from 'react';
import { useResize } from '../hooks/use-resize';
import { helpers, unsupportedItemsInTable } from '../plugins/core/common';
import {
  CONTAINER_MD_BREAKPOINT,
  EMBED_ICON_WIDTH,
  HEADING_ICON_ONLY,
  HEADING_ICON_WITH_TEXT,
  HEADING_LABEL,
  HIGHLIGHT_ICON_WIDTH,
  OVERFLOW_MENU_WIDTH,
  STANDARD_ICON_WIDTH,
  type ToolbarOverrideType,
} from '../toolbar/toolbar-overrides';
import { useToolbarContext } from '../toolbar/toolbar-provider';
import { HeadingsMenu } from './headings-dropdown';
import { CodeBlockToolbarButton } from './plate-ui/code-block-toolbar-button';
import { HorizontalRuleToolbarButton } from './plate-ui/hr-toolbar-button';
import { ImageToolbarButton } from './plate-ui/image-toolbar-button';
import { ListToolbarButton } from './plate-ui/indent-list-toolbar-button';
import { LinkToolbarButton } from './plate-ui/link-toolbar-button';
import {
  BoldToolbarButton,
  CodeToolbarButton,
  HighlightToolbarButton,
  ItalicToolbarButton,
  StrikethroughToolbarButton,
} from './plate-ui/mark-toolbar-button';
import { MermaidToolbarButton } from './plate-ui/mermaid-toolbar-button';
import OverflowMenu from './plate-ui/overflow-menu';
import { QuoteToolbarButton } from './plate-ui/quote-toolbar-button';
import { RawMarkdownToolbarButton } from './plate-ui/raw-markdown-toolbar-button';
import { TableDropdownMenu } from './plate-ui/table/table-dropdown-menu';
import TemplatesToolbarButton from './plate-ui/templates-toolbar-button';
import { ToolbarGroup } from './plate-ui/toolbar';

type ToolbarItem = {
  label: string;
  width: (paragraphIconExists?: boolean) => number;
  Component: React.ReactNode;
};

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
  hr: {
    label: 'Horizontal Rule',
    width: () => STANDARD_ICON_WIDTH,
    Component: <HorizontalRuleToolbarButton />,
  },
  quote: {
    label: 'Quote',
    width: () => STANDARD_ICON_WIDTH,
    Component: <QuoteToolbarButton />,
  },
  ul: {
    label: 'Unordered List',
    width: () => STANDARD_ICON_WIDTH,
    Component: <ListToolbarButton nodeType={BulletedListPlugin.key} />,
  },
  ol: {
    label: 'Ordered List',
    width: () => STANDARD_ICON_WIDTH,
    Component: <ListToolbarButton nodeType={NumberedListPlugin.key} />,
  },
  bold: {
    label: 'Bold',
    width: () => STANDARD_ICON_WIDTH,
    Component: <BoldToolbarButton />,
  },
  strikethrough: {
    label: 'Strikethrough',
    width: () => STANDARD_ICON_WIDTH,
    Component: <StrikethroughToolbarButton />,
  },
  highlight: {
    label: 'Highlight',
    width: () => HIGHLIGHT_ICON_WIDTH,
    Component: <HighlightToolbarButton />,
  },
  italic: {
    label: 'Italic',
    width: () => STANDARD_ICON_WIDTH,
    Component: <ItalicToolbarButton />,
  },
  code: {
    label: 'Code',
    width: () => STANDARD_ICON_WIDTH,
    Component: <CodeToolbarButton />,
  },
  codeBlock: {
    label: 'Code Block',
    width: () => STANDARD_ICON_WIDTH,
    Component: <CodeBlockToolbarButton />,
  },
  mermaid: {
    label: 'Mermaid',
    width: () => STANDARD_ICON_WIDTH,
    Component: <MermaidToolbarButton />,
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
};

export default function FixedToolbarButtons() {
  const toolbarRef = React.useRef(null);
  const [itemsShown, setItemsShown] = React.useState(11);
  const { overrides, templates } = useToolbarContext();
  const showEmbedButton = templates.length > 0;

  let items: ToolbarItem[] =
    overrides?.toolbar === undefined
      ? Object.values(toolbarItems)
      : overrides.toolbar
          .map((item) => toolbarItems[item])
          .filter((item) => item !== undefined);

  if (!showEmbedButton) {
    items = items.filter((item) => item.label !== toolbarItems.embed.label);
  }

  items = items.filter((item) => item.label !== toolbarItems.raw.label);

  const editorState = useEditorState();
  const userInTable = helpers.isNodeActive(editorState, TablePlugin);

  const userInCodeBlock = helpers.isNodeActive(editorState, CodeBlockPlugin);

  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width;
    const headingButton = items.find((item) => item.label === HEADING_LABEL);
    const headingWidth = headingButton
      ? headingButton.width(width >= CONTAINER_MD_BREAKPOINT)
      : 0;

    const availableWidth = width - headingWidth;

    const countItemsFitting = (budget: number) => {
      let count = headingButton ? 1 : 0;
      let used = 0;
      for (const item of items) {
        if (item.label === HEADING_LABEL) continue;
        if (used + item.width() > budget) break;
        used += item.width();
        count += 1;
      }
      return count;
    };

    const fitCount = countItemsFitting(availableWidth);

    setItemsShown(
      fitCount >= items.length
        ? items.length
        : countItemsFitting(availableWidth - OVERFLOW_MENU_WIDTH)
    );
  });

  const getOpacity = (item: ToolbarItem) => {
    if (userInTable && unsupportedItemsInTable.has(item.label)) {
      return 'opacity-25 pointer-events-none';
    }
    if (userInCodeBlock) {
      return 'opacity-25 pointer-events-none';
    }
    return 'opacity-100';
  };

  return (
    <div className='w-full overflow-hidden @container/toolbar' ref={toolbarRef}>
      <div
        className='flex'
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        <>
          {items.slice(0, itemsShown).map((item) => (
            <div
              className={cn(
                'transition duration-500 ease-in-out',
                getOpacity(item)
              )}
              key={item.label}
            >
              {item.Component}
            </div>
          ))}
          {items.length > itemsShown ? (
            <div className='w-fit'>
              <OverflowMenu>
                {items.slice(itemsShown).flatMap((c) => (
                  <div
                    className={cn(
                      'transition duration-500 ease-in-out',
                      getOpacity(c)
                    )}
                    key={c.label}
                  >
                    {c.Component}
                  </div>
                ))}
              </OverflowMenu>
            </div>
          ) : null}
        </>
      </div>
    </div>
  );
}
