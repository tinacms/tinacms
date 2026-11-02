import { User } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@tinacms/ui/components/button';
import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import type { TopBarProps } from '@tinacms/ui/components/top-bar';

const logo = <span role='img' aria-label='TinaCMS' />;
const toggle = (
  <Button
    variant='icon'
    size='sm'
    icon='hide-panel'
    aria-label='Toggle Sidebar'
  />
);
const search = (
  <Button size='sm' icon='search' shortcut='⌘K'>
    Search
  </Button>
);
const account = (
  <Button variant='icon' size='sm' icon={User} aria-label='Account' />
);

const branches = [{ name: 'main', protected: true }, { name: 'feature/news' }];

const branch = (current: string, disabled = false): ReactNode => (
  <BranchSwitcher
    current={current}
    branches={branches}
    disabled={disabled}
    onSwitch={() => {}}
  />
);

/** Every look of the Top bar, for the design sign-off and the render test. */
export const topBarStates: { name: string; props: TopBarProps }[] = [
  {
    name: 'branch with project name',
    props: {
      toggle,
      logo,
      projectName: 'Acme site',
      branch: branch('feature/news'),
      search,
      account,
    },
  },
  {
    name: 'protected branch',
    props: {
      toggle,
      logo,
      projectName: 'Acme site',
      branch: branch('main'),
      search,
      account,
    },
  },
  {
    name: 'branch button disabled while a save runs',
    props: { toggle, logo, branch: branch('feature/news', true), account },
  },
  {
    name: 'local mode, no branch button',
    props: { toggle, logo, account },
  },
  {
    name: 'long names truncate',
    props: {
      toggle,
      logo,
      projectName: 'A very long project name that has to end in an ellipsis',
      branch: branch('feature/news'),
      search,
      account,
    },
  },
];
