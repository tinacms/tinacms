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
      <h1 data-tina-field={tinaField(data, 'title')}>{data.title}</h1>
      {data.body && (
        <div data-tina-field={tinaField(data, 'body')}>
          <TinaMarkdown content={data.body} />
        </div>
      )}
    </>
  )
}
`,
  'src/pages/tina-demo.astro': `---
// Tina visual-editing demo. Open this page in the CMS to click-and-edit the
// title and body, then copy the pattern into your own pages. Safe to delete
// (with src/lib/tina/, src/components/tina/PostBody.astro, and
// src/pages/tina-island/) once you're done.
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import PostBody from '../components/tina/PostBody.astro';
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
  </head>
  <body>
    <TinaIsland name="post" wrapper={islands.post.wrapper} params={{ slug }} primary>
      <PostBody data={data} />
    </TinaIsland>
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
    vite: { plugins: [tinaAdminDevRedirect()] },
  });

Full guide: https://tina.io/docs/frameworks/astro#enabling-visual-editing`;

const CONFIG_GUIDANCE = `Your astro.config already has content, so it was left unchanged. To finish the visual-editing demo, add the Tina integration and an SSR adapter:

${VISUAL_EDITING_SNIPPET}`;

const NO_CONFIG_GUIDANCE = `No astro.config was found. To finish the visual-editing demo, create one with:

  import { defineConfig } from 'astro/config';
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
  // whether an astro config file was found at all (chooses the guidance wording)
  configFound: boolean;
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
    return { configHandled: true, configFound: true };
  }

  for (const { rel, abs } of targets) {
    fs.outputFileSync(abs, DEMO_FILES[rel]);
  }
  logger.info('Adding a visual-editing demo at /tina-demo... ✅');

  const configPath = findAstroConfig(baseDir);
  if (!configPath) {
    return { configHandled: false, configFound: false };
  }
  if (isDefaultAstroConfig(fs.readFileSync(configPath).toString())) {
    fs.writeFileSync(configPath, ASTRO_CONFIG);
    logger.info('Wiring astro.config for visual editing... ✅');
    return { configHandled: true, configFound: true };
  }
  return { configHandled: false, configFound: true };
};

export const logAstroConfigGuidance = ({
  configFound,
}: {
  configFound: boolean;
}) => {
  logger.info(logText(configFound ? CONFIG_GUIDANCE : NO_CONFIG_GUIDANCE));
};
