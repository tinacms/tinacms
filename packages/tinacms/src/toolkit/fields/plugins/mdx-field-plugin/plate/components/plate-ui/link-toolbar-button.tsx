import React from 'react';

import { withRef } from '@udecode/cn';

import { Icons } from './icons';

import { ToolbarButton } from './toolbar';

// Stub hooks - these may need proper implementation
const useLinkToolbarButtonState = () => ({});
const useLinkToolbarButton = (state: any) => ({ props: {} });

export const LinkToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton ref={ref} {...props} {...rest} tooltip='Link'>
      <Icons.link />
    </ToolbarButton>
  );
});
