import type { ReferenceFieldViewProps } from './reference-field.view';

const author = (name: string, group?: string) => ({
  value: `content/authors/${name}.md`,
  label: `content/authors/${name}.md`,
  meta: `Authors · content/authors/${name}.md`,
  group,
  collection: 'author',
});

const post = (name: string, group?: string) => ({
  value: `content/posts/${name}.mdx`,
  label: `content/posts/${name}.mdx`,
  meta: `Posts · content/posts/${name}.mdx`,
  group,
  collection: 'post',
});

const base = {
  id: 'author',
  htmlFor: 'author',
  label: 'Author',
  documents: [author('ada'), author('grace'), author('linus')],
  value: null,
  onChange: () => {},
  onOpen: () => {},
} satisfies ReferenceFieldViewProps;

const several = [
  author('ada', 'Authors'),
  author('grace', 'Authors'),
  post('hello', 'Posts'),
  post('goodbye', 'Posts'),
];

/** Every look of the reference field, for the design sign-off and the render test. */
export const referenceFieldStates = [
  { name: 'empty', props: base },
  { name: 'filled', props: { ...base, value: 'content/authors/ada.md' } },
  {
    name: 'several collections',
    props: { ...base, documents: several, value: 'content/posts/hello.mdx' },
  },
  {
    name: 'required',
    props: { ...base, required: true, value: 'content/authors/ada.md' },
  },
  {
    name: 'invalid',
    props: { ...base, required: true, errors: ['Author is required'] },
  },
  {
    name: 'missing document',
    props: {
      ...base,
      value: 'content/authors/deleted.md',
      missing: true,
      warnings: ['This document no longer exists.'],
    },
  },
  {
    name: 'too long for the box',
    props: {
      ...base,
      documents: [
        author(
          'a-very-long-document-name-that-goes-on-and-on-past-the-edge-of-the-box-and-keeps-going'
        ),
      ],
      value:
        'content/authors/a-very-long-document-name-that-goes-on-and-on-past-the-edge-of-the-box-and-keeps-going.md',
    },
  },
  {
    name: 'disabled',
    props: { ...base, disabled: true, placeholder: 'Loading documents…' },
  },
  {
    name: 'loading with a stored value',
    props: {
      ...base,
      documents: [],
      value: 'content/authors/ada.md',
      disabled: true,
      placeholder: 'Loading documents…',
    },
  },
  {
    name: 'loading with a document already listed',
    props: {
      ...base,
      value: 'content/authors/ada.md',
      disabled: true,
      placeholder: 'Loading documents…',
    },
  },
  {
    name: 'read-only',
    props: { ...base, value: 'content/authors/ada.md', readOnly: true },
  },
  {
    name: 'read-only with a chosen document',
    props: {
      ...base,
      documents: several,
      value: 'content/authors/ada.md',
      readOnly: true,
    },
  },
  {
    name: 'list failed',
    props: {
      ...base,
      documents: [],
      disabled: true,
      placeholder: 'Could not load documents',
      errors: ['Network request failed'],
    },
  },
] satisfies { name: string; props: ReferenceFieldViewProps }[];

export type ReferenceFieldStateName =
  (typeof referenceFieldStates)[number]['name'];

export const referenceFieldState = (
  name: ReferenceFieldStateName
): ReferenceFieldViewProps => {
  const state = referenceFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No reference field state named ${name}`);
  return state.props;
};
