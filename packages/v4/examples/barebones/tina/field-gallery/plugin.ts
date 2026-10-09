import { definePlugin } from '@tinacms/tinacms';

export const fieldGalleryPlugin = definePlugin({
  name: 'example:field-gallery',
  client: () => import('./field-gallery.client'),
});
