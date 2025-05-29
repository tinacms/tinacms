// import { ELEMENT_TABLE } from '@udecode/plate';
import { useEditorState } from '@udecode/plate-common';
import React from 'react';
import { useResize } from '../hooks/use-resize';
import { helpers, unsupportedItemsInTable } from '../plugins/core/common';
import {
  CONTAINER_MD_BREAKPOINT,
  EMBED_ICON_WIDTH,
  FLOAT_BUTTON_WIDTH,
  HEADING_ICON_ONLY,
  HEADING_ICON_WITH_TEXT,
  HEADING_LABEL,
  STANDARD_ICON_WIDTH,
  type ToolbarOverrideType,
} from '../toolbar/toolbar-overrides';
import { useToolbarContext } from '../toolbar/toolbar-provider';
import { HeadingsMenu } from './headings-dropdown';
import { CodeBlockToolbarButton } from './plate-ui/code-block-toolbar-button';
import { ImageToolbarButton } from './plate-ui/image-toolbar-button';
// import {
//   OrderedListToolbarButton,
//   UnorderedListToolbarButton,
// } from './plate-ui/indent-list-toolbar-button';
import { LinkToolbarButton } from './plate-ui/link-toolbar-button';
import { MermaidToolbarButton } from './plate-ui/mermaid-toolbar-button';
import OverflowMenu from './plate-ui/overflow-menu';
import { QuoteToolbarButton } from './plate-ui/quote-toolbar-button';
import { RawMarkdownToolbarButton } from './plate-ui/raw-markdown-toolbar-button';
import { TableDropdownMenu } from './plate-ui/table-dropdown-menu';
import TemplatesToolbarButton from './plate-ui/templates-toolbar-button';
import { ToolbarGroup } from './plate-ui/toolbar';
// import {
//   BoldToolbarButton,
//   StrikethroughToolbarButton,
//   ItalicToolbarButton,
//   CodeToolbarButton,
// } from './plate-ui/mark-toolbar-button';

type ToolbarItem = {
  label: string;
  width: (paragraphIconExists?: boolean) => number; // Use function to calculate width
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
  quote: {
    label: 'Quote',
    width: () => STANDARD_ICON_WIDTH,
    Component: <QuoteToolbarButton />,
  },
  // ul: {
  //   label: 'Unordered List',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <UnorderedListToolbarButton />,
  // },
  // ol: {
  //   label: 'Ordered List',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <OrderedListToolbarButton />,
  // },
  // bold: {
  //   label: 'Bold',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <BoldToolbarButton />,
  // },
  // strikethrough: {
  //   label: 'Strikethrough',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <StrikethroughToolbarButton />,
  // },
  // italic: {
  //   label: 'Italic',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <ItalicToolbarButton />,
  // },
  // code: {
  //   label: 'Code',
  //   width: () => STANDARD_ICON_WIDTH,
  //   Component: <CodeToolbarButton />,
  // },
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

  let items = [];

  if (Array.isArray(overrides)) {
    items =
      overrides === undefined
        ? Object.values(toolbarItems)
        : overrides.map((item) => toolbarItems[item]).filter((item) => item !== undefined);
  } else {
    items =
      overrides?.toolbar === undefined
        ? Object.values(toolbarItems)
        : overrides.toolbar.map((item) => toolbarItems[item]).filter((item) => item !== undefined);
  }

  if (!showEmbedButton) {
    items = items.filter((item) => item.label !== toolbarItems.embed.label);
  }

  const editorState = useEditorState();
  // const userInTable = helpers.isNodeActive(editorState, ELEMENT_TABLE);
  // if (userInTable) {
  //   items = items.filter((item) => !unsupportedItemsInTable.has(item.label));
  // }

  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width;
    const headingButton = items.find((item) => item.label === HEADING_LABEL);
    const headingWidth = headingButton ? headingButton.width(width > CONTAINER_MD_BREAKPOINT) : 0;

    // Calculate the available width excluding the heading button and float button icon width
    const availableWidth = width - headingWidth - FLOAT_BUTTON_WIDTH;

    // Count numbers of buttons can fit into the available width
    const { itemFitCount } = items.reduce(
      (acc, item) => {
        if (item.label !== HEADING_LABEL && acc.totalItemsWidth + item.width() <= availableWidth) {
          return {
            totalItemsWidth: acc.totalItemsWidth + item.width(),
            itemFitCount: acc.itemFitCount + 1,
          };
        }
        return acc;
      },
      { totalItemsWidth: 0, itemFitCount: 1 }
    ); // Initial values fit count set as 1 becasue heading is always exist

    setItemsShown(itemFitCount);
  });

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
  );
}
