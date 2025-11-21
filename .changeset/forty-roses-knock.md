---
"tinacms": patch
"@tinacms/cli": patch
"@tinacms/datalayer": patch
"@tinacms/graphql": patch
"@tinacms/mdx": patch
---

Remove Lodash and replace usages with either native functions or es-toolkit equivalents
Removed the following lodash usages:
* debounce - was not used, removed the reference
* camelcase - unused, removed the reference
* upperfirst - unused, removed the reference
* flatten - replaced by native .flat()
* get - replaced with an existing implementation from the GraphQL package
* cloneDeep - replaced with cloneDeep from es-toolkit
* set - replaced with es-toolkit compat version. That implementation is identical to the one used by lodash
* uniqBy - replace with es-toolkit version. That implementation is identical to the one used by lodash
