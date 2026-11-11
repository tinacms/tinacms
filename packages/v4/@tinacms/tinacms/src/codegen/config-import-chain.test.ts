import path from 'node:path';
import { loadConfigFromFile } from 'vite';
import { expect, it } from 'vitest';

// Vite loads a project's vite.config.ts with Node's own loader. The playground's
// config imports the Local Data Layer plugin from source, so nothing it reaches
// may load `@tinacms/rich-text`, whose source uses extensionless imports that
// Node cannot resolve. Without this, `pnpm dev` and the v4 Playwright suite do
// not start.
it('loads the playground vite.config the way vite does', async () => {
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    path.resolve(__dirname, '../../playground/vite.config.ts')
  );
  expect(loaded?.path).toContain('vite.config.ts');
}, 60_000);
