import { AutoformatBlockRule } from '@udecode/plate-autoformat';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
} from '@udecode/plate-code-block/react';
import { toggleList, unwrapList } from '@udecode/plate-list';
import { PlateEditor } from '@udecode/plate/react';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

export const format = (editor: TEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      isElement(node) &&
      !isType(editor as PlateEditor, node, CodeBlockPlugin.key) &&
      !isType(editor as PlateEditor, node, CodeLinePlugin.key)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor: TEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor as PlateEditor, {
      type: elementType,
    })
  );
};

export const formatText = (editor: TEditor, text: string) => {
  format(editor, () => editor.insertText(text));
};
