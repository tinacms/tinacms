import path from 'path';
import fs from 'fs-extra';
import type { ConfigManager } from '../config-manager';

/**
 * Bundle the three codegen outputs under `tina/__generated__/` into the
 * legacy `tina-lock.json` shape that TinaCloud's indexer reads via the
 * `fetchTinaLock` path. A no-op for projects still on the legacy `.tina/`
 * folder layout (those projects don't have a working TinaCloud setup
 * and emit a separate warning in ConfigManager).
 */
export const writeTinaLockFile = async (configManager: ConfigManager) => {
  if (configManager.isUsingLegacyFolder) {
    return;
  }
  const [schemaObject, lookupObject, graphqlSchemaObject] = await Promise.all([
    fs.readJSON(configManager.generatedSchemaJSONPath),
    fs.readJSON(configManager.generatedLookupJSONPath),
    fs.readJSON(configManager.generatedGraphQLJSONPath),
  ]);
  await fs.writeFile(
    path.join(configManager.tinaFolderPath, 'tina-lock.json'),
    JSON.stringify({
      schema: schemaObject,
      lookup: lookupObject,
      graphql: graphqlSchemaObject,
    })
  );
};
