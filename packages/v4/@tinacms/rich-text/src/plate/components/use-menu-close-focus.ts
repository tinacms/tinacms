import { useEditorRef } from '@udecode/plate/react';
import React from 'react';

/** Props for a menu's content: Escape returns focus to the trigger, picking a row returns it to the text. */
export function useMenuCloseFocus() {
  const editor = useEditorRef();
  const escaped = React.useRef(false);
  return {
    onEscapeKeyDown: () => {
      escaped.current = true;
    },
    onCloseAutoFocus: (event: Event) => {
      if (escaped.current) {
        escaped.current = false;
        return;
      }
      event.preventDefault();
      editor.tf.focus();
    },
  };
}
