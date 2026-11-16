/** What each Top bar state holds. The render test builds the slots from it. */
export interface TopBarState {
  name: string;
  projectName?: string;
  branch?: { current: string; disabled?: boolean };
  search?: boolean;
}

/** Every look of the Top bar, for the design sign-off and the render test. */
export const topBarStates: TopBarState[] = [
  {
    name: 'branch with project name',
    projectName: 'Acme site',
    branch: { current: 'feature/news' },
    search: true,
  },
  {
    name: 'protected branch',
    projectName: 'Acme site',
    branch: { current: 'main' },
    search: true,
  },
  {
    name: 'branch button disabled while a save runs',
    branch: { current: 'feature/news', disabled: true },
  },
  { name: 'local mode, no branch button' },
  {
    name: 'long names truncate',
    projectName: 'A very long project name that has to end in an ellipsis',
    branch: { current: 'feature/news' },
    search: true,
  },
];
