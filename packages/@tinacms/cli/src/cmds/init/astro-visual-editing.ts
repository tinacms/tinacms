import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../logger';
import { logText } from '../../utils/theme';

const DEMO_FILES: Record<string, string> = {
  'src/lib/data.ts': `import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: slug + '.md' }), {
    priority: 'primary',
  });
`,
  'src/lib/islands.ts': `import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { PostQuery } from '../../tina/__generated__/types';
import PostBody from '../components/PostBody.astro';
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
import { islands } from '../../lib/islands';

export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);
`,
  'src/components/PostBody.astro': `---
import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
import { tinaField } from '@tinacms/astro/tina-field';
import type { PostQuery } from '../../tina/__generated__/types';

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
// once you're done (along with src/lib/data.ts, src/lib/islands.ts,
// src/pages/tina-island/, and src/components/PostBody.astro).
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import PostBody from '../components/PostBody.astro';
import { getPost } from '../lib/data';
import { islands } from '../lib/islands';

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
  },
});
`;

const CONFIG_GUIDANCE = `Your astro.config already has content, so it was left unchanged. To finish the visual-editing demo, add the Tina integration and an SSR adapter:

  import node from '@astrojs/node';
  import tina from '@tinacms/astro/integration';
  import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

  export default defineConfig({
    output: 'server',
    adapter: node({ mode: 'standalone' }),
    integrations: [tina() /* , ...your integrations */],
    vite: { plugins: [tinaAdminDevRedirect()] },
  });

Full guide: https://tina.io/docs/frameworks/astro#enabling-visual-editing`;

const ASTRO_CONFIG_FILES = [
  'astro.config.mjs',
  'astro.config.ts',
  'astro.config.mts',
  'astro.config.js',
];

// Only an untouched default config (an empty `defineConfig({})`) is overwritten;
// a customized config is never clobbered.
const isDefaultAstroConfig = (source: string) =>
  /defineConfig\(\s*\{\s*\}\s*\)/.test(source);

const findAstroConfig = (baseDir: string) =>
  ASTRO_CONFIG_FILES.map((file) => path.join(baseDir, file)).find((p) =>
    fs.existsSync(p)
  );

// Scaffolds a self-contained, single-page visual-editing demo (no opt-in, to
// match the Next.js demo). Returns whether astro.config was wired automatically;
// when false, the caller prints `logAstroConfigGuidance`.
export const setupAstroVisualEditing = ({
  baseDir,
}: {
  baseDir: string;
}): { configHandled: boolean } => {
  for (const [relPath, content] of Object.entries(DEMO_FILES)) {
    fs.outputFileSync(path.join(baseDir, relPath), content);
  }
  logger.info('Adding a visual-editing demo at /tina-demo... ✅');

  const configPath = findAstroConfig(baseDir);
  if (
    configPath &&
    isDefaultAstroConfig(fs.readFileSync(configPath).toString())
  ) {
    fs.writeFileSync(configPath, ASTRO_CONFIG);
    logger.info('Wiring astro.config for visual editing... ✅');
    return { configHandled: true };
  }
  return { configHandled: false };
};

export const logAstroConfigGuidance = () => {
  logger.info(logText(CONFIG_GUIDANCE));
};
