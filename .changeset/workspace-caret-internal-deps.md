---
"@tinacms/app": patch
"@tinacms/astro": patch
"@tinacms/cli": patch
"@tinacms/datalayer": patch
"@tinacms/graphql": patch
"@tinacms/mdx": patch
"@tinacms/search": patch
"@tinacms/vercel-previews": patch
"next-tinacms-azure": patch
"next-tinacms-cloudinary": patch
"next-tinacms-dos": patch
"next-tinacms-s3": patch
"tinacms-authjs": patch
"tinacms-clerk": patch
"tinacms-gitprovider-github": patch
"tinacms": patch
---

Publish internal package references as ranges instead of exact versions.

Internal dependencies were declared as `workspace:*`, which pnpm expands to an **exact version** when publishing (`"tinacms": "3.10.0"`), not a range. An exact pin cannot deduplicate against the version a consumer has already installed, so npm nests a second — and third — complete copy of `tinacms` and its dependency tree. In a stock Astro + TinaCMS blog this produced three copies of `tinacms`, three of `mermaid` (186 MB), five of `date-fns` (151 MB), and four of `typescript` (88 MB): about **320 MB of duplication**.

The same expansion applied to `peerDependencies`, so packages such as `next-tinacms-cloudinary` and `tinacms-authjs` published `"tinacms": "3.10.0"` as a *peer* — requiring consumers to have that exact version or hit an `ERESOLVE` conflict, and forcing a republish of every dependent on each `tinacms` release.

Switching these to `workspace:^` publishes them as caret ranges (`^3.10.0`), which deduplicate normally and let `onlyUpdatePeerDependentsWhenOutOfRange` do its job.
