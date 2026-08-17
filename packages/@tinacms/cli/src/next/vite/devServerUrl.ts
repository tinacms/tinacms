import type { ConfigManager } from '../config-manager';

const parseDevServerUrl = (configManager: ConfigManager) => {
  const configured = configManager.config?.server?.url;
  if (!configured) {
    return undefined;
  }
  try {
    return new URL(configured);
  } catch {
    throw new Error(
      `Invalid \`server.url\` in your Tina config: "${configured}". It must be an absolute URL including the protocol, for example 'https://my-codespace-4001.app.github.dev'.`
    );
  }
};

/**
 * The origin the *browser* uses to reach the dev server: `server.url` when the
 * admin is served from a non-localhost host, otherwise localhost. Everything
 * browser-facing derives from here so the pieces can't drift. Any path on
 * `server.url` is dropped — use `build.basePath` to serve under a subpath.
 */
export const getDevServerUrl = (
  configManager: ConfigManager,
  port: number | string
) => parseDevServerUrl(configManager)?.origin ?? `http://localhost:${port}`;

/**
 * The API URL handed to the admin SPA. Distinct from the URL codegen bakes into
 * the generated client, which stays on localhost because the user's own server
 * runtime calls it and usually cannot reach the external host.
 */
export const getAdminApiURL = (
  configManager: ConfigManager,
  port: number | string
) =>
  configManager.config?.contentApiUrlOverride ||
  `${getDevServerUrl(configManager, port)}/graphql`;

/**
 * Vite host-checks every request against `allowedHosts` to block DNS rebinding,
 * and its defaults cover only IP literals and localhost. Without the configured
 * host here, `server.url` gets a 403 before it reaches the SPA.
 */
export const getAllowedHosts = (configManager: ConfigManager) => {
  const hostname = parseDevServerUrl(configManager)?.hostname;
  return hostname ? [hostname] : [];
};

/**
 * The admin is served from `server.url`, so its own writes carry that Origin
 * and the state-changing guard in plugins.ts would reject them. Seed the list
 * with it rather than making users repeat it in `allowedOrigins`.
 */
export const getAllowedOrigins = (
  configManager: ConfigManager
): (string | RegExp)[] => {
  const configured = configManager.config?.server?.allowedOrigins ?? [];
  const origin = parseDevServerUrl(configManager)?.origin;
  return origin ? [...configured, origin] : [...configured];
};
