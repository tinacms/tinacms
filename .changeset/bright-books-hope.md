---
'@tinacms/schema-tools': patch
'@tinacms/cli': patch
---

Add a new graphqlQueriesPath customisation option to the config.client when defining a Tina site. In particular this is useful for mono-repos needing to support custom queries within each package/sub-folder as well as shared base queries at the root level.
