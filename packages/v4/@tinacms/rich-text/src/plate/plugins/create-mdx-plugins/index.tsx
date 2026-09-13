import {
  PlateEditor,
  createPlatePlugin,
  useEditorRef,
} from '@udecode/plate/react';
import React from 'react';
import type { MdxTemplate } from '../../types';
import { insertBlockElement, insertInlineElement } from '../core/common';
import { BlockEmbed, InlineEmbed } from './component';

export const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
export const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';

const Embed = (props) => {
  const editor = useEditorRef();
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
  node: {
    isElement: true,
    isVoid: true,
    isInline: true,
    component: (props) => <Embed {...props} inline={true} />,
  },
});

export const createMdxBlockPlugin = createPlatePlugin({
  key: ELEMENT_MDX_BLOCK,
  node: {
    isElement: true,
    isVoid: true,
    component: (props) => <Embed {...props} inline={false} />,
  },
});

export const insertMDX = (editor: PlateEditor, value: MdxTemplate) => {
  const isInline = value.inline;
  if (isInline) {
    insertInlineElement(editor, {
      type: ELEMENT_MDX_INLINE,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });
  } else {
    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    });

    editor.tf.normalize({ force: true });
  }
};
