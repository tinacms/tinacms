import { build } from 'vite';
import { Database } from '@tinacms/graphql';
import { ConfigManager } from '../../config-manager';
import { createConfig } from '../../vite';
import { transformTsxPlugin, viteTransformExtension } from '../../vite/plugins';

export const buildProductionSpa = async (
  configManager: ConfigManager,
  database: Database,
  apiURL: string
) => {
  const config = await createConfig({
    plugins: [transformTsxPlugin({ configManager }), viteTransformExtension()],
    configManager,
    database,
    apiURL,
    noWatch: true,
    // The production admin SPA is always served the deployed content API
    // (`codegen.productionUrl` — TinaCloud or the configured override), never the
    // local dev server, so it is never in local mode. This holds for `--local`
    // and `--content=local` too: those affect the generated query client, but the
    // built admin still targets the production URL. (`tinacms dev` is the local
    // path — see createDevServer.)
    isLocal: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
  });
  return build(config);
};
