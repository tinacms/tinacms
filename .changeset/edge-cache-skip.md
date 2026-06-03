---
"tinacms": patch
---

Skip the filesystem-backed response cache on edge runtimes (Cloudflare Workers, Vercel Edge) where Node's `fs` API is present but unusable, which could otherwise hang concurrent identical queries. Adds a `cache` option to `createClient` to force-disable the cache.
