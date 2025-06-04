import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { ToolbarButton } from './plate-ui/toolbar';
import { helpers, unsupportedItemsInTable } from '../plugins/core/common';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './plate-ui/dropdown-menu';
import { Icons } from './plate-ui/icons';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TablePlugin } from '@udecode/plate-table/react';
import {
  ParagraphPlugin,
  useEditorRef,
  useEditorSelector,
  useEditorState,
} from '@udecode/plate/react';

const items = [
  {
    description: 'Paragraph',
    icon: Icons.heading,
    label: 'Paragraph',
    value: ParagraphPlugin.key,
  },
  {
    description: 'Heading 1',
    icon: Icons.h1,
    label: 'Heading 1',
    value: HEADING_KEYS.h1,
  },
  {
    description: 'Heading 2',
    icon: Icons.h2,
    label: 'Heading 2',
    value: HEADING_KEYS.h2,
  },
  {
    description: 'Heading 3',
    icon: Icons.h3,
    label: 'Heading 3',
    value: HEADING_KEYS.h3,
  },
  {
    description: 'Heading 4',
    icon: Icons.h4,
    label: 'Heading 4',
    value: HEADING_KEYS.h4,
  },
  {
    description: 'Heading 5',
    icon: Icons.h5,
    label: 'Heading 5',
    value: HEADING_KEYS.h5,
  },
  {
    description: 'Heading 6',
    icon: Icons.h6,
    label: 'Heading 6',
    value: HEADING_KEYS.h6,
  },
];

const defaultItem =
  items.find((item) => item.value === ParagraphPlugin.key) || items[0];

export function HeadingsMenu(props: DropdownMenuProps) {
  const value: string = useEditorSelector((editor) => {
    let initialNodeType: string = ParagraphPlugin.key;
    let allNodesMatchInitialNodeType = false;
    const codeBlockEntries = editor.api.nodes({
      match: (n) => editor.api.isBlock(n),
      mode: 'highest',
    });
    const nodes = Array.from(codeBlockEntries);

    if (nodes.length > 0) {
      initialNodeType = nodes[0][0].type as string;
      allNodesMatchInitialNodeType = nodes.every(([node]) => {
        const type: string = (node?.type as string) || ParagraphPlugin.key;

        return type === initialNodeType;
      });
    }

    return allNodesMatchInitialNodeType ? initialNodeType : ParagraphPlugin.key;
  }, []);

  const editor = useEditorRef();
  const editorState = useEditorState();
  const openState = useOpenState();

  const userInTable = helpers.isNodeActive(editorState, TablePlugin.key);

  const selectedItem =
    items.find((item) => item.value === value) ?? defaultItem;
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;

  return (
    <div className='rounded-md'>
      <DropdownMenu modal={false} {...openState} {...props}>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            showArrow
            isDropdown
            pressed={openState.open}
            tooltip='Headings'
          >
            <SelectedItemIcon className='size-5' />
            <span className='@md/toolbar:flex hidden'>{selectedItemLabel}</span>
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className='min-w-0 rounded-md'>
          <DropdownMenuRadioGroup
            className='flex flex-col gap-0.5'
            onValueChange={(type) => {
              editor.tf.toggleBlock(type);
              editor.tf.collapse();
              editor.tf.focus();
            }}
            value={value}
          >
            {items
              .filter((item) => {
                if (userInTable) {
                  return !unsupportedItemsInTable.has(item.label);
                }
                return true;
              })
              .map(({ icon: Icon, label, value: itemValue }) => (
                <DropdownMenuRadioItem
                  className='min-w-[180px]'
                  key={itemValue}
                  value={itemValue}
                >
                  <Icon className='mr-2 size-5' />
                  {label}
                </DropdownMenuRadioItem>
              ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
