import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { useEditorSelector } from '@udecode/plate/react';
import { helpers, unsupportedItemsInTable } from '../plugins/core/common';

export function useToolBlocked() {
  const inTable = useEditorSelector(
    (editor) => helpers.isNodeActive(editor, TablePlugin),
    []
  );
  const inCodeBlock = useEditorSelector(
    (editor) => helpers.isNodeActive(editor, CodeBlockPlugin),
    []
  );
  return {
    inTable,
    inCodeBlock,
    isBlocked: (key: string) =>
      inCodeBlock || (inTable && unsupportedItemsInTable.has(key)),
  };
}
