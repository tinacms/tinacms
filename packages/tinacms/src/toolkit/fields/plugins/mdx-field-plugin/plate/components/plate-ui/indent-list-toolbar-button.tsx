'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import {
  BaseBulletedListPlugin,
} from '@platejs/list-classic';
import { useEditorRef } from 'platejs/react';
import { List, ListOrdered } from 'lucide-react';

import { ToolbarButton } from './toolbar';

// Stub hooks for list toolbar button (not exported from @platejs/list-classic)
const useListToolbarButtonState = ({ nodeType }: { nodeType: string }) => {
  const editor = useEditorRef();
  const pressed = editor?.api?.some?.({ match: { type: nodeType } }) ?? false;
  return { nodeType, pressed };
};

const useListToolbarButton = (state: { nodeType: string; pressed: boolean }) => ({
  props: {
    pressed: state.pressed,
    onClick: () => {
      // Toggle list type - this is a simplified stub
    },
  },
});

export const ListToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: string;
  }
>(({ nodeType = BaseBulletedListPlugin.key, ...rest }, ref) => {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      tooltip={
        nodeType === BaseBulletedListPlugin.key ? 'Bulleted List' : 'Numbered List'
      }
      {...props}
      {...rest}
    >
      {nodeType === BaseBulletedListPlugin.key ? <List /> : <ListOrdered />}
    </ToolbarButton>
  );
});
