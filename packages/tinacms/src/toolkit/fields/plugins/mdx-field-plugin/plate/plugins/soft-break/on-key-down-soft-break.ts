import { isHotkey } from 'is-hotkey';
import { KEY_SOFT_BREAK } from './create-soft-break-plugin';
import { queryNode } from '@udecode/plate';
import { PlateEditor } from '@udecode/plate/react';

// TODO [2025-05-28]: Potentially unused. Searched usage but found none.
// Consider removing after verifying with the team
export const onKeyDownSoftBreak =
  (editor: PlateEditor, { options: { rules = [] } }) =>
  (event) => {
    const entry = editor.api.block();
    if (!entry) return;

    rules.forEach(({ hotkey, query }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
        event.preventDefault();
        event.stopPropagation();

        editor.tf.insertNodes(
          [
            { type: KEY_SOFT_BREAK, children: [{ text: '' }] },
            { type: 'text', text: '' },
          ],
          { select: true }
        );
      }
    });
  };
