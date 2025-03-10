import React from 'react';
import { BlockEmbed, InlineEmbed } from './component';
import {
  insertBlockElement,
  insertInlineElement,
  helpers,
} from '../core/common';
import type { MdxTemplate } from '../../types';
import { createPlatePlugin, PlateEditor } from '@udecode/plate/react';

export const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
export const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';

// const Embed = (props) => {
//   const handleChange = (values) => {
//     const path = ReactEditor.findPath(props.editor, props.element);
//     props.editor.tf.setNodes({ props: values }, { at: path });
//   };

//   if (props.inline) {
//     return <InlineEmbed {...props} onChange={handleChange} />;
//   }
//   return <BlockEmbed {...props} onChange={handleChange} />;
// };

//TODO - Fix this commented code (need to find replacement, there are some config havent figure out the replacement yet)
// export const createMdxInlinePlugin = createPluginFactory<{
//   templates: MdxTemplate[];
// }>({
//   key: ELEMENT_MDX_INLINE,
//   isInline: true,
//   isVoid: true,
//   isElement: true,
//   component: (props) => <Embed {...props} inline={true} />,
// });

//TODO - This is the replacement for the above commented code
export const createMdxInlinePlugin = createPlatePlugin({
  key: ELEMENT_MDX_INLINE,
  options: {
    isElement: true,
    isVoid: true,
    isInline: true,
  },
  // component: (props) => <Embed {...props} inline={true} />,
});

export const createMdxBlockPlugin = createPlatePlugin({
  key: ELEMENT_MDX_BLOCK,
  options: {
    isElement: true,
    isVoid: true,
  },
  // component: (props) => <Embed {...props} inline={false} />,
});

export const insertMDX = (editor: PlateEditor, value: MdxTemplate) => {
  const flow = !value.inline;
  if (!helpers.currentNodeSupportsMDX(editor)) {
    return;
  }
  if (flow) {
    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });

    editor.tf.normalize({ force: true });
  } else {
    insertInlineElement(editor, {
      type: ELEMENT_MDX_INLINE,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });
  }
};
