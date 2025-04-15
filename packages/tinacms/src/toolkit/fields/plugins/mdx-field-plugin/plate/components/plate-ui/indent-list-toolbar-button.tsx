import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { useEditorState } from '@udecode/plate/react';
import { toggleList } from '@udecode/plate-list';
import {
  BulletedListPlugin,
  ListPlugin,
  NumberedListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list/react';
export const UnorderedListToolbarButton = withRef<typeof ToolbarButton>(
  (props, ref) => {
    const editor = useEditorState();
    const state = useListToolbarButtonState({ nodeType: ListPlugin.key });
    const { props: buttonProps } = useListToolbarButton(state);

    return (
      <ToolbarButton
        ref={ref}
        tooltip='Bulleted List'
        {...buttonProps}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleList(editor, { type: ListPlugin.key });
        }}
      >
        <Icons.ul />
      </ToolbarButton>
    );
  }
);

export const OrderedListToolbarButton = withRef<typeof ToolbarButton>(
  (props, ref) => {
    const editor = useEditorState();
    const state = useListToolbarButtonState({ nodeType: ListPlugin.key });
    const { props: buttonProps } = useListToolbarButton(state);

    return (
      <ToolbarButton
        ref={ref}
        tooltip='Numbered List'
        {...buttonProps}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleList(editor, { type: ListPlugin.key });
        }}
      >
        <Icons.ol />
      </ToolbarButton>
    );
  }
);
