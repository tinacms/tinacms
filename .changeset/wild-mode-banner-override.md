---
"@tinacms/cli": patch
"@tinacms/app": patch
"tinacms": patch
---

Fix the "You are in local mode" banner appearing for self-hosted setups that use an absolute `contentApiUrlOverride`.

Local mode was previously inferred at runtime from the shape of the content API URL, which misclassified any absolute, non-TinaCloud URL (e.g. `https://your-backend.example.com/api/tina/gql`) as local — so self-hosted users had to use a relative override to hide the banner. The CLI now bakes its authoritative build-time flag into the admin (`tinacms dev` => local, `tinacms build` => not local) as `__TINA_IS_LOCAL__`, and the editor uses that instead of guessing from the URL. As a fallback for `<TinaCMS>` rendered outside the CLI-built admin, any configured `contentApiUrlOverride` (relative or absolute) is now treated as a self-hosted, non-local API.
