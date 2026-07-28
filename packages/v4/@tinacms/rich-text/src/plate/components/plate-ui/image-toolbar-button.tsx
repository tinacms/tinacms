import { withRef } from '@udecode/cn';
import React from 'react';

import { Icons } from './icons';

import { useEditorState } from '@udecode/plate/react';
import { helpers } from '../../plugins/core/common';
import { ELEMENT_IMG } from '../../plugins/create-img-plugin';
import { ToolbarButton } from './toolbar';

const useImageToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_IMG);

  return {
    pressed: isBlockActive(),
  };
};

// ponytail: inert until the media capability exists — picking an image needs a
// media library to pick from (plugins/media/ is a .gitkeep). Existing image
// nodes still render and serialize; only insertion is unavailable, so the button
// reports itself disabled rather than opening nothing.
const useImageToolbarButton = (state) => {
  useEditorState();

  return {
    props: {
      disabled: true,
      onMouseDown: (e) => e.preventDefault(),
      pressed: state.pressed,
    },
  };
};

export const ImageToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const state = useImageToolbarButtonState();

  const { props } = useImageToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip='Image' {...rest} {...props}>
      <Icons.image />
    </ToolbarButton>
  );
});
