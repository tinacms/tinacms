import type { SaveToBranchDialogProps } from '@tinacms/ui/components/save-to-branch-dialog';

const base = {
  open: true,
  onOpenChange: () => {},
  branch: 'main',
  document: 'Hello world',
  defaultName: 'docs/hello-edits',
  onSave: () => {},
} satisfies SaveToBranchDialogProps;

/** Every look of the Save to new branch dialog, for the design sign-off and the render test. */
export const saveToBranchDialogStates: {
  name: string;
  props: SaveToBranchDialogProps;
  title: string;
  action: string;
  /** Words the dialog shows at the field. */
  error?: string;
}[] = [
  {
    name: 'protected',
    props: base,
    title: 'Save to a new branch',
    action: 'Save',
  },
  {
    name: 'deleted',
    props: {
      ...base,
      reason: 'deleted',
      branch: 'feature/news',
      defaultName: 'feature/news-2',
    },
    title: 'feature/news was deleted',
    action: 'Save to new branch',
  },
  {
    name: 'name taken',
    props: {
      ...base,
      error:
        'A branch called docs/hello-edits already exists. Pick another name.',
    },
    title: 'Save to a new branch',
    action: 'Save',
    error:
      'A branch called docs/hello-edits already exists. Pick another name.',
  },
  {
    name: 'name not allowed',
    props: {
      ...base,
      defaultName: 'docs/hello edits',
      error:
        'Branch names can’t have spaces. Use dashes instead, such as docs/new-page.',
    },
    title: 'Save to a new branch',
    action: 'Save',
    error:
      'Branch names can’t have spaces. Use dashes instead, such as docs/new-page.',
  },
  {
    name: 'media change',
    props: {
      ...base,
      change: 'deleting hero.jpg',
      defaultName: 'media/remove-hero',
    },
    title: 'Save to a new branch',
    action: 'Continue',
  },
  {
    name: 'saving',
    props: { ...base, reason: 'deleted', saving: true },
    title: 'main was deleted',
    action: 'Saving',
  },
  {
    name: 'no handler',
    props: { ...base, canSave: false },
    title: 'Save to a new branch',
    action: 'Save',
  },
];
