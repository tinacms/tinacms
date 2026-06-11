import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../logger';
import { logText } from '../../utils/theme';
import { isDefaultAstroConfig } from './astro-config-detect';

const TS_NOCHECK =
  '// @ts-nocheck (generated types/client appear after your first tinacms dev run)\n';

const DEMO_FILES: Record<string, string> = {
  'src/lib/tina/data.ts': `${TS_NOCHECK}import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../tina/__generated__/client';

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: slug + '.md' }), {
    priority: 'primary',
  });
`,
  'src/lib/tina/islands.ts': `${TS_NOCHECK}import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { PostQuery } from '../../../tina/__generated__/types';
import PostBody from '../../components/tina/PostBody.astro';
import { getPost } from './data';

export const islands: IslandRegistry = {
  post: {
    fetch: (_request, params) => getPost(params.get('slug') ?? 'hello-world'),
    component: PostBody,
    wrapper: { tag: 'article' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PostQuery>).data?.post,
    }),
  },
};
`,
  'src/pages/tina-island/[name].ts': `import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/tina/islands';

export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);
`,
  'src/components/tina/PostBody.astro': `---
${TS_NOCHECK.trim()}
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { tinaField } from '@tinacms/astro/tina-field';
import type { PostQuery } from '../../../tina/__generated__/types';

interface Props {
  data?: PostQuery['post'] | null;
}
const { data } = Astro.props;
---
{
  data && (
    <>
      {data.eyebrow && (
        <p class="eyebrow" data-tina-field={tinaField(data, 'eyebrow')}>{data.eyebrow}</p>
      )}
      <h1 data-tina-field={tinaField(data, 'title')}>{data.title}</h1>
      {data.body && (
        <div class="body" data-tina-field={tinaField(data, 'body')}>
          <TinaMarkdown content={data.body} />
        </div>
      )}
      <div class="tina-actions">
        {data.ctaPrimary?.label && (
          <a class="primary" href={data.ctaPrimary.href} data-tina-field={tinaField(data.ctaPrimary, 'label')}>{data.ctaPrimary.label}</a>
        )}
        {data.ctaSecondary?.label && (
          <a class="secondary" href={data.ctaSecondary.href} target="_blank" rel="noopener noreferrer" data-tina-field={tinaField(data.ctaSecondary, 'label')}>{data.ctaSecondary.label}</a>
        )}
      </div>
    </>
  )
}
`,
  'src/components/tina/Starfield.astro': `---
// Decorative twinkling starfield for the demo hero. Self-contained SVG, no deps.
interface Props {
  count?: number;
}
const { count = 70 } = Astro.props;
const frac = (n: number) => {
  const x = Math.sin(n) * 43758.5453;
  return Math.abs(x - Math.floor(x));
};
const STAR = 'M0-1C.2-.2.2-.2 1 0 .2.2.2.2 0 1-.2.2-.2.2-1 0-.2-.2-.2-.2 0-1Z';
const stars = Array.from({ length: count }, (_, i) => {
  const cx = (frac(i + 1) * 100).toFixed(2);
  const cy = (frac((i + 1) * 2.7) * 100).toFixed(2);
  const scale = (frac((i + 1) * 5.3) * 1.3 + 0.5).toFixed(2);
  const delay = (frac((i + 1) * 9.1) * 3).toFixed(2);
  return {
    transform: 'translate(' + cx + ' ' + cy + ') scale(' + scale + ')',
    delay: delay + 's',
  };
});
---
<svg class="tina-stars" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
  {stars.map((star) => (
    <path d={STAR} fill="currentColor" transform={star.transform} style={'animation-delay:' + star.delay} />
  ))}
</svg>
`,
  'src/pages/tina-demo.astro': `---
// Tina visual-editing demo hero. Open this page in the CMS to click-and-edit
// the title (headline) and body (tagline), then copy the pattern into your own
// pages. Self-contained: scoped styles, no CSS framework, no image assets. Safe
// to delete (with src/lib/tina/, src/components/tina/, src/pages/tina-island/)
// once you're done.
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import PostBody from '../components/tina/PostBody.astro';
import Starfield from '../components/tina/Starfield.astro';
import { getPost } from '../lib/tina/data';
import { islands } from '../lib/tina/islands';

const slug = 'hello-world';
const post = await getPost(slug);
const data = post.data?.post;
if (!data) return new Response('Not Found', { status: 404 });
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{data.title}</title>
    <style is:global>
      :root {
        color-scheme: dark;
        --tina-bg: oklch(0.16 0.02 285);
        --tina-fg: oklch(0.95 0.012 285);
        --tina-muted: oklch(0.72 0.03 285);
        --tina-primary: oklch(0.7 0.18 40);
        --tina-primary-fg: oklch(0.16 0.02 285);
        --tina-border: oklch(0.95 0.01 285 / 12%);
      }
      body {
        margin: 0;
        min-height: 100vh;
        overflow: hidden;
        background: radial-gradient(120% 120% at 50% 0%, oklch(0.22 0.03 285) 0%, var(--tina-bg) 55%);
        color: var(--tina-fg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
      .tina-hero {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 64rem;
        margin: 0 auto;
        padding: 5rem 1.5rem;
        text-align: center;
      }
      .tina-hero .eyebrow {
        margin: 0 0 1.5rem;
        font-size: 0.8rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--tina-primary);
      }
      .tina-hero h1 {
        margin: 0;
        font-size: clamp(2.75rem, 6vw, 5.25rem);
        line-height: 1.05;
        font-weight: 600;
        letter-spacing: -0.025em;
        text-wrap: balance;
        color: var(--tina-fg);
      }
      .tina-hero .body {
        max-width: 42rem;
        margin: 2rem auto 0;
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--tina-muted);
      }
      .tina-hero .body :where(p) { margin: 0; }
      .tina-actions {
        margin-top: 3rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
      }
      .tina-actions a {
        display: inline-flex;
        align-items: center;
        height: 2.5rem;
        padding: 0 1.25rem;
        border-radius: 0.75rem;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
      }
      .tina-actions .primary { background: var(--tina-primary); color: var(--tina-primary-fg); }
      .tina-actions .secondary { border: 1px solid var(--tina-border); color: var(--tina-fg); }
      .tina-stars {
        position: fixed;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        color: oklch(0.95 0.012 285 / 0.2);
        pointer-events: none;
      }
      @media (prefers-reduced-motion: no-preference) {
        .tina-stars path { animation: tina-twinkle 4s ease-in-out infinite; }
      }
      @keyframes tina-twinkle {
        0%, 100% { opacity: 0.25; }
        50% { opacity: 0.9; }
      }
    </style>
  </head>
  <body>
    <Starfield count={70} />
    <main class="tina-hero">
      <TinaIsland name="post" wrapper={islands.post.wrapper} params={{ slug }} primary>
        <PostBody data={data} />
      </TinaIsland>
    </main>
  </body>
</html>
`,
};

const VISUAL_EDITING_SNIPPET = `  import node from '@astrojs/node';
  import tina from '@tinacms/astro/integration';
  import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

  export default defineConfig({
    output: 'server',
    adapter: node({ mode: 'standalone' }),
    integrations: [tina() /* , ...your integrations */],
    vite: {
      plugins: [tinaAdminDevRedirect()],
      ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
    },
  });

Full guide: https://tina.io/docs/frameworks/astro#enabling-visual-editing`;

const CONFIG_GUIDANCE = `Your astro.config already has content, so it was left unchanged. To finish the visual-editing demo, add the Tina integration and an SSR adapter:

${VISUAL_EDITING_SNIPPET}`;

const ASTRO_CONFIG = `import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
  },
});
`;

const ASTRO_CONFIG_FILES = [
  'astro.config.mjs',
  'astro.config.ts',
  'astro.config.mts',
  'astro.config.js',
  'astro.config.cjs',
  'astro.config.cts',
];

const findAstroConfig = (baseDir: string) =>
  ASTRO_CONFIG_FILES.map((file) => path.join(baseDir, file)).find((p) =>
    fs.existsSync(p)
  );

export type AstroSetupResult = {
  // astro.config was written/already-correct; when false the caller prints guidance
  configHandled: boolean;
};

// Scaffolds a self-contained, single-page visual-editing demo (no opt-in, to
// match the Next.js demo). Never overwrites existing files: if any demo path is
// already taken it skips the whole demo with a warning.
export const setupAstroVisualEditing = ({
  baseDir,
}: {
  baseDir: string;
}): AstroSetupResult => {
  const targets = Object.keys(DEMO_FILES).map((rel) => ({
    rel,
    abs: path.join(baseDir, rel),
  }));
  const existing = targets
    .filter((t) => fs.existsSync(t.abs))
    .map((t) => t.rel);
  if (existing.length > 0) {
    logger.warn(
      logText(
        `Skipping the visual-editing demo — these files already exist: ${existing.join(
          ', '
        )}. See https://tina.io/docs/frameworks/astro to wire it up manually.`
      )
    );
    return { configHandled: true };
  }

  for (const { rel, abs } of targets) {
    fs.outputFileSync(abs, DEMO_FILES[rel]);
  }
  logger.info('Adding a visual-editing demo at /tina-demo... ✅');

  // No config at all -> safe to create one. Empty default -> overwrite. Only a
  // config with real content is left alone (the caller prints guidance).
  const configPath = findAstroConfig(baseDir);
  if (!configPath) {
    fs.writeFileSync(path.join(baseDir, 'astro.config.mjs'), ASTRO_CONFIG);
    logger.info('Creating astro.config for visual editing... ✅');
    return { configHandled: true };
  }
  if (isDefaultAstroConfig(fs.readFileSync(configPath).toString())) {
    fs.writeFileSync(configPath, ASTRO_CONFIG);
    logger.info('Wiring astro.config for visual editing... ✅');
    return { configHandled: true };
  }
  return { configHandled: false };
};

export const logAstroConfigGuidance = () => {
  logger.info(logText(CONFIG_GUIDANCE));
};
