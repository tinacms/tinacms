import { mergeProps } from '@udecode/plate';
import {
  FloatingToolbarState,
  getSelectionBoundingClientRect,
  useVirtualFloating,
} from '@udecode/plate-floating';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorSelector,
  useFocused,
} from '@udecode/plate/react';
import React from 'react';

export const useCustomFloatingToolbarState = ({
  editorId,
  floatingOptions,
  focusedEditorId,
  hideToolbar,
  showWhenReadOnly,
}: {
  editorId: string;
  focusedEditorId: string | null;
} & FloatingToolbarState) => {
  const editor = useEditorRef();
  const selectionExpanded = useEditorSelector(
    () => editor.api.isExpanded(),
    []
  );

  const selectionText = useEditorSelector(() => editor.api.string(), []);
  const readOnly = useEditorReadOnly();

  const focused = useFocused();

  const [open, setOpen] = React.useState(false);
  const [waitForCollapsedSelection, setWaitForCollapsedSelection] =
    React.useState(false);
  const [mousedown, setMousedown] = React.useState(false);

  const floating = useVirtualFloating(
    mergeProps(
      {
        open,
        getBoundingClientRect: () => getSelectionBoundingClientRect(editor),
        onOpenChange: setOpen,
      },
      floatingOptions
    )
  );

  return {
    editorId,
    floating,
    focused,
    focusedEditorId,
    hideToolbar,
    mousedown,
    open,
    readOnly,
    selectionExpanded,
    selectionText,
    setMousedown,
    setOpen,
    setWaitForCollapsedSelection,
    showWhenReadOnly,
    waitForCollapsedSelection,
  };
};
