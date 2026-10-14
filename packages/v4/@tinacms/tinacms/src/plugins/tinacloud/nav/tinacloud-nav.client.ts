import { CircleHelpIcon, CloudIcon, UserIcon } from 'lucide-react';
import type { GlobalNavEntry } from '../../../core/slot/contract';
import { TINACLOUD_APP_URL } from '../client';

export const tinaCloudNav = (clientId: string): GlobalNavEntry[] => [
  {
    label: 'Project Config',
    icon: CloudIcon,
    target: {
      kind: 'url',
      href: `${TINACLOUD_APP_URL}/projects/${clientId}/overview`,
    },
  },
  {
    label: 'User Management',
    icon: UserIcon,
    target: {
      kind: 'url',
      href: `${TINACLOUD_APP_URL}/projects/${clientId}/collaborators`,
    },
  },
  {
    label: 'Support',
    icon: CircleHelpIcon,
    target: { kind: 'url', href: 'https://tina.io/docs/r/support' },
  },
];
