// import React from 'react';
// import { withRef } from '@udecode/cn';
// import { Icons } from './icons';
// // import {
// //   ELEMENT_OL,
// //   ELEMENT_UL,
// //   toggleList,
// //   useListToolbarButton,
// //   useListToolbarButtonState,
// // } from '@udecode/plate';
// import { ToolbarButton } from './toolbar';
// import { useEditorState } from '@udecode/plate-common';

// export const UnorderedListToolbarButton = withRef<typeof ToolbarButton>(
//   (props, ref) => {
//     const editor = useEditorState();
//     const state = useListToolbarButtonState({ nodeType: ELEMENT_UL });
//     const { props: buttonProps } = useListToolbarButton(state);

//     return (
//       <ToolbarButton
//         ref={ref}
//         tooltip='Bulleted List'
//         {...buttonProps}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           toggleList(editor, { type: ELEMENT_UL });
//         }}
//       >
//         <Icons.ul />
//       </ToolbarButton>
//     );
//   }
// );

// export const OrderedListToolbarButton = withRef<typeof ToolbarButton>(
//   (props, ref) => {
//     const editor = useEditorState();
//     const state = useListToolbarButtonState({ nodeType: ELEMENT_OL });
//     const { props: buttonProps } = useListToolbarButton(state);

//     return (
//       <ToolbarButton
//         ref={ref}
//         tooltip='Numbered List'
//         {...buttonProps}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           toggleList(editor, { type: ELEMENT_OL });
//         }}
//       >
//         <Icons.ol />
//       </ToolbarButton>
//     );
//   }
// );
