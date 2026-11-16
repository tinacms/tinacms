import { defineClientPlugin } from '../../../client';
import { imageSchema } from './image-field.schema';
import { ImageField } from './image-field.ui';
import { ImageGallery } from './image-gallery.ui';

export default defineClientPlugin({
  field: {
    Component: ImageField,
    ListView: ImageGallery,
    metadata: { layout: 'inline', labelable: false },
    schema: imageSchema,
  },
});
