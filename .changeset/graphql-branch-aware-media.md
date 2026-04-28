---
"@tinacms/graphql": minor
---

Add optional `branch` and `mediaBranch` fields to `GraphQLConfig`. When the host passes a `branch` that differs from `mediaBranch`, image field resolution prefixes the CDN path with `/__staging/{encodedBranch}/`, and `resolveMediaCloudToRelative` strips that segment back to the relative path on the write side. Self-hosted (`useRelativeMedia: true`) and main-branch behaviour are unchanged.
