import { Input } from '@tinacms/ui/components/input';
import { Textarea } from '@tinacms/ui/components/textarea';
import { cn } from '@tinacms/ui/lib/utils';
import { type CaseSpec, defineCase } from '../case-row';
import { controlClasses } from '../field-frame';

const requiredRule = (value: string, required: boolean, message: string) =>
  required && value.trim() === '' ? [message] : [];

export const singleLineCase: CaseSpec<string> = {
  id: 'string-single-line',
  title: 'Single line',
  label: 'Title',
  overflowLabel: 'Title shown in search results and the browser tab',
  description: 'Shown in search results and the browser tab.',
  empty: '',
  filled: 'Getting started with TinaCMS',
  overflow:
    'Getting started with TinaCMS: install, model your content, and edit it visually on your own site',
  invalid: 'Getting started with TinaCMS, the complete guide for every team',
  required: true,
  validate: (value, required) => [
    ...requiredRule(value, required, 'Enter a title.'),
    ...(value.length > 60
      ? [`Use 60 characters or fewer. This has ${value.length}.`]
      : []),
  ],
  Control: ({ control, value, onChange, onBlur }) => (
    <Input
      {...control}
      className={controlClasses}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  ),
};

function MultiLineControl({
  control,
  value,
  onChange,
  onBlur,
}: Parameters<CaseSpec<string>['Control']>[0]) {
  return (
    <Textarea
      {...control}
      rows={3}
      className={cn(
        controlClasses,
        'field-sizing-fixed h-24 resize-y overflow-y-auto'
      )}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  );
}

const longExcerpt =
  'TinaCMS is an open-source headless CMS that keeps content in your Git repository. Editors change text, images and blocks on the page itself, and every save is a commit. Developers model content in TypeScript and query it with GraphQL. This excerpt runs long on purpose so the field has to handle more text than fits.';

export const multiLineCase: CaseSpec<string> = {
  id: 'string-multi-line',
  title: 'Multi-line text',
  notInV4: true,
  note: 'Plain paragraphs, no formatting. Long text scrolls inside the field.',
  label: 'Excerpt',
  empty: '',
  filled:
    'A short introduction to TinaCMS, and how editors change content on the page itself.',
  overflow: longExcerpt,
  required: true,
  validate: (value, required) =>
    requiredRule(value, required, 'Enter an excerpt.'),
  Control: MultiLineControl,
};

const hexPattern = /^#[0-9a-f]{6}$/i;

export const customComponentCase: CaseSpec<string> = {
  id: 'string-custom-component',
  title: 'Custom component',
  notInV4: true,
  note: 'The author writes the control; Tina adds the frame. A colour picker stands in for any custom control.',
  label: 'Accent colour',
  overflowLabel: 'Accent colour used for buttons, links and highlights',
  empty: '',
  filled: '#D13F13',
  invalid: '#D13F1',
  required: true,
  validate: (value, required) => {
    if (value === '') return required ? ['Choose a colour.'] : [];
    return hexPattern.test(value)
      ? []
      : ['Use a hex colour with six digits, such as #D13F13.'];
  },
  Control: ({ control, value, onChange, onBlur }) => (
    <div className='flex items-center gap-2'>
      <input
        type='color'
        aria-hidden='true'
        tabIndex={-1}
        disabled={control.disabled}
        className={
          control.readOnly
            ? 'pointer-events-none size-8 shrink-0 rounded-sm border border-border-subtle bg-muted p-0.5'
            : 'size-8 shrink-0 cursor-pointer rounded-sm border border-input bg-card p-0.5 disabled:cursor-not-allowed disabled:border-border disabled:opacity-60'
        }
        value={hexPattern.test(value) ? value : '#ffffff'}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
      />
      <Input
        {...control}
        className={cn('font-mono uppercase', controlClasses)}
        placeholder='#000000'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </div>
  ),
};

export const stringCases = [
  defineCase(singleLineCase),
  defineCase(multiLineCase),
  defineCase(customComponentCase),
];
