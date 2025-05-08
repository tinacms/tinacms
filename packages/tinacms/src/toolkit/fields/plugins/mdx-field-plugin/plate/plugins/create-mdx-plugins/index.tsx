import React from 'react';
import { BlockEmbed, InlineEmbed } from './component';
import {
  insertBlockElement,
  insertInlineElement,
  helpers,
} from '../core/common';
import type { MdxTemplate } from '../../types';
import { createPlatePlugin, PlateEditor, useEditorRef } from '@udecode/plate/react';

export const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
export const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';

const Embed = (props) => {
  const editor = useEditorRef();
console.log("embed")
  const handleChange = (values) => {
    const path = editor.api.findPath(props.element);
    props.editor.tf.setNodes({ props: values }, { at: path });
  };

  if (props.inline) {
    return <InlineEmbed {...props} onChange={handleChange} />;
  }
  return <BlockEmbed {...props} onChange={handleChange} />;
};

export const createMdxInlinePlugin = createPlatePlugin({
  key: ELEMENT_MDX_INLINE,
  options: {
    isElement: true,
    isVoid: true,
    isInline: true,
  },
  node: {
    component: (props) => <Embed {...props} inline={true} />,
  }
});

export const createMdxBlockPlugin = createPlatePlugin({
  key: ELEMENT_MDX_BLOCK,
  options: {
    isElement: true,
    isVoid: true,
  },
  node: {
    component: (props) => <Embed {...props} inline={false} />,
  }
});

export const insertMDX = (editor: PlateEditor, value: MdxTemplate) => {
  const flow = !value.inline;
  if (!helpers.currentNodeSupportsMDX(editor)) {
    return;
  }
  if (flow) {
    console.log("insert block")

    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });

    editor.tf.normalize({ force: true });
  } else {
    console.log("insert inline")

    insertInlineElement(editor, {
      type: ELEMENT_MDX_INLINE,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });


  }
};
