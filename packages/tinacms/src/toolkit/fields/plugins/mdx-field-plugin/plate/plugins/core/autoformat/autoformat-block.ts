// import { preFormat } from './autoformat-utils';
// import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
// import type { AutoformatRule } from '@udecode/plate-autoformat';
// // import {
// //   ELEMENT_BLOCKQUOTE,
// //   ELEMENT_CODE_BLOCK,
// //   ELEMENT_H1,
// //   ELEMENT_H2,
// //   ELEMENT_H3,
// //   ELEMENT_H4,
// //   ELEMENT_H5,
// //   ELEMENT_H6,
// //   ELEMENT_HR,
// // } from '@udecode/plate';
// import { ELEMENT_DEFAULT, insertNodes, setNodes } from '@udecode/plate-common';

// export const autoformatBlocks: AutoformatRule[] = [
//   {
//     mode: 'block',
//     type: ELEMENT_H1,
//     match: '# ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_H2,
//     match: '## ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_H3,
//     match: '### ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_H4,
//     match: '#### ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_H5,
//     match: '##### ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_H6,
//     match: '###### ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_BLOCKQUOTE,
//     match: '> ',
//     preFormat,
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_CODE_BLOCK,
//     match: '```',
//     triggerAtBlockStart: false,
//     preFormat,
//     format: (editor) => {
//       insertEmptyCodeBlock(editor);
//     },
//   },
//   {
//     mode: 'block',
//     type: ELEMENT_HR,
//     match: ['---', '—-', '___ '],
//     format: (editor) => {
//       setNodes(editor, { type: ELEMENT_HR });
//       insertNodes(editor, {
//         type: ELEMENT_DEFAULT,
//         children: [{ text: '' }],
//       });
//     },
//   },
// ];
