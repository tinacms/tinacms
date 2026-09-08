---
'@tinacms/web-components': patch
---

The `tina-markdown` element now runs link and image URLs through the same `sanitizeUrl` guard the React and Astro renderers use, so a URL whose scheme is not on the allow list renders empty rather than being written to `href` or `src`.
