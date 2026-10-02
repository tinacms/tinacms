import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import TinaMarkdown from '../TinaMarkdown.astro';
import basicKitchenSink from './fixtures/basic-kitchen-sink.json';
import codeBlock from './fixtures/code-block.json';
import leafMarks from './fixtures/leaf-marks.json';
import mdxJsxFlow from './fixtures/mdx-jsx-flow.json';
import mdxJsxText from './fixtures/mdx-jsx-text.json';
import mdxTable from './fixtures/mdx-table.json';
import table from './fixtures/table.json';

let container: AstroContainer;

beforeEach(async () => {
  container = await AstroContainer.create();
});

/**
 * Astro injects dev-only `data-astro-source-file` / `data-astro-source-loc`
 * attributes for editor source-mapping. Strip them so snapshots and string
 * assertions stay stable across Astro versions and dev/prod modes.
 */
const stripDevAttrs = (html: string) =>
  html.replace(/\s+data-astro-source-(?:file|loc)="[^"]*"/g, '');

const render = async (props: Parameters<typeof container.renderToString>[1]) =>
  stripDevAttrs(await container.renderToString(TinaMarkdown, props));

describe('TinaMarkdown', () => {
  it('renders the basic kitchen-sink fixture', async () => {
    const html = await render({ props: { content: basicKitchenSink } });
    expect(html).toMatchSnapshot();
  });

  it('renders nested leaf-mark formatting', async () => {
    const html = await render({ props: { content: leafMarks } });
    expect(html).toMatchSnapshot();
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<code>inline code</code>');
  });

  it('renders code blocks with language class', async () => {
    const html = await render({ props: { content: codeBlock } });
    expect(html).toMatchSnapshot();
    expect(html).toMatch(/<pre><code class="language-javascript">/);
  });

  it('falls back to a placeholder when an mdxJsx component is unregistered', async () => {
    const html = await render({ props: { content: mdxJsxFlow } });
    expect(html).toContain('No component provided for someFeature');
  });

  it('falls back to a placeholder for unregistered inline mdxJsx', async () => {
    const html = await render({ props: { content: mdxJsxText } });
    expect(html).toMatch(/No component provided for/);
  });

  it('renders an empty array when content is null', async () => {
    const html = await render({ props: { content: null } });
    expect(html.trim()).toBe('');
  });

  it('accepts a bare array of nodes (not wrapped in root)', async () => {
    const nodes = [{ type: 'p', children: [{ type: 'text', text: 'hello' }] }];
    const html = await render({ props: { content: nodes } });
    expect(html).toContain('<p>hello</p>');
  });

  it('renders sanitized hrefs on link nodes', async () => {
    const nodes = [
      {
        type: 'p',
        children: [
          {
            type: 'a',
            url: 'javascript:alert(1)',
            children: [{ type: 'text', text: 'click' }],
          },
        ],
      },
    ];
    const html = await render({ props: { content: nodes } });
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="#"');
  });
});

/**
 * Characterises what this renderer does with `html` / `html_inline` nodes, so
 * the behaviour is pinned while `tinacms` and `@tinacms/web-components` are
 * brought into line. The same cases exist in those packages' suites.
 */
describe('TinaMarkdown — raw HTML nodes', () => {
  it('does not emit markup for a block html node', async () => {
    const html = await render({
      props: {
        content: [
          {
            type: 'html',
            value: '<div id="raw"><center><p>hi</p></center></div>',
          },
        ],
      },
    });

    expect(html).not.toContain('<div id="raw">');
    expect(html).toContain('&lt;div id=&quot;raw&quot;&gt;');
  });

  it('does not emit markup for an inline html node', async () => {
    const html = await render({
      props: {
        content: [
          {
            type: 'p',
            children: [
              { type: 'text', text: 'Some ' },
              { type: 'html_inline', value: '<b>bold</b>' },
              { type: 'text', text: ' inline.' },
            ],
          },
        ],
      },
    });

    expect(html).not.toContain('<b>bold</b>');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('does not emit an element carrying an inline event handler', async () => {
    const html = await render({
      props: {
        content: [
          { type: 'html', value: '<img src="x" onerror="globalThis.x = 1">' },
        ],
      },
    });

    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror="');
  });

  it('emits raw HTML when the consumer opts in via components.html', async () => {
    const RawHtml = await import('./fixtures/RawHtml.astro');
    const html = await render({
      props: {
        content: [{ type: 'html', value: '<div id="raw">hi</div>' }],
        components: { html: RawHtml.default },
      },
    });

    expect(html).toContain('<div id="raw">hi</div>');
  });
});

describe('TinaMarkdown — tables', () => {
  it('renders a native table node with a header row, cells and column alignment', async () => {
    const html = await render({ props: { content: table } });
    expect(html).toMatchSnapshot();
    expect(html).toContain('<table');
    expect(html).toContain('<thead>');
    expect(html).toContain('<th');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<tr>');
    expect(html).toContain('<td');
    // Per-column alignment from props.align, on both <th> and <td>.
    expect(html).toContain('<th style="text-align:left">Name</th>');
    expect(html).toContain('<th style="text-align:center">Role</th>');
    expect(html).toContain('<th style="text-align:right">Score</th>');
    expect(html).toContain('text-align:left');
    expect(html).toContain('text-align:center');
    expect(html).toContain('text-align:right');
    // Row 0 is the header and does not leak into the body.
    expect(html).not.toMatch(/<tbody>.*Name/s);
    // Inline marks render inside cells.
    expect(html).toContain('<strong>Ada</strong>');
    // Cell content is not wrapped in an extra <p>.
    expect(html).not.toMatch(/<t[hd][^>]*><p[\s>]/);
  });

  it('overrides the table tag via components.table', async () => {
    const FancyTable = await import('./fixtures/FancyTable.astro');
    const html = await render({
      props: { content: table, components: { table: FancyTable.default } },
    });
    expect(html).toContain('class="fancy-table"');
    expect(html).toContain('Name');
    expect(html).toContain('Eng');
  });

  it('renders the legacy mdx-flow table with a header row', async () => {
    const html = await render({ props: { content: mdxTable } });
    expect(html).toMatchSnapshot();
    expect(html).toContain('<thead>');
    expect(html).toContain('<th');
    expect(html).toContain('Header A');
    expect(html).toContain('<tbody>');
    expect(html).toContain('a1');
    expect(html).toContain('text-align:left');
    expect(html).toContain('text-align:right');
    expect(html).not.toContain('No component provided for table');
  });
});

describe('TinaMarkdown — components map', () => {
  it('dispatches a registered mdxJsx component by name', async () => {
    const MyFeature = await import('./fixtures/MyFeature.astro');
    const html = await render({
      props: {
        content: mdxJsxFlow,
        components: { someFeature: MyFeature.default },
      },
    });
    expect(html).toContain('<section data-test="my-feature">');
    expect(html).not.toContain('No component provided for someFeature');
  });

  it('overrides a default tag (h1) when registered on the components map', async () => {
    const FancyHeading = await import('./fixtures/FancyHeading.astro');
    const nodes = [{ type: 'h1', children: [{ type: 'text', text: 'hello' }] }];
    const html = await render({
      props: {
        content: nodes,
        components: { h1: FancyHeading.default },
      },
    });
    expect(html).toContain('class="fancy"');
    expect(html).toContain('hello');
  });
});
