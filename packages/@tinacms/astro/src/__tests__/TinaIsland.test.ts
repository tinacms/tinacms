import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import TinaIsland from '../TinaIsland.astro';

let container: AstroContainer;

beforeEach(async () => {
  container = await AstroContainer.create();
});

const wrapper = { tag: 'article', className: 'prose' };

describe('TinaIsland', () => {
  it('emits the data-tina-island marker with encoded params', async () => {
    const html = await container.renderToString(TinaIsland, {
      props: { name: 'post', wrapper, params: { slug: 'hello-world' } },
      slots: { default: 'BODY' },
    });
    expect(html).toContain(
      'data-tina-island="/tina-island/post?slug=hello-world"'
    );
    expect(html).toContain('BODY');
    expect(html).toContain('class="prose"');
  });

  it('emits the guarded in-iframe bootstrap script', async () => {
    const html = await container.renderToString(TinaIsland, {
      props: { name: 'post', wrapper },
      slots: { default: 'BODY' },
    });
    expect(html).toContain('window.__tinaBootstrap');
    expect(html).toContain("import('/admin/bridge.js')");
    expect(html).toContain('window.self !== window.top');
  });

  it('threads the resolved admin origin through define:vars', async () => {
    const html = await container.renderToString(TinaIsland, {
      props: { name: 'post', wrapper },
      slots: { default: 'BODY' },
    });
    // `define:vars` emits the value resolved from PUBLIC_TINA_ADMIN_ORIGIN —
    // `null` here since it's unset in the test env.
    expect(html).toContain('adminOrigin = null');
    expect(html).toContain('init(adminOrigin ? { adminOrigin } : undefined)');
  });

  it('marks the wrapper data-tina-island-primary only when primary is set', async () => {
    const withoutPrimary = await container.renderToString(TinaIsland, {
      props: { name: 'post', wrapper },
      slots: { default: 'BODY' },
    });
    expect(withoutPrimary).not.toContain('data-tina-island-primary');

    const withPrimary = await container.renderToString(TinaIsland, {
      props: { name: 'post', wrapper, primary: true },
      slots: { default: 'BODY' },
    });
    expect(withPrimary).toContain('data-tina-island-primary');
  });
});
