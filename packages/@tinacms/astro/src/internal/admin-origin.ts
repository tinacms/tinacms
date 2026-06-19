/**
 * Resolve `PUBLIC_TINA_ADMIN_ORIGIN` (comma-separated allowed) from
 * Astro's `import.meta.env`. Returns `null` when unset — the bridge then
 * falls back to `window.location.origin`.
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
