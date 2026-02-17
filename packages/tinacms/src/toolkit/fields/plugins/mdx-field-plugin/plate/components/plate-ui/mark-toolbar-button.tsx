'use client';

import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from 'platejs/react';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
} from '@platejs/basic-nodes';

const MarkToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
    nodeType: string;
  }
>(({ clear, nodeType, ...rest }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return <ToolbarButton ref={ref} {...props} {...rest} />;
});

export const BoldToolbarButton = () => (
  <MarkToolbarButton tooltip='Bold (⌘+B)' nodeType={BaseBoldPlugin.key}>
    <Icons.bold />
  </MarkToolbarButton>
);

export const StrikethroughToolbarButton = () => (
  <MarkToolbarButton tooltip='Strikethrough' nodeType={BaseStrikethroughPlugin.key}>
    <Icons.strikethrough />
  </MarkToolbarButton>
);

export const ItalicToolbarButton = () => (
  <MarkToolbarButton tooltip='Italic (⌘+I)' nodeType={BaseItalicPlugin.key}>
    <Icons.italic />
  </MarkToolbarButton>
);

export const CodeToolbarButton = () => (
  <MarkToolbarButton tooltip='Code (⌘+E)' nodeType={BaseCodePlugin.key}>
    <Icons.code />
  </MarkToolbarButton>
);
