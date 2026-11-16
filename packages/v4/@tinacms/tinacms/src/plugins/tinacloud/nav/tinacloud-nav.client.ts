import { CircleHelpIcon, CloudIcon, UserIcon } from 'lucide-react';
import type { SlotContributions } from '../../../core/slot/contract';
import { TINACLOUD_APP_URL } from '../client';

const TINACLOUD_NAV_GROUP = 'tinacloud';

export const tinaCloudNav = (clientId: string): SlotContributions => ({
  navGroups: [{ id: TINACLOUD_NAV_GROUP, label: 'Cloud', order: 100 }],
  globalNav: [
    {
      label: 'Project Config',
      icon: CloudIcon,
      group: TINACLOUD_NAV_GROUP,
      target: {
        kind: 'url',
        href: `${TINACLOUD_APP_URL}/projects/${clientId}/overview`,
      },
    },
    {
      label: 'User Management',
      icon: UserIcon,
      group: TINACLOUD_NAV_GROUP,
      target: {
        kind: 'url',
        href: `${TINACLOUD_APP_URL}/projects/${clientId}/collaborators`,
      },
    },
    {
      label: 'Support',
      icon: CircleHelpIcon,
      group: TINACLOUD_NAV_GROUP,
      target: { kind: 'url', href: 'https://tina.io/docs/r/support' },
    },
  ],
});
