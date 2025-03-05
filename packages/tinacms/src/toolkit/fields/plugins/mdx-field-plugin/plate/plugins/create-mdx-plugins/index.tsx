import React from 'react';
import { ReactEditor } from 'slate-react';
import { BlockEmbed, InlineEmbed } from './component';
import {
  insertBlockElement,
  insertInlineElement,
  helpers,
} from '../core/common';
import type { MdxTemplate } from '../../types';
import { PlateEditor } from '@udecode/plate/react';

export const ELEMENT_MDX_INLINE = 'mdxJsxTextElement';
export const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement';

const Embed = (props) => {
  const handleChange = (values) => {
    const path = ReactEditor.findPath(props.editor, props.element);
    props.editor.tf.setNodes({ props: values }, { at: path });
  };

  if (props.inline) {
    return <InlineEmbed {...props} onChange={handleChange} />;
  }
  return <BlockEmbed {...props} onChange={handleChange} />;
};

export const createMdxInlinePlugin = createPluginFactory<{
  templates: MdxTemplate[];
}>({
  key: ELEMENT_MDX_INLINE,
  isInline: true,
  isVoid: true,
  isElement: true,
  component: (props) => <Embed {...props} inline={true} />,
});

export const createMdxBlockPlugin = createPluginFactory({
  key: ELEMENT_MDX_BLOCK,
  isVoid: true,
  isElement: true,
  component: (props) => <Embed {...props} inline={false} />,
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
