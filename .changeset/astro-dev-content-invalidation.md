---
"@tinacms/astro": patch
---

Re-run `getStaticPaths` in dev when Tina writes or deletes a content file, so newly created entries no longer 404 until the dev server is restarted by hand.
