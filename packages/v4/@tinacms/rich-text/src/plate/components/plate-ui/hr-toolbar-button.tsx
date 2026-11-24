import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { unwrapList } from '@udecode/plate-list';
import { ParagraphPlugin, type PlateEditor } from '@udecode/plate/react';

export const insertHorizontalRule = (editor: PlateEditor) => {
  unwrapList(editor);
  editor.tf.insertNodes({
    type: ParagraphPlugin.key,
    children: [{ text: '' }],
  });
  editor.tf.setNodes({ type: HorizontalRulePlugin.key });
  editor.tf.insertNodes({
    type: ParagraphPlugin.key,
    children: [{ text: '' }],
  });
};
