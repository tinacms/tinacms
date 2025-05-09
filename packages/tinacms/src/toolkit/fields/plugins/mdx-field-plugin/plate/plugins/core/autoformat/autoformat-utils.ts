import { ElementApi, SlateEditor } from '@udecode/plate';
import { isType } from '@udecode/plate';
import { AutoformatBlockRule } from '@udecode/plate-autoformat';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
} from '@udecode/plate-code-block/react';
import { toggleList, unwrapList } from '@udecode/plate-list';
import { PlateEditor } from '@udecode/plate/react';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

export const format = (editor: SlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = editor.api.parent(editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      ElementApi.isElement(node) &&
      !isType(editor, node, CodeBlockPlugin.key) &&
      !isType(editor, node, CodeLinePlugin.key)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor: SlateEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    })
  );
};

export const formatText = (editor: SlateEditor, text: string) => {
  format(editor, () => editor.tf.insertText(text));
};
