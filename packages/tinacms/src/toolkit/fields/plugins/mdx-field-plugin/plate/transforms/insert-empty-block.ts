import {
  ELEMENT_CODE_BLOCK,
  PlateEditor,
  getPluginType,
  insertNode,
  someNode,
  TElement,
  isSelectionAtBlockStart,
  setElements,
} from '@udecode/plate-headless'

export const insertEmptyCodeBlock = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_CODE_BLOCK)

  if (
    someNode(editor, {
      match: matchCodeElements,
    })
  ) {
    return
  }

  const node = {
    type: ELEMENT_CODE_BLOCK,
    value: '',
    // TODO: this can probably be a config option
    lang: 'javascript',
    children: [{ type: 'text', text: '' }],
  }

  if (isSelectionAtBlockStart(editor)) {
    setElements(editor, node)
  } else {
    insertNode(editor, node)
  }
}
