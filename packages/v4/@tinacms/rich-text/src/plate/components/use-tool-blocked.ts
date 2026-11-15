import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { useEditorState } from '@udecode/plate/react';
import { helpers, unsupportedItemsInTable } from '../plugins/core/common';

/** Whether a tool or menu row is off at the caret: in a code block everything is, in a table the keys in `unsupportedItemsInTable`. */
export function useToolBlocked() {
  const editor = useEditorState();
  const inTable = helpers.isNodeActive(editor, TablePlugin);
  const inCodeBlock = helpers.isNodeActive(editor, CodeBlockPlugin);
  return {
    inTable,
    inCodeBlock,
    isBlocked: (key: string) =>
      inCodeBlock || (inTable && unsupportedItemsInTable.has(key)),
  };
}
