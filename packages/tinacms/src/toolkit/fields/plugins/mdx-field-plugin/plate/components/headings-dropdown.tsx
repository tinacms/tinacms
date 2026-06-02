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
import {
  getHeadingItem,
  headingItemsByLevel,
  paragraphItem,
} from './plate-ui/heading-items';
import { TablePlugin } from '@udecode/plate-table/react';
import {
  ParagraphPlugin,
  useEditorRef,
  useEditorSelector,
  useEditorState,
} from '@udecode/plate/react';
import { useToolbarContext } from '../toolbar/toolbar-provider';

export function HeadingsMenu(props: DropdownMenuProps) {
  const { headingLevels } = useToolbarContext();
  const items = [
    paragraphItem,
    ...headingLevels.map((level) => headingItemsByLevel[level]),
  ];
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

  const selectedItem = getHeadingItem(value) ?? paragraphItem;
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

        <DropdownMenuContent
          align='start'
          className='min-w-0 rounded-none rounded-bl rounded-br border-border'
        >
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
