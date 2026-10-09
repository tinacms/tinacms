export interface TemplateField {
  name: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
}

export interface BlockTemplate {
  name: string;
  label: string;
  description: string;
  group: string;
  fields: TemplateField[];
  Thumbnail: () => React.ReactNode;
}

export interface Block {
  template: string;
  fields: Record<string, string>;
}

// Thumbnails are wireframes of each block, drawn in the muted tones.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 160 90'
      className='h-auto w-full text-border'
      fill='currentColor'
    >
      {children}
    </svg>
  );
}

const bar = (x: number, y: number, w: number, h = 4) => (
  <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx='1.5' />
);

export const TEMPLATES: BlockTemplate[] = [
  {
    name: 'hero',
    label: 'Hero',
    description: 'A large heading with a short introduction.',
    group: 'Intro',
    fields: [
      { name: 'heading', label: 'Heading', required: true },
      { name: 'subheading', label: 'Subheading', multiline: true },
    ],
    Thumbnail: () => (
      <Frame>
        {bar(30, 26, 100, 10)}
        {bar(45, 44, 70)}
        {bar(55, 54, 50)}
        <rect x='62' y='66' width='36' height='10' rx='2' opacity='0.7' />
      </Frame>
    ),
  },
  {
    name: 'pageHeader',
    label: 'Page header',
    description: 'A title and breadcrumb for an inner page.',
    group: 'Intro',
    fields: [{ name: 'title', label: 'Title', required: true }],
    Thumbnail: () => (
      <Frame>
        {bar(16, 22, 40, 3)}
        {bar(16, 32, 90, 8)}
        {bar(16, 48, 128, 1)}
      </Frame>
    ),
  },
  {
    name: 'featureGrid',
    label: 'Feature grid',
    description: 'Three features side by side.',
    group: 'Content',
    fields: [{ name: 'heading', label: 'Heading', required: true }],
    Thumbnail: () => (
      <Frame>
        {bar(50, 14, 60, 6)}
        {[16, 64, 112].map((x) => (
          <g key={x}>
            <rect x={x} y='30' width='32' height='22' rx='2' opacity='0.7' />
            {bar(x, 58, 32, 3)}
            {bar(x, 64, 24, 3)}
          </g>
        ))}
      </Frame>
    ),
  },
  {
    name: 'testimonial',
    label: 'Testimonial',
    description: 'A quote and the person who said it.',
    group: 'Content',
    fields: [
      { name: 'quote', label: 'Quote', required: true, multiline: true },
      { name: 'person', label: 'Person' },
    ],
    Thumbnail: () => (
      <Frame>
        <text x='22' y='40' fontSize='28' fontFamily='serif'>
          “
        </text>
        {bar(40, 26, 100)}
        {bar(40, 36, 90)}
        {bar(40, 46, 70)}
        <circle cx='46' cy='66' r='6' />
        {bar(58, 64, 40, 3)}
      </Frame>
    ),
  },
  {
    name: 'textImage',
    label: 'Text and image',
    description: 'A paragraph beside a picture.',
    group: 'Content',
    fields: [
      { name: 'heading', label: 'Heading', required: true },
      { name: 'text', label: 'Text', multiline: true },
    ],
    Thumbnail: () => (
      <Frame>
        {bar(16, 26, 56, 6)}
        {bar(16, 40, 60, 3)}
        {bar(16, 48, 54, 3)}
        {bar(16, 56, 48, 3)}
        <rect x='88' y='20' width='56' height='50' rx='2' opacity='0.7' />
      </Frame>
    ),
  },
  {
    name: 'callToAction',
    label: 'Call to action',
    description: 'A short prompt with one button.',
    group: 'Conversion',
    fields: [
      { name: 'heading', label: 'Heading', required: true },
      { name: 'buttonLabel', label: 'Button label', required: true },
    ],
    Thumbnail: () => (
      <Frame>
        <rect x='12' y='18' width='136' height='54' rx='3' opacity='0.35' />
        {bar(40, 32, 80, 7)}
        <rect x='60' y='48' width='40' height='11' rx='2' opacity='0.8' />
      </Frame>
    ),
  },
  {
    name: 'newsletter',
    label: 'Newsletter sign-up',
    description: 'An email box and a sign-up button.',
    group: 'Conversion',
    fields: [{ name: 'heading', label: 'Heading', required: true }],
    Thumbnail: () => (
      <Frame>
        {bar(40, 24, 80, 6)}
        <rect x='30' y='42' width='70' height='12' rx='2' opacity='0.4' />
        <rect x='104' y='42' width='26' height='12' rx='2' opacity='0.8' />
      </Frame>
    ),
  },
];

export const templateOf = (name: string) =>
  TEMPLATES.find((template) => template.name === name) ?? TEMPLATES[0];

export const emptyBlock = (template: BlockTemplate): Block => ({
  template: template.name,
  fields: Object.fromEntries(template.fields.map((field) => [field.name, ''])),
});

// The collapsed summary of a block: its template, then its first text field.
export const blockText = (block: Block) =>
  block.fields[templateOf(block.template).fields[0].name] ?? '';

export const blockErrors = (block: Block) =>
  Object.fromEntries(
    templateOf(block.template)
      .fields.filter(
        (field) =>
          field.required && (block.fields[field.name] ?? '').trim() === ''
      )
      .map((field) => [field.name, `Enter a ${field.label.toLowerCase()}.`])
  );
