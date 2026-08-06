import { type PluginManifest, resolveClientSegments } from '../core/plugin';

/**
 * Loads plugin client segments before a test renders `<TinaProvider>`.
 *
 * Each `client()` thunk is a dynamic import, and the provider renders `null`
 * until it resolves. Called from a test body, that transform lands inside the
 * `findBy*` budget and a loaded runner blows it. Call this from `beforeAll`
 * instead: the hook awaits the import, and each boot then hits the cache.
 */
export const warmPluginClients = async (
  plugins: PluginManifest[]
): Promise<void> => {
  await resolveClientSegments(plugins);
};
