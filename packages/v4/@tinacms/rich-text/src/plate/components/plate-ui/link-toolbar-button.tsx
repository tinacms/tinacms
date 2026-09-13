import React from 'react';

import { withRef } from '@udecode/cn';

import { Icons } from './icons';

import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link/react';
import { ToolbarButton } from './toolbar';

export const LinkToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton ref={ref} {...props} {...rest} tooltip='Link'>
      <Icons.link />
    </ToolbarButton>
  );
});
