import type { RichTextNode, RichTextValue } from '@tinacms/rich-text';
import {
  EditorContext,
  type MdxTemplate,
  RichEditor,
  type ToolbarOverrides,
} from '@tinacms/rich-text/editor';
import { cn } from '@tinacms/ui/lib/utils';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';

const text = (value: string) => ({ type: 'text', text: value });
const paragraph = (value: string): RichTextNode => ({
  type: 'p',
  children: [text(value)],
});
const heading = (value: string): RichTextNode => ({
  type: 'h2',
  children: [text(value)],
});
const callout = (value: string): RichTextNode => ({
  type: 'mdxJsxFlowElement',
  name: 'Callout',
  props: { text: value },
  children: [text('')],
});
const root = (...children: RichTextNode[]): RichTextValue => ({
  type: 'root',
  children,
});

const plainText = (node: RichTextNode): string => {
  if (typeof node.text === 'string') return node.text;
  const children = Array.isArray(node.children) ? node.children : [];
  return children.map((child) => plainText(child as RichTextNode)).join('');
};

const isEmpty = (value: RichTextValue) =>
  value.children.every(
    (node) => plainText(node).trim() === '' && node.type === 'p'
  );

const CALLOUT: MdxTemplate = {
  name: 'Callout',
  label: 'Callout',
  key: 'callout',
  fields: [{ name: 'text', label: 'Text', type: 'string', isTitle: true }],
};

const LONG =
  'Tina keeps every change in Git, so each edit has an author, a date and a way back. Editors work on the page itself, and developers keep full control of the schema and the code. This paragraph runs long on purpose, so the field has to hold more text than fits.';

// The frame around the editor carries the field states. The editor body
// inside it follows Rich-Text Restyle (#7676).
const frameClasses = (framed: boolean) =>
  framed
    ? 'overflow-hidden rounded-sm border border-input bg-card transition-colors hover:border-(--input-hover) data-[force=hover]:border-(--input-hover) focus-within:border-ring focus-within:ring-3 focus-within:ring-focus-glow data-[force=focus]:border-ring data-[force=focus]:ring-3 data-[force=focus]:ring-focus-glow data-invalid:border-destructive data-disabled:border-border data-disabled:opacity-60 data-read-only:border-border-subtle data-read-only:bg-muted'
    : 'data-disabled:opacity-60';

// The frozen states show a still picture of the editor, so the page does not
// run one editor for every state.
function EditorPicture({
  value,
  tools,
  readOnly,
}: {
  value: RichTextValue;
  tools: number;
  readOnly?: boolean;
}) {
  return (
    <div className='grid'>
      {readOnly ? null : (
        <div className='flex items-center gap-1 border-b border-border bg-background p-1'>
          {Array.from({ length: tools }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-7 rounded-xs bg-border-subtle/70',
                index === 0 ? 'w-12' : 'w-7'
              )}
            />
          ))}
        </div>
      )}
      <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 px-3 py-2.5 text-sm break-words'>
        {value.children.length === 0 || isEmpty(value) ? (
          <p className='text-muted-foreground'>Start writing…</p>
        ) : (
          value.children.map((node, index) =>
            node.type === 'mdxJsxFlowElement' ? (
              <div
                key={index}
                className={cn(
                  'flex min-w-0 items-center gap-3 rounded-sm border px-2.5 py-1.5',
                  readOnly
                    ? 'border-border bg-card'
                    : 'border-border-subtle bg-muted/50'
                )}
              >
                <span className='shrink-0 text-label font-medium'>
                  {String(node.name)}
                </span>
                <span className='min-w-0 truncate text-label text-muted-foreground'>
                  {String(
                    (node.props as { text?: string } | undefined)?.text ?? ''
                  )}
                </span>
              </div>
            ) : (
              <p
                key={index}
                className={
                  node.type === 'h2'
                    ? 'text-base font-semibold'
                    : 'line-clamp-4'
                }
              >
                {plainText(node)}
              </p>
            )
          )
        )}
      </div>
    </div>
  );
}

const noop = () => {};

function makeRichControl({
  framed = true,
  templates = [],
  overrides,
  tools = 9,
  minHeight,
}: {
  framed?: boolean;
  templates?: MdxTemplate[];
  overrides?: ToolbarOverrides;
  tools?: number;
  minHeight?: string;
}) {
  return function RichControl({
    control,
    value,
    frozen,
    onChange,
    onBlur,
  }: CaseControlProps<RichTextValue>) {
    return (
      <div
        data-force={control['data-force']}
        data-invalid={control['aria-invalid'] ? true : undefined}
        data-disabled={control.disabled ? true : undefined}
        data-read-only={control.readOnly ? true : undefined}
        className={cn('min-w-0', frameClasses(framed))}
        style={{ minHeight }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onBlur();
        }}
      >
        {frozen || control.disabled || control.readOnly ? (
          <EditorPicture
            value={value}
            tools={tools}
            readOnly={control.readOnly}
          />
        ) : (
          <EditorContext.Provider
            value={{
              fieldName: control.id,
              templates,
              rawMode: false,
              setRawMode: noop,
              onActivateField: noop,
            }}
          >
            <RichEditor
              input={{ value, onChange }}
              field={{ templates, overrides }}
              ariaLabelledBy={control['aria-labelledby']}
            />
          </EditorContext.Provider>
        )}
      </div>
    );
  };
}

const ARTICLE = root(
  heading('Getting started'),
  paragraph('Install Tina, model your content, and edit it on your site.')
);

const required = (value: RichTextValue, isRequired: boolean) =>
  isRequired && isEmpty(value) ? ['Write some content.'] : [];

const shared = {
  labelling: 'group' as const,
  empty: root(paragraph('')),
  required: true,
  validate: required,
};

export const richFrameCase: CaseSpec<RichTextValue> = {
  ...shared,
  id: 'rich-frame',
  title: 'Rich text',
  note: 'The frame (label, border, focus, error, Unsaved) matches every other field; the editor body inside it follows Rich-Text Restyle (#7676). "Try it" is the real editor. The frozen states show a still picture of it.',
  label: 'Summary',
  overflowLabel: 'Summary, shown on the blog index and in search results',
  filled: ARTICLE,
  overflow: root(heading('Getting started'), paragraph(LONG)),
  dirty: root(
    heading('Getting started'),
    paragraph('Install Tina and edit your site.')
  ),
  Control: makeRichControl({}),
};

export const richEmbedCase: CaseSpec<RichTextValue> = {
  ...shared,
  id: 'rich-embed',
  title: 'Embedded templates',
  note: 'An MDX template sits inside the text as a card. How clicking into an embed opens its fields is still an open question.',
  label: 'Body',
  overflowLabel: 'Body, with callouts and other embedded components',
  filled: root(
    paragraph('Tina stores content as Markdown and MDX.'),
    callout('Back up your content before you upgrade.'),
    paragraph('Then run the upgrade command.')
  ),
  overflow: root(paragraph(LONG), callout(LONG)),
  dirty: root(
    paragraph('Tina stores content as Markdown and MDX.'),
    callout('Back up first.'),
    paragraph('Then run the upgrade command.')
  ),
  Control: makeRichControl({ templates: [CALLOUT], tools: 10 }),
};

export const richBodyCase: CaseSpec<RichTextValue> = {
  ...shared,
  id: 'rich-body',
  title: 'Body field',
  labelling: 'none',
  note: 'The rich-text field marked as the document body has no label and no frame, and fills the height of the editor pane. Its errors show at its top edge.',
  label: 'Body',
  filled: ARTICLE,
  overflow: root(heading('Getting started'), paragraph(LONG), paragraph(LONG)),
  dirty: root(heading('Getting started'), paragraph('Edit your site.')),
  doesNotApply: { required: 'The body is always there.' },
  Control: makeRichControl({ framed: false, minHeight: '14rem' }),
};

export const richToolbarCase: CaseSpec<RichTextValue> = {
  ...shared,
  id: 'rich-toolbar',
  title: 'Toolbar overrides',
  note: 'The schema author limits the toolbar to the tools this field needs: headings, bold, italic, link and lists.',
  label: 'Author bio',
  overflowLabel: 'Author bio, shown at the end of every post by this author',
  filled: root(paragraph('Ada writes about content modelling and Git.')),
  overflow: root(paragraph(LONG)),
  dirty: root(paragraph('Ada writes about Git.')),
  Control: makeRichControl({
    overrides: { toolbar: ['heading', 'bold', 'italic', 'link', 'ul', 'ol'] },
    tools: 6,
  }),
};

export const richCases = [
  defineCase(richFrameCase),
  defineCase(richEmbedCase),
  defineCase(richBodyCase),
  defineCase(richToolbarCase),
];
