import { CircleHelpIcon, CloudIcon, UserIcon } from 'lucide-react';
import type { GlobalNavEntry } from '../../../core/slot/contract';
import { TINACLOUD_APP_URL } from '../client';

export const TINACLOUD_SUPPORT_URL = 'https://tina.io/docs/r/support';

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
    target: { kind: 'url', href: TINACLOUD_SUPPORT_URL },
  },
];
