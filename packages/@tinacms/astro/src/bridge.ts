/**
 * Re-exports of `@tinacms/bridge` so Astro projects can pull the bridge from
 * `@tinacms/astro/bridge` instead of installing it separately. The bridge
 * package stays publishable on its own for non-Astro frontends (Hugo, plain
 * HTML, Eleventy).
 */
export * from '@tinacms/bridge';
