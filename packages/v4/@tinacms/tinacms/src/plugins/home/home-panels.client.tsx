import { defineClientPlugin } from '../../client';
import { BranchPanel } from './branch-panel';
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
      {
        id: 'branch',
        component: BranchPanel,
        column: 'side',
        order: 20,
        narrowOrder: 10,
      },
    ],
  },
});
