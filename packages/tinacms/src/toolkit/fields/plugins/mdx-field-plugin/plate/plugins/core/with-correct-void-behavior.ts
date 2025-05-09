// import { Editor, ElementApi, NodeApi, PathApi } from '@udecode/plate';
// /**
//  *
//  * This fixes a bug where you can't delete between two void nodes
//  * without deleting the first node.
//  *
//  * https://github.com/ianstormtaylor/slate/issues/3991#issuecomment-832160304
//  */
// //TODO : Test this function in UI, not sure if it works after replace with latest api
// export const withCorrectVoidBehavior = (editor: Editor) => {
//   const { deleteBackward, insertBreak } = editor;

//   // if current selection is void node, insert a default node below
//   editor.insertBreak = () => {
//     if (!editor.selection || !editor.api.isCollapsed()) {
//       return editor.tf.insertBreak();
//     }
//     const selectedNodePath = editor.api.parent(editor.selection.anchor.path);
//     const selectedNode = NodeApi.get(editor, selectedNodePath);
//     if (ElementApi.isElement(selectedNode)) {
//       if (editor.api.isVoid(selectedNode)) {
//         editor.tf.insertNode({
//           // @ts-ignore bad type from slate
//           type: 'p',
//           children: [{ text: '' }],
//         });
//         return;
//       }
//     }

//     editor.tf.insertBreak();
//   };

//   // if prev node is a void node, remove the current node and select the void node
//   editor.deleteBackward = (unit) => {
//     if (
//       !editor.selection ||
//       !editor.api.isCollapsed() ||
//       editor.selection.anchor.offset !== 0
//     ) {
//       return editor.tf.deleteBackward(unit);
//     }

//     const parentPath = editor.api.parent(editor.selection.anchor.path);
//     const parentNode = NodeApi.get(editor, parentPath);
//     const parentIsEmpty = NodeApi.string(parentNode).length === 0;

//     if (parentIsEmpty && PathApi.hasPrevious(parentPath)) {
//       const prevNodePath = PathApi.previous(parentPath);
//       const prevNode = NodeApi.get(editor, prevNodePath);
//       if (ElementApi.isElement(prevNode)) {
//         if (editor.api.isVoid(editor, prevNode)) {
//           Transforms.removeNodes(editor);
//           // Deleting a top-level void node results in an empty array for the value
//           // Normalizing kicks in some of the other normalization logic which
//           // prevents this from happening. I'm not sure when/why normalize runs
//           // but for whatever reason it doesn't happen unless we force it
//           Editor.normalize(editor, { force: true });
//           return;
//         }
//       }
//     }

//     deleteBackward(unit);
//   };

//   return editor;
// };
