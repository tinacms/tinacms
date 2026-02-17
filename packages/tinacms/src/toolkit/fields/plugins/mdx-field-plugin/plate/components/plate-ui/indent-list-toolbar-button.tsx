'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import {
  BaseBulletedListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@platejs/list-classic';
import { List, ListOrdered } from 'lucide-react';

import { ToolbarButton } from './toolbar';

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
