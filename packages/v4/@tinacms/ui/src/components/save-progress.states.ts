import type { SaveProgressProps } from '@tinacms/ui/components/save-progress';

/** Every look of the Save progress card, for the design sign-off and the render test. */
export const saveProgressStates: { name: string; props: SaveProgressProps }[] =
  [
    { name: 'corner', props: { placement: 'corner' } },
    {
      name: 'corner with a count',
      props: { placement: 'corner', children: 'Saving 3 documents…' },
    },
    // Used once the maximised form and form bar exist.
    { name: 'above the form bar', props: { placement: 'above-form-bar' } },
  ];
