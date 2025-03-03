import { AutoformatBlockRule } from '@udecode/plate-autoformat';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
import {
  getParentNode,
  isElement,
  isType,
  type PlateEditor,
  type TEditor,
} from '@udecode/plate-common';
import { toggleList, unwrapList } from '@udecode/plate-list';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

export const format = (editor: TEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      isElement(node) &&
      !isType(editor as PlateEditor, node, ELEMENT_CODE_BLOCK) &&
      !isType(editor as PlateEditor, node, ELEMENT_CODE_LINE)
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
