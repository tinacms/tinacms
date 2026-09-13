import { useSelected } from '@udecode/plate/react';
import { isHotkey } from 'is-hotkey';
import React from 'react';
import { useEditorContext } from '../editor-context';

const handleCloseBase = (editor, element) => {
  const path = editor.findPath(element);
  const editorEl = editor.toDOMNode(editor, editor);
  if (editorEl) {
    // Returning from a nested form needs focus and the selection. The
    // selection has to follow focus on a later tick, or it does not take.
    editorEl.focus();
    return setTimeout(() => {
      // The embed can leave the document inside the window of the timer. The
      // path then points at no node, and `select` throws.
      if (!editor.api.hasPath(path)) {
        return;
      }
      editor.tf.select(path);
    }, 1);
  }
};

const handleRemoveBase = (editor, element) => {
  const path = editor.findPath(element);
  editor.tf.removeNodes({
    at: path,
  });
};

export const useHotkey = (key, callback) => {
  const selected = useSelected();

  const onKeyDown = React.useEffectEvent((e) => {
    if (!selected || !isHotkey(key, e)) return;
    e.preventDefault();
    callback();
  });

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
};

export const useEmbedHandles = (editor, element, baseFieldName: string) => {
  const { onActivateField } = useEditorContext();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const deferredSelect = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // The embed can unmount inside the window of the timer. A deferred select
  // must not move the caret of an editor that the user no longer sees.
  React.useEffect(
    () => () => {
      clearTimeout(deferredSelect.current);
    },
    []
  );

  const handleClose = () => {
    setIsExpanded(false);
    deferredSelect.current = handleCloseBase(editor, element);
  };
  const path = editor.findPath(element);
  const fieldName = `${baseFieldName}.children.${path.join('.children.')}.props`;
  const handleSelect = () => onActivateField(fieldName);

  const handleRemove = () => {
    handleRemoveBase(editor, element);
  };

  return { isExpanded, handleClose, handleRemove, handleSelect };
};
