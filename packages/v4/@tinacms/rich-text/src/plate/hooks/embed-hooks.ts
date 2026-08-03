import { useSelected } from '@udecode/plate/react';
import { isHotkey } from 'is-hotkey';
import React from 'react';
import { useEditorContext } from '../editor-context';

const handleCloseBase = (editor, element) => {
  const path = editor.findPath(element);
  const editorEl = editor.toDOMNode(editor, editor);
  if (editorEl) {
    // FIXME: jumping back from a nested form needs both editor focus and node
    editorEl.focus();
    setTimeout(() => {
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

  const handleClose = () => {
    setIsExpanded(false);
    handleCloseBase(editor, element);
  };
  const path = editor.findPath(element);
  const fieldName = `${baseFieldName}.children.${path.join('.children.')}.props`;
  const handleSelect = () => onActivateField(fieldName);

  const handleRemove = () => {
    handleRemoveBase(editor, element);
  };

  return { isExpanded, handleClose, handleRemove, handleSelect };
};
