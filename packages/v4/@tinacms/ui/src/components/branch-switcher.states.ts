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
  /** Presses New branch first, to show the form. */
  openForm?: boolean;
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
    name: 'maximised',
    props: { ...base, defaultOpen: true, defaultMaximised: true },
    shows: ['Protected', 'Branches'],
  },
  {
    name: 'open with pull request numbers',
    props: {
      ...base,
      defaultOpen: true,
      branches: [
        { name: 'main', protected: true },
        { name: 'feature/news', pullRequest: 482 },
        { name: 'fix/typo' },
      ],
    },
    shows: ['#482'],
  },
  {
    name: 'open with unsaved counts',
    props: {
      ...base,
      defaultOpen: true,
      branches: [
        { name: 'feature/news', unsaved: 1 },
        { name: 'fix/typo', unsaved: 2 },
      ],
    },
    shows: [', 1 unsaved', ', 2 unsaved'],
  },
  {
    name: 'open with a branch getting ready',
    props: {
      ...base,
      defaultOpen: true,
      branches: [{ name: 'feature/news' }, { name: 'cms/new', ready: false }],
    },
    shows: ['cms/new', 'Getting ready'],
  },
  {
    name: 'open with a branch that did not get ready',
    props: {
      ...base,
      defaultOpen: true,
      branches: [
        { name: 'feature/news' },
        { name: 'cms/late', ready: false, unready: true },
      ],
    },
    shows: ['cms/late', 'Reload to switch'],
  },
  {
    name: 'creating a branch',
    props: {
      ...base,
      defaultOpen: true,
      baseBranch: 'main',
      onCreate: () => {},
      createState: 'creating',
    },
    shows: ['Start from', 'Creating'],
    openForm: true,
  },
  {
    name: 'create failed',
    props: {
      ...base,
      defaultOpen: true,
      baseBranch: 'main',
      onCreate: () => {},
      createState: 'failed',
    },
    shows: ['Start from', 'Retry'],
    openForm: true,
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
