import { TElement } from '@udecode/plate';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { PlateEditor } from '@udecode/plate/react';

export const insertEmptyCodeBlock = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === editor.getType(CodeBlockPlugin);

  if (
    editor.api.some({
      match: matchCodeElements,
    })
  ) {
    return;
  }

  const node = {
    type: CodeBlockPlugin.key,
    value: '',
    // TODO: this can probably be a config option
    lang: 'javascript',
    children: [{ type: 'text', text: '' }],
  };

  if (editor.api.isAt({ start: true })) {
    editor.tf.setNodes(node);
  } else {
    editor.tf.insertNode(node);
  }
};
