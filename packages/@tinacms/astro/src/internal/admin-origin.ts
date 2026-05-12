/**
 * Resolve `PUBLIC_TINA_ADMIN_ORIGIN` (comma-separated for multi-origin
 * setups: preview + prod) from Vite/Astro's `import.meta.env`. Returns
 * `null` when unset so the bridge falls back to `window.location.origin`
 * — the common same-host case where the admin is mounted at `/admin`.
 *
 * Shared by the middleware (which embeds it in the bootstrap script it
 * splices into edit-mode SSR pages) and `TinaIsland.astro` (which embeds
 * it in the bootstrap it emits for statically-built pages).
 *
 * `import.meta.env` is read through a cast because the package ships no
 * `env.d.ts` — we keep the public type surface free of Vite/Astro
 * client-types coupling.
 */
export function adminOrigins(): string[] | null {
  const env = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;
  const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN;
  if (!raw) return null;
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : null;
}
