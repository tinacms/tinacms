import type { StatusBarProps } from '@tinacms/ui/components/status-bar';

/** Every state of the Status bar the shell shows, for the design sign-off and the render test. */
export const statusBarStates: {
  name: string;
  props: StatusBarProps;
  words: string;
}[] = [
  {
    name: 'local, idle',
    props: { local: true, state: 'idle' },
    words: 'No changes',
  },
  {
    name: 'branch, unsaved',
    props: { branch: 'feature/news', state: 'unsaved' },
    words: 'Unsaved changes',
  },
  {
    name: 'branch, saving',
    props: { branch: 'feature/news', state: 'saving' },
    words: 'Saving…',
  },
  {
    name: 'protected branch, saved',
    props: { branch: 'main', protectedBranch: true, state: 'saved' },
    words: 'Saved',
  },
  {
    name: 'branch, failed',
    props: { branch: 'feature/news', state: 'failed' },
    words: 'Save failed',
  },
  { name: 'no branches, idle', props: { state: 'idle' }, words: 'No changes' },
];
