import type { GalleryCase } from './case-row';
import { booleanCases, dateTimeCases, numberCases } from './cases/basic-cases';
import { blockCases } from './cases/block-cases';
import { groupCases, groupListCases } from './cases/group-cases';
import { imageCases } from './cases/image-cases';
import { listCases } from './cases/list-cases';
import { referenceCases } from './cases/reference-cases';
import { richCases } from './cases/rich-cases';
import { selectCases } from './cases/select-cases';
import { stringCases } from './cases/string-cases';
import { EditorDemo } from './editor/editor-demo';
import { GALLERY_TOKENS } from './field-frame';

interface GallerySection {
  id: string;
  title: string;
  fieldType: string;
  cases: GalleryCase[];
  Content?: () => React.ReactNode;
}

export const SECTIONS: GallerySection[] = [
  { id: 'string', title: 'Text', fieldType: 'string', cases: stringCases },
  { id: 'number', title: 'Number', fieldType: 'number', cases: numberCases },
  { id: 'select', title: 'Select', fieldType: 'select', cases: selectCases },
  {
    id: 'reference',
    title: 'Reference',
    fieldType: 'reference',
    cases: referenceCases,
  },
  {
    id: 'boolean',
    title: 'True or false',
    fieldType: 'boolean',
    cases: booleanCases,
  },
  {
    id: 'datetime',
    title: 'Date and time',
    fieldType: 'datetime',
    cases: dateTimeCases,
  },
  { id: 'object', title: 'Groups', fieldType: 'object', cases: groupCases },
  {
    id: 'rich-text',
    title: 'Rich text',
    fieldType: 'rich-text',
    cases: richCases,
  },
  {
    id: 'list',
    title: 'Lists',
    fieldType: 'array',
    cases: [...listCases, ...groupListCases, ...blockCases],
  },
  { id: 'image', title: 'Images', fieldType: 'image', cases: imageCases },
  {
    id: 'editor',
    title: 'Editor pane',
    fieldType: 'active field and save',
    cases: [],
    Content: EditorDemo,
  },
];

const sectionHeadingId = (id: string) => `gallery-${id}`;

function Contents() {
  return (
    <nav aria-label='Field types' className='flex flex-wrap gap-1'>
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type='button'
          className='cursor-pointer rounded-sm px-2.5 py-1 text-label text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:focus-ring'
          onClick={() =>
            document
              .getElementById(sectionHeadingId(section.id))
              ?.scrollIntoView({ block: 'start' })
          }
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
}

export function FieldGalleryScreen() {
  return (
    // The admin shell grows with its content, so the window scrolls and a
    // sticky bar has nothing to stick to. The gallery scrolls inside itself.
    <div className='h-[calc(100svh-3.25rem)] overflow-y-auto'>
      <div
        style={GALLERY_TOKENS}
        className='mx-auto grid w-full max-w-[96rem] gap-5 p-6'
      >
        <header className='grid gap-1'>
          <h1 className='font-heading text-2xl font-semibold'>Field gallery</h1>
          <p className='text-sm text-muted-foreground'>
            Every case in every state that applies. "Try it" is a working copy;
            nothing saves.
          </p>
        </header>
        <div className='sticky top-0 z-30 -mx-6 grid gap-2 border-b border-border-subtle bg-background/90 px-6 py-2.5 backdrop-blur-sm'>
          <Contents />
        </div>
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            aria-labelledby={sectionHeadingId(section.id)}
            className='grid pt-4'
          >
            <h2
              id={sectionHeadingId(section.id)}
              className='flex scroll-mt-32 items-baseline gap-2 font-heading text-lg font-semibold'
            >
              {section.title}
              <code className='font-mono text-label font-normal text-muted-foreground'>
                {section.fieldType}
              </code>
            </h2>
            {section.Content ? (
              <div className='border-t border-border-subtle py-6'>
                <section.Content />
              </div>
            ) : null}
            {section.cases.map(({ id, Row }) => (
              <Row key={id} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
