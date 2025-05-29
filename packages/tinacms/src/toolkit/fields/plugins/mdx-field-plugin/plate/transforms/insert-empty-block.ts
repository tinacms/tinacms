// // import { ELEMENT_CODE_BLOCK } from '@udecode/plate';
// import {
//   getPluginType,
//   insertNode,
//   isSelectionAtBlockStart,
//   type PlateEditor,
//   setElements,
//   someNode,
//   type TElement,
// } from '@udecode/plate-common';

// export const insertEmptyCodeBlock = (editor: PlateEditor) => {
//   const matchCodeElements = (node: TElement) =>
//     node.type === getPluginType(editor, ELEMENT_CODE_BLOCK);

//   if (
//     someNode(editor, {
//       match: matchCodeElements,
//     })
//   ) {
//     return;
//   }

//   const node = {
//     type: ELEMENT_CODE_BLOCK,
//     value: '',
//     // TODO: this can probably be a config option
//     lang: 'javascript',
//     children: [{ type: 'text', text: '' }],
//   };

//   if (isSelectionAtBlockStart(editor)) {
//     setElements(editor, node);
//   } else {
//     insertNode(editor, node);
//   }
// };
