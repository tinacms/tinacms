---
"@tinacms/astro": patch
---

Make the experimental island route work under the `@astrojs/cloudflare` adapter by supplying a valid `import.meta.url` to server bundles only. Adds a `cloudflareWorkers` option to force the workaround on or off.
