import type { BranchSwitcherProps } from '@tinacms/ui/components/branch-switcher';

const branches = [
  { name: 'main', protected: true },
  { name: 'release/4.0', protected: true },
  { name: 'feature/news' },
  { name: 'fix/typo' },
];

const base = {
  current: 'feature/news',
  branches,
  onSwitch: () => {},
} satisfies BranchSwitcherProps;

/** Every look of the Branch switcher, for the design sign-off and the render test. */
export const branchSwitcherStates: {
  name: string;
  props: BranchSwitcherProps;
  /** Words the open pop-up must show. */
  shows: string[];
}[] = [
  { name: 'closed', props: base, shows: [] },
  {
    name: 'open',
    props: { ...base, defaultOpen: true },
    shows: ['Protected', 'Branches', 'feature/news'],
  },
  {
    name: 'open on a protected branch',
    props: { ...base, current: 'main', defaultOpen: true },
    shows: ['Protected', 'main'],
  },
  {
    name: 'open full screen',
    props: { ...base, defaultOpen: true, defaultFullScreen: true },
    shows: ['Protected', 'Branches'],
  },
  {
    name: 'open and blocked by unsaved edits',
    props: {
      ...base,
      defaultOpen: true,
      blockedMessage: 'Save or discard your changes first',
    },
    shows: ['Save or discard your changes first'],
  },
  {
    name: 'disabled while a save runs',
    props: { ...base, disabled: true },
    shows: [],
  },
];
