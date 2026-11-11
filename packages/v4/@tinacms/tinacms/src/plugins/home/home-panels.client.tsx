import { defineClientPlugin } from '../../client';
import { CollectionsPanel } from './collections-panel';
import { RecentDocumentsPanel } from './recent-documents-panel';

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
      {
        id: 'recent-documents',
        component: RecentDocumentsPanel,
        column: 'side',
        order: 10,
        narrowOrder: 20,
      },
    ],
  },
});
