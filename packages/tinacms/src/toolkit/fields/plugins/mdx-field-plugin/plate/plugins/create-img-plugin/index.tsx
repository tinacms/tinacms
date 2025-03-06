import React from 'react';
import { ImgEmbed } from './component';
import { ReactEditor } from 'slate-react';
import { insertInlineElement } from '../core/common';
import type { Media } from '../../../../../../core/media';
import { isImage } from '@toolkit/components/media/utils';
import { PlateEditor } from '@udecode/plate/react';

export const ELEMENT_IMG = 'img';

const createImgPlugin = createPluginFactory({
  key: ELEMENT_IMG,
  isVoid: true,
  isInline: true,
  isElement: true,
  component: (props) => {
    const handleChange = (values) => {
      const path = ReactEditor.findPath(props.editor, props.element);
      props.editor.tf.setNodes(values, { at: path });
    };
    return <ImgEmbed {...props} onChange={handleChange} />;
  },
});

export const insertImg = (editor: PlateEditor, media: Media) => {
  if (isImage(media.src)) {
    insertInlineElement(editor, {
      type: ELEMENT_IMG,
      children: [{ text: '' }],
      url: media.src,
      caption: '',
      alt: '',
    });
  } else {
    insertInlineElement(editor, {
      type: 'a',
      url: media.src,
      title: media.filename,
      children: [{ text: media.filename }],
    });
  }

  // Normalizing the editor after insertion
  editor.tf.normalize({ force: true });
};

export default createImgPlugin;
