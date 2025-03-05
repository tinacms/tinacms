import { getPluginType, TElement } from '@udecode/plate';
import { PlateEditor } from '@udecode/plate/react';

export const insertEmptyCodeBlock = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_CODE_BLOCK);

  if (
    editor.api.some({
      match: matchCodeElements,
    })
  ) {
    return;
  }

  const node = {
    type: ELEMENT_CODE_BLOCK,
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
