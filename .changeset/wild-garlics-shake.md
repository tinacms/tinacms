---
"@tinacms/cli": minor
"@tinacms/schema-tools": minor
---

Add a dev-only `server.url` config option so `tinacms dev` works when the admin is reached over a non-localhost hostname (Codespaces, Gitpod, Docker, a custom local domain).

Previously the injected admin HTML hardcoded `http://localhost:${port}` for Vite's dev endpoints, so opening the admin from any other host left it unable to load its assets.

Setting `server.url` now:

- points the admin's asset URLs and its GraphQL URL at that origin
- adds its hostname to Vite's `allowedHosts`, which otherwise returns a 403 for any non-localhost `Host` header

The URL baked into your generated client stays on `localhost` so your own server-side rendering can still reach it during dev. Default behaviour is unchanged when `server.url` is not set, and nothing here affects production builds.

```ts
server: {
  url: 'https://mycontainer.test',
  allowedOrigins: ['https://my-site.test'],
}
```
