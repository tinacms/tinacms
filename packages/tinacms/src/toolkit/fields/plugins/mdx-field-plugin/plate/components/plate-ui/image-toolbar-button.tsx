import React from 'react';
import { withRef } from '@udecode/cn';

import { Icons } from './icons';

import { ToolbarButton } from './toolbar';
import { useEditorState } from '@udecode/plate/react';
import { helpers } from '../../plugins/core/common';
import { ELEMENT_IMG, insertImg } from '../../plugins/create-img-plugin';
import { useCMS } from '@toolkit/react-core';

const useImageToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_IMG);

  return {
    pressed: isBlockActive(),
  };
};

const useImageToolbarButton = (state) => {
  const editor = useEditorState();
  const cms = useCMS();

  const onMouseDown = (e) => {
    e.preventDefault();

    cms.media.open({
      allowDelete: true,
      directory: '',
      onSelect: (media) => {
        insertImg(editor, media);
      },
    });
  };

  return {
    props: {
      onMouseDown,
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
