import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  useEditorRef,
  useEditorState,
  useEditorSelector,
  ParagraphPlugin,
} from '@udecode/plate/react';

import {
  getHeadingItem,
  headingItemsByLevel,
  paragraphItem,
} from './heading-items';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';
import { helpers } from '@toolkit/fields/plugins/mdx-field-plugin/plate/plugins/core/common';
import { TablePlugin } from '@udecode/plate-table/react';
import { toggleList, unwrapList } from '@udecode/plate-list';
import { useToolbarContext } from '../../toolbar/toolbar-provider';

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
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
  const openState = useOpenState();

  const selectedItem = getHeadingItem(value) ?? paragraphItem;
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;

  const editorState = useEditorState();
  const userInTable = helpers.isNodeActive(editorState, TablePlugin.key);
  if (userInTable) return null;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className='lg:min-w-[130px]'
          isDropdown
          showArrow
          pressed={openState.open}
          tooltip='Turn into'
        >
          <span className=''>{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='min-w-0'>
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          className='flex flex-col gap-0.5'
          onValueChange={(type) => {
            if (type === 'ul' || type === 'ol') {
              toggleList(editor, { type });
            } else {
              unwrapList(editor);
              editor.tf.toggleBlock(type);
            }

            editor.tf.collapse();
            editor.tf.focus();
          }}
          value={value}
        >
          {items.map(({ icon: Icon, label, value: itemValue }) => (
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
  );
}
