import { ElementApi, SlateEditor } from 'platejs';
import { isType } from 'platejs';
import { AutoformatBlockRule } from '@platejs/autoformat';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '@platejs/code-block';
import { toggleList, unwrapList } from '@platejs/list-classic';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

const format = (editor: SlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = editor.api.parent(editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      ElementApi.isElement(node) &&
      !isType(editor, node, BaseCodeBlockPlugin.key) &&
      !isType(editor, node, BaseCodeLinePlugin.key)
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
