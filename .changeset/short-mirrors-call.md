---
'@tinacms/cli': patch
'@tinacms/graphql': patch
'@tinacms/toolkit': patch
'tinacms': patch
---

Handles Cloud URLs to Relative URLs when saving to document

Introduces a pair of function (resolveMediaRelativeToCloud and resolveMediaCloudToRelative) that takes a URL and GraphQLConfig and returns a modified URL.

These are used in conjuction with two pairs of functions:

    buildFieldMutations and resolveFieldData
    stringifyMDX and parseMDX

I also added tests to use those functions.