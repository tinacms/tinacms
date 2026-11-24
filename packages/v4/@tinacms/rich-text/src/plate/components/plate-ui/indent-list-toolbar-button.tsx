'use client';

import {
  BulletedListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list/react';
import { List, ListOrdered } from 'lucide-react';
import React from 'react';

import { ToolbarButton } from './toolbar';

export const ListToolbarButton = ({
  nodeType = BulletedListPlugin.key,
  disabled,
}: {
  nodeType?: string;
  disabled?: boolean;
}) => {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);
  const bulleted = nodeType === BulletedListPlugin.key;

  return (
    <ToolbarButton
      {...props}
      tooltip={bulleted ? 'Bulleted list' : 'Numbered list'}
      disabled={disabled}
    >
      {bulleted ? <List aria-hidden /> : <ListOrdered aria-hidden />}
    </ToolbarButton>
  );
};
