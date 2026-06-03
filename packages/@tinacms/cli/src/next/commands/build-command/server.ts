import { build } from 'vite';
import { Database } from '@tinacms/graphql';
import { ConfigManager } from '../../config-manager';
import { resolveIsLocal } from '../../../utils/isLocal';
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
    // Local mode follows TINA_PUBLIC_IS_LOCAL; `tinacms build` defaults to not
    // local (the built admin targets the deployed content API).
    isLocal: resolveIsLocal(false),
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
