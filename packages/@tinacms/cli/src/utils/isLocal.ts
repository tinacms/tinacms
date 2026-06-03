/**
 * Resolves whether the editor should run in local mode.
 *
 * `TINA_PUBLIC_IS_LOCAL` is the single source of truth: the same env var that
 * selects the auth provider and database in user config also drives the admin's
 * "local mode" (the local-mode banner, branch switcher, etc.). When it is not
 * set we fall back to the command default — `tinacms dev` is local, `tinacms
 * build` is not. The resolved value is baked into the admin bundle as
 * `__TINA_IS_LOCAL__`.
 *
 * `contentApiUrlOverride` intentionally does NOT participate here — it only
 * controls where the content API is hosted, not whether the editor is local.
 *
 * @param isDevCommand `true` for `tinacms dev`, `false` for `tinacms build`.
 */
export const resolveIsLocal = (isDevCommand: boolean): boolean => {
  const envValue = process.env.TINA_PUBLIC_IS_LOCAL;
  if (envValue !== undefined && envValue !== '') {
    return envValue === 'true';
  }
  return isDevCommand;
};
