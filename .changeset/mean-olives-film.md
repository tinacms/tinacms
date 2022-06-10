---
'@tinacms/graphql': patch
---

Resolve Cloud URLs to Relative URLs when saving TinaCloud's media

Introduces a pair of functions (inside `media-utils.ts`) for handling URLs provided by TinaCloud (`resolveMediaCloudToRelative` and `resolveMediaRelativeToCloud`).

These are used in conjuction with two pairs of functions:

* When providing data to the preview: `resolveFieldData` and `parseMDX`
* When saving data to the document: `buildFieldMutations` and `stringifyMDX`

I also introduced tests around `media-utils.ts` (`media-utils.test.ts`).

