import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { unwrapList } from '@udecode/plate-list';
import type { PlateEditor } from '@udecode/plate/react';

export const insertCodeBlock = (editor: PlateEditor) => {
  unwrapList(editor);
  insertEmptyCodeBlock(editor);
};
