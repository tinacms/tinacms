import { defineClientPlugin } from '@tinacms/tinacms/client';
import {
  ChartLineIcon,
  CircleHelpIcon,
  CloudIcon,
  SignpostIcon,
} from 'lucide-react';

const url = (href: string) => ({ kind: 'url' as const, href });

// Shows the ADR-027 order in the rail: an entry, then a group, then an entry.
export default defineClientPlugin({
  slots: {
    navGroups: [{ id: 'cloud', label: 'Cloud', order: 5 }],
    globalNav: [
      {
        label: 'Redirects',
        icon: SignpostIcon,
        order: 0,
        target: url('https://tina.io/docs'),
      },
      {
        label: 'Project Config',
        icon: CloudIcon,
        group: 'cloud',
        target: url('https://app.tina.io'),
      },
      {
        label: 'Support',
        icon: CircleHelpIcon,
        group: 'cloud',
        target: url('https://tina.io/docs/r/support'),
      },
      {
        label: 'Analytics',
        icon: ChartLineIcon,
        order: 6,
        target: url('https://tina.io'),
      },
    ],
  },
});
