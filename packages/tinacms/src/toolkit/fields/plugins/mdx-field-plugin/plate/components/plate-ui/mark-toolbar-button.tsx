'use client';

import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@udecode/plate-basic-marks/react';

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
  <MarkToolbarButton tooltip='Bold (⌘+B)' nodeType={BoldPlugin.key}>
    <Icons.bold />
  </MarkToolbarButton>
);

export const StrikethroughToolbarButton = () => (
  <MarkToolbarButton tooltip='Strikethrough' nodeType={StrikethroughPlugin.key}>
    <Icons.strikethrough />
  </MarkToolbarButton>
);

export const ItalicToolbarButton = () => (
  <MarkToolbarButton tooltip='Italic (⌘+I)' nodeType={ItalicPlugin.key}>
    <Icons.italic />
  </MarkToolbarButton>
);

export const CodeToolbarButton = () => (
  <MarkToolbarButton tooltip='Code (⌘+E)' nodeType={CodePlugin.key}>
    <Icons.code />
  </MarkToolbarButton>
);
