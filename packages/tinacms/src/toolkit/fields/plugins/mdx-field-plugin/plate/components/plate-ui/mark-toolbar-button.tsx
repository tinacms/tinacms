// 'use client';

// import React from 'react';
// import { withRef } from '@udecode/cn';
// // import {
// //   MARK_BOLD,
// //   MARK_CODE,
// //   MARK_ITALIC,
// //   MARK_STRIKETHROUGH,
// // } from '@udecode/plate';
// import {
//   useMarkToolbarButton,
//   useMarkToolbarButtonState,
// } from '@udecode/plate-common';
// import { Icons } from './icons';
// import { ToolbarButton } from './toolbar';

// const MarkToolbarButton = withRef<
//   typeof ToolbarButton,
//   {
//     clear?: string | string[];
//     nodeType: string;
//   }
// >(({ clear, nodeType, ...rest }, ref) => {
//   const state = useMarkToolbarButtonState({ clear, nodeType });
//   const { props } = useMarkToolbarButton(state);

//   return <ToolbarButton ref={ref} {...props} {...rest} />;
// });

// export const BoldToolbarButton = () => (
//   <MarkToolbarButton tooltip='Bold (⌘+B)' nodeType={MARK_BOLD}>
//     <Icons.bold />
//   </MarkToolbarButton>
// );

// export const StrikethroughToolbarButton = () => (
//   <MarkToolbarButton tooltip='Strikethrough' nodeType={MARK_STRIKETHROUGH}>
//     <Icons.strikethrough />
//   </MarkToolbarButton>
// );

// export const ItalicToolbarButton = () => (
//   <MarkToolbarButton tooltip='Italic (⌘+I)' nodeType={MARK_ITALIC}>
//     <Icons.italic />
//   </MarkToolbarButton>
// );

// export const CodeToolbarButton = () => (
//   <MarkToolbarButton tooltip='Code (⌘+E)' nodeType={MARK_CODE}>
//     <Icons.code />
//   </MarkToolbarButton>
// );
