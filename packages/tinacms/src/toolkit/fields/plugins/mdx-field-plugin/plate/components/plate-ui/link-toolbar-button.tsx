import React from 'react';

import { withRef } from '@udecode/cn';

import { Icons } from './icons';

import { ToolbarButton } from './toolbar';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@platejs/link';

export const LinkToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton ref={ref} {...props} {...rest} tooltip='Link'>
      <Icons.link />
    </ToolbarButton>
  );
});
