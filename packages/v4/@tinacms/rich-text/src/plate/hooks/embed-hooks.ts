import { useSelected } from '@udecode/plate/react';
import { isHotkey } from 'is-hotkey';
import React from 'react';
import { useEditorContext } from '../editor-context';

const handleCloseBase = (editor, element) => {
  const path = editor.findPath(element);
  const editorEl = editor.toDOMNode(editor, editor);
  if (editorEl) {
    /**
     * FIXME: there must be a better way to do this. When jumping
     * back from a nested form, the entire editor doesn't receive
     * focus, so enable that, but what we also want is to ensure
     * that this node is selected - so do that, too. But there
     * seems to be a race condition where the `editorEl.focus` doesn't
     * happen in time for the Transform to take effect, hence the
     * setTimeout. I _think_ it just needs to queue and the actual
     * ms timeout is irrelevant, but might be worth checking on
     * devices with lower CPUs
     */
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

  React.useEffect(() => {
    const handleEnter = (e) => {
      if (selected) {
        if (isHotkey(key, e)) {
          e.preventDefault();
          callback();
        }
      }
    };
    document.addEventListener('keydown', handleEnter);

    return () => document.removeEventListener('keydown', handleEnter);
  }, [selected]);
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
  // The host decides what selecting an embed does — this package only says which
  // address was selected, so it never has to import the host's form store.
  const handleSelect = () => onActivateField(fieldName);

  const handleRemove = () => {
    handleRemoveBase(editor, element);
  };

  return { isExpanded, handleClose, handleRemove, handleSelect };
};
