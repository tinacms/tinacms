import { defineClientPlugin } from '../../client';
import { CollectionsPanel } from './collections-panel';

export default defineClientPlugin({
  slots: {
    'home.panel': [
      {
        id: 'collections',
        component: CollectionsPanel,
        column: 'main',
        order: 10,
        narrowOrder: 30,
      },
    ],
  },
});
