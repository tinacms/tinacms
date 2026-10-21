import type { Schema } from '@tinacms/schema-tools';
import { beforeAll, describe, expect, it } from 'vitest';
import { createSchema } from '../schema/createSchema';
import { type ReferenceVisit, encodeLocator, visitReferences } from './visit';

/**
 * Covers the shapes the path-based index could not express: a templated list inside another, a
 * rich-text field in a block rather than the document body, an MDX component in that rich text
 * with an object prop, and a reference list.
 */
const schema: Schema = {
  collections: [
    {
      name: 'page',
      label: 'Page',
      path: 'content/pages',
      format: 'mdx',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'string',
          isTitle: true,
          required: true,
        },
        {
          name: 'hero',
          label: 'Hero',
          type: 'reference',
          collections: ['page'],
        },
        {
          name: 'blocks',
          label: 'Blocks',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'accordion',
              label: 'Accordion',
              fields: [
                {
                  name: 'items',
                  label: 'Items',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      name: 'body',
                      label: 'Body',
                      type: 'rich-text',
                      templates: [
                        {
                          name: 'Callout',
                          label: 'Callout',
                          fields: [
                            {
                              name: 'note',
                              label: 'Note',
                              type: 'rich-text',
                              templates: [
                                {
                                  name: 'Button',
                                  label: 'Button',
                                  fields: [
                                    {
                                      name: 'page',
                                      label: 'Page',
                                      type: 'reference',
                                      collections: ['page'],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          name: 'Button',
                          label: 'Button',
                          fields: [
                            {
                              name: 'destination',
                              label: 'Destination',
                              type: 'object',
                              templates: [
                                {
                                  name: 'internal',
                                  label: 'Internal',
                                  fields: [
                                    {
                                      name: 'page',
                                      label: 'Page',
                                      type: 'reference',
                                      collections: ['page'],
                                    },
                                  ],
                                },
                                {
                                  name: 'external',
                                  label: 'External',
                                  fields: [
                                    {
                                      name: 'url',
                                      label: 'URL',
                                      type: 'string',
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              name: 'conversions',
                              label: 'Conversions',
                              type: 'reference',
                              list: true,
                              collections: ['page'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'banner',
              label: 'Banner',
              fields: [
                {
                  name: 'link',
                  label: 'Link',
                  type: 'reference',
                  collections: ['page'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

let tinaSchema: Awaited<ReturnType<typeof createSchema>>;
beforeAll(async () => {
  tinaSchema = await createSchema({ schema });
});

const collection = () => tinaSchema.getCollection('page');

const collect = (data: Record<string, unknown>) => {
  const found: { value: string; locator: string }[] = [];
  const changed = visitReferences(data, collection(), tinaSchema, (r) =>
    found.push({ value: r.value, locator: encodeLocator(r.locator) })
  );
  return { found, changed };
};

const rewrite = (
  data: Record<string, unknown>,
  from: string,
  to: string | null
) =>
  visitReferences(data, collection(), tinaSchema, (r: ReferenceVisit) => {
    if (r.value === from) r.replace(to);
  });

const buttonBody = (page: string, conversions: string[] = []) =>
  `<Button destination={{ _template: "internal", page: "${page}" }} conversions={${JSON.stringify(
    conversions
  )}} />`;

/** A page whose only reference is in an MDX component, in rich text, inside two templated lists. */
const deepPage = (page: string, conversions: string[] = []) => ({
  title: 'T',
  blocks: [
    {
      _template: 'accordion',
      items: [{ body: buttonBody(page, conversions) }],
    },
  ],
});

describe('visitReferences', () => {
  it('finds a plain reference', () => {
    const { found } = collect({ title: 'T', hero: 'content/pages/a.mdx' });
    expect(found).toEqual([
      { value: 'content/pages/a.mdx', locator: '["hero"]' },
    ]);
  });

  /** Templated list items are tagged `_template`, with no key of that name for a path to use. */
  it('finds a reference inside a templated list item', () => {
    const { found } = collect({
      title: 'T',
      blocks: [
        { _template: 'banner', link: 'content/pages/b.mdx' },
        { _template: 'banner', link: 'content/pages/c.mdx' },
      ],
    });
    expect(found.map((f) => f.value)).toEqual([
      'content/pages/b.mdx',
      'content/pages/c.mdx',
    ]);
    expect(found[0]!.locator).toBe('["blocks",0,"link"]');
    expect(found[1]!.locator).toBe('["blocks",1,"link"]');
  });

  it('ignores a templated item whose template does not exist', () => {
    const { found } = collect({
      title: 'T',
      blocks: [
        { _template: 'nonsense', link: 'content/pages/b.mdx' },
        { _template: 'banner', link: 'content/pages/c.mdx' },
      ],
    });
    // The bad item is skipped and the good one is still found.
    expect(found.map((f) => f.value)).toEqual(['content/pages/c.mdx']);
  });

  /** Rich text is stored as a string, so no path expression can address a reference inside it. */
  it('finds a reference inside an MDX component in nested rich text', () => {
    const { found } = collect(deepPage('content/pages/d.mdx'));

    expect(found.map((f) => f.value)).toEqual(['content/pages/d.mdx']);
    expect(found[0]!.locator).toBe(
      '["blocks",0,"items",0,"body",{"mdx":true},0,"props","destination","page"]'
    );
  });

  /** A reference list inside MDX props: the case whose old path ended `[*]` and threw on rewrite. */
  it('finds every entry of a reference list inside rich text', () => {
    const { found } = collect(
      deepPage('content/pages/d.mdx', [
        'content/pages/x.mdx',
        'content/pages/y.mdx',
      ])
    );

    expect(found.map((f) => f.value)).toEqual([
      'content/pages/d.mdx',
      'content/pages/x.mdx',
      'content/pages/y.mdx',
    ]);
    expect(found[1]!.locator).toBe(
      '["blocks",0,"items",0,"body",{"mdx":true},0,"props","conversions",0]'
    );
  });

  it('reports nothing changed when only collecting', () => {
    expect(collect(deepPage('content/pages/d.mdx')).changed).toBe(false);
  });
});

describe('visitReferences rewriting', () => {
  it('renames a plain reference', () => {
    const data = { title: 'T', hero: 'content/pages/a.mdx' };

    expect(rewrite(data, 'content/pages/a.mdx', 'content/pages/z.mdx')).toBe(
      true
    );
    expect(data.hero).toBe('content/pages/z.mdx');
  });

  it('leaves a reference that points somewhere else alone', () => {
    const data = {
      title: 'T',
      blocks: [
        { _template: 'banner', link: 'content/pages/b.mdx' },
        { _template: 'banner', link: 'content/pages/c.mdx' },
      ],
    };

    rewrite(data, 'content/pages/b.mdx', 'content/pages/z.mdx');

    expect(data.blocks[0]!.link).toBe('content/pages/z.mdx');
    expect(data.blocks[1]!.link).toBe('content/pages/c.mdx');
  });

  /** The rewrite the old code could not do at all, since the reference was inside a string. */
  it('renames inside rich text and writes the text back', () => {
    const data = deepPage('content/pages/d.mdx');

    expect(rewrite(data, 'content/pages/d.mdx', 'content/pages/z.mdx')).toBe(
      true
    );

    const body = (data.blocks[0] as any).items[0].body as string;
    expect(typeof body).toBe('string');
    expect(body).toContain('content/pages/z.mdx');
    expect(body).not.toContain('content/pages/d.mdx');
  });

  it('renames an entry of a reference list inside rich text', () => {
    const data = deepPage('content/pages/d.mdx', [
      'content/pages/x.mdx',
      'content/pages/y.mdx',
    ]);

    rewrite(data, 'content/pages/x.mdx', 'content/pages/z.mdx');

    const body = (data.blocks[0] as any).items[0].body as string;
    expect(body).toContain('content/pages/z.mdx');
    expect(body).toContain('content/pages/y.mdx');
    expect(body).not.toContain('content/pages/x.mdx');
  });

  /** The MDX writer normalizes, so a field no replacement reached must be left untouched. */
  it('leaves rich text it did not change byte-identical', () => {
    const original = buttonBody('content/pages/d.mdx');
    const data = {
      title: 'T',
      blocks: [
        { _template: 'accordion', items: [{ body: original }] },
        { _template: 'banner', link: 'content/pages/b.mdx' },
      ],
    };

    expect(rewrite(data, 'content/pages/b.mdx', 'content/pages/z.mdx')).toBe(
      true
    );

    expect((data.blocks[0] as any).items[0].body).toBe(original);
  });

  it('reports nothing changed when no reference matched', () => {
    const data = deepPage('content/pages/d.mdx');
    const before = JSON.stringify(data);

    expect(
      rewrite(data, 'content/pages/absent.mdx', 'content/pages/z.mdx')
    ).toBe(false);
    expect(JSON.stringify(data)).toBe(before);
  });
});

describe('rich text inside rich text', () => {
  // A rich-text prop is parsed into a tree, so the inner field is not text and is not
  // reserialized on its own. The outer field's text contains it.
  const nested = (page: string) =>
    [
      '<Callout',
      '  note={',
      '    <>',
      `      <Button page="${page}" />`,
      '    </>',
      '  }',
      '/>',
    ].join('\n');

  const pageWith = (body: string) => ({
    title: 'T',
    blocks: [{ _template: 'accordion', items: [{ body }] }],
  });

  it('finds a reference in the inner field', () => {
    const { found } = collect(pageWith(nested('content/pages/a.mdx')));

    expect(found.map((f) => f.value)).toContain('content/pages/a.mdx');
  });

  it('writes the outer field back when only the inner one changed', () => {
    const data = pageWith(nested('content/pages/a.mdx')) as Record<
      string,
      unknown
    >;

    const changed = rewrite(data, 'content/pages/a.mdx', 'content/pages/b.mdx');
    const written = (data.blocks as { items: { body: string }[] }[])[0].items[0]
      .body;

    expect(changed).toBe(true);
    expect(written).toContain('content/pages/b.mdx');
    expect(written).not.toContain('content/pages/a.mdx');
  });
});
