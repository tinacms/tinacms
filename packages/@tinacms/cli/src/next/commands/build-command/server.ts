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
