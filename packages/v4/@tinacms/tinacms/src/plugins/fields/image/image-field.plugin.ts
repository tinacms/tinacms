import { definePlugin } from '../../../core/plugin';
import { IMAGE_FIELD_TYPE } from './image-field.schema';

const imageFieldPlugin = definePlugin({
  name: 'tina:field:image',
  provides: ['field'],
  dependsOn: ['media'],
  field: { type: IMAGE_FIELD_TYPE, contractVersion: 1 },
  client: () => import('./image-field.client'),
});

export default imageFieldPlugin;
