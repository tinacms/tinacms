import { Button } from '@tinacms/ui/components/button';
import { cn } from '@tinacms/ui/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Block, templateOf } from '../blocks/templates';
import { type CaseSpec, LiveCopy } from '../case-row';
import { blocksPlainCase } from '../cases/block-cases';
import { groupCase, type Seo } from '../cases/group-cases';
import { imageCase } from '../cases/image-cases';
import { textListCase } from '../cases/list-cases';
import { documentTitle, oneCollectionCase } from '../cases/reference-cases';
import { singleLineCase } from '../cases/string-cases';
import type { ImageValue } from '../images/media';
import type { ListItem } from '../list/use-list';
import { findProblem, reveal, type Target, targetOf } from './reveal';

const slugCase: CaseSpec<string> = {
  ...singleLineCase,
  id: 'doc-slug',
  label: 'Slug',
  description: 'Set when the document is created.',
  filled: 'getting-started',
  required: false,
  validate: () => [],
};

// The document starts as last saved, with two problems inside closed levels,
// so the save action has a path to open.
const sectionsCase: CaseSpec<ListItem<Block>[]> = {
  ...blocksPlainCase,
  filled: blocksPlainCase.invalid ?? blocksPlainCase.filled,
};
const seoCase: CaseSpec<Seo> = {
  ...groupCase,
  filled: { ...groupCase.filled, metaTitle: '' },
  validate: () => [],
};

interface Values {
  title: string;
  slug: string;
  author: string | null;
  cover: ImageValue | null;
  tags: ListItem<string>[];
  sections: ListItem<Block>[];
  seo: Seo;
}

const INITIAL: Values = {
  title: singleLineCase.filled,
  slug: slugCase.filled,
  author: oneCollectionCase.filled,
  cover: imageCase.filled,
  tags: textListCase.filled,
  sections: sectionsCase.filled,
  seo: seoCase.filled,
};

const keyOf = ({ field, index, inner }: Target) => {
  if (index === undefined) return field;
  return inner ? `${field}:${index}:inner` : `${field}:${index}`;
};

// Only the outer element of a field or block shows an outline, so a section
// full of mapped parts stays calm. A nested part still finds its own field.
function Mapped({
  target,
  nested,
  active,
  onReveal,
  className,
  children,
}: {
  target: Target;
  nested?: boolean;
  active: string | null;
  onReveal: (target: Target) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const key = keyOf(target);
  const isActive =
    !nested &&
    active !== null &&
    (active === key || active.startsWith(`${key}:`));
  return (
    <div
      data-target={key}
      data-active={isActive ? true : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onReveal(target);
      }}
      className={cn(
        'cursor-pointer rounded-md',
        nested
          ? null
          : 'outline-0 outline-foreground/20 outline-offset-4 hover:outline-[1.5px] data-active:outline-[1.5px] data-active:outline-ring/60',
        className
      )}
    >
      {children}
    </div>
  );
}

function Preview({
  values,
  active,
  onReveal,
}: {
  values: Values;
  active: string | null;
  onReveal: (target: Target) => void;
}) {
  const mapped = (
    target: Target,
    children: React.ReactNode,
    className?: string,
    nested?: boolean
  ) => (
    <Mapped
      target={target}
      nested={nested}
      active={active}
      onReveal={onReveal}
      className={className}
    >
      {children}
    </Mapped>
  );
  return (
    <div className='grid content-start gap-5 p-6 text-sm'>
      {mapped(
        { field: 'slug' },
        <p className='font-mono text-xs text-muted-foreground'>
          example.com/blog/{values.slug}
        </p>,
        'w-fit'
      )}
      {values.cover
        ? mapped(
            { field: 'cover' },
            <img
              src={values.cover.src}
              alt={values.cover.decorative ? '' : values.cover.alt}
              className='aspect-[16/7] w-full rounded-sm object-cover'
            />
          )
        : null}
      <div className='grid gap-2'>
        {mapped(
          { field: 'title' },
          <h1 className='font-heading text-2xl font-semibold'>
            {values.title || 'Untitled'}
          </h1>
        )}
        {mapped(
          { field: 'author' },
          <p className='text-muted-foreground'>
            By {documentTitle(values.author) ?? 'Unknown author'}
          </p>,
          'w-fit'
        )}
        {mapped(
          { field: 'tags' },
          <ul className='flex flex-wrap gap-1.5'>
            {values.tags.map((tag, index) => (
              <li key={tag.id}>
                {mapped(
                  { field: 'tags', index },
                  <span className='block rounded-full bg-muted px-2.5 py-0.5 text-xs'>
                    {tag.value || 'Empty tag'}
                  </span>,
                  undefined,
                  true
                )}
              </li>
            ))}
          </ul>,
          'w-fit'
        )}
      </div>
      {values.sections.map((section, index) => {
        const template = templateOf(section.value.template);
        const [first, ...rest] = template.fields;
        return (
          <div key={section.id}>
            {mapped(
              { field: 'sections', index },
              <section className='grid gap-2 rounded-md border border-border-subtle p-4'>
                <p className='text-xs text-muted-foreground'>
                  {template.label}
                </p>
                {mapped(
                  { field: 'sections', index, inner: true },
                  <h2 className='text-lg font-semibold'>
                    {section.value.fields[first.name] || (
                      <span className='text-muted-foreground italic'>
                        No {first.label.toLowerCase()}
                      </span>
                    )}
                  </h2>,
                  undefined,
                  true
                )}
                {rest.map((field) =>
                  section.value.fields[field.name] ? (
                    <p key={field.name}>{section.value.fields[field.name]}</p>
                  ) : null
                )}
                {section.value.template === 'featureGrid' ? (
                  <div className='grid grid-cols-3 gap-2'>
                    {[0, 1, 2].map((tile) => (
                      <span key={tile} className='h-12 rounded-sm bg-muted' />
                    ))}
                  </div>
                ) : null}
              </section>
            )}
          </div>
        );
      })}
      {mapped(
        { field: 'seo', inner: true },
        <div className='grid gap-0.5 rounded-md border border-border-subtle p-3'>
          <p className='text-xs text-muted-foreground'>Search result</p>
          <p className='font-medium'>{values.seo.metaTitle || values.title}</p>
          <p className='text-xs text-muted-foreground'>
            {values.seo.metaDescription}
          </p>
        </div>
      )}
    </div>
  );
}

export function EditorDemo() {
  const form = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState(INITIAL);
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [status, setStatus] = useState<'problem' | 'clear' | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const set = useCallback(
    <K extends keyof Values>(key: K) =>
      (value: Values[K]) =>
        setValues((current) =>
          current[key] === value ? current : { ...current, [key]: value }
        ),
    []
  );
  const [setters] = useState(() => ({
    title: set('title'),
    slug: set('slug'),
    author: set('author'),
    cover: set('cover'),
    tags: set('tags'),
    sections: set('sections'),
    seo: set('seo'),
  }));

  useEffect(() => {
    if (saveAttempts === 0 || !form.current) return;
    findProblem(form.current).then((found) =>
      setStatus(found ? 'problem' : 'clear')
    );
  }, [saveAttempts]);

  const saveAttempted = saveAttempts > 0;
  const field = (name: keyof Values, children: React.ReactNode) => (
    <div data-doc-field={name} className='grid min-w-0'>
      {children}
    </div>
  );

  return (
    <div className='grid gap-3'>
      <p className='text-label text-muted-foreground'>
        A short document in the editor pane, with a stand-in preview. Click an
        outlined element in the preview to find its field: closed levels open,
        the field scrolls into view and takes focus, and nothing else moves.
        Focus a field to outline its element. Save shows every error and takes
        you to the first one.
      </p>
      <div className='flex flex-wrap items-start gap-3'>
        <div className='grid h-[min(44rem,calc(100svh-12rem))] w-(--pane-width) grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-input bg-card shadow-xs'>
          <div className='flex items-center gap-3 border-b border-border-subtle px-6 py-3'>
            <div className='grid min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold'>
                {values.title || 'Untitled'}
              </p>
              <p
                role='status'
                className={cn(
                  'text-label empty:hidden',
                  status === 'problem'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {status === 'problem'
                  ? 'Not saved. Fix the errors, then save again.'
                  : null}
                {status === 'clear'
                  ? 'No errors. The gallery does not save.'
                  : null}
              </p>
            </div>
            <Button
              type='button'
              size='sm'
              className='cursor-pointer'
              onClick={() => {
                setStatus(null);
                setSaveAttempts((count) => count + 1);
              }}
            >
              Save
            </Button>
          </div>
          <div
            ref={form}
            data-testid='doc-editor'
            className='grid content-start gap-6 overflow-y-auto px-6 py-5'
            onFocus={(event) => setActive(targetOf(event.target))}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setActive(null);
              }
            }}
          >
            {field(
              'title',
              <LiveCopy
                spec={singleLineCase}
                saveAttempted={saveAttempted}
                onValue={setters.title}
              />
            )}
            {field(
              'slug',
              <LiveCopy spec={slugCase} readOnly onValue={setters.slug} />
            )}
            {field(
              'author',
              <LiveCopy
                spec={oneCollectionCase}
                saveAttempted={saveAttempted}
                onValue={setters.author}
              />
            )}
            {field(
              'cover',
              <LiveCopy
                spec={imageCase}
                saveAttempted={saveAttempted}
                onValue={setters.cover}
              />
            )}
            {field(
              'tags',
              <LiveCopy
                spec={textListCase}
                saveAttempted={saveAttempted}
                onValue={setters.tags}
              />
            )}
            {field(
              'sections',
              <LiveCopy
                spec={sectionsCase}
                saveAttempted={saveAttempted}
                onValue={setters.sections}
              />
            )}
            {field(
              'seo',
              <LiveCopy
                spec={seoCase}
                saveAttempted={saveAttempted}
                startClosed
                onValue={setters.seo}
              />
            )}
          </div>
        </div>
        <div
          data-testid='doc-preview'
          role='region'
          aria-label='Preview'
          tabIndex={0}
          className='h-[min(44rem,calc(100svh-12rem))] min-w-80 flex-1 overflow-y-auto rounded-md border border-border-subtle bg-background'
        >
          <Preview
            values={values}
            active={active}
            onReveal={(target) => {
              if (form.current) reveal(form.current, target);
            }}
          />
        </div>
      </div>
    </div>
  );
}
