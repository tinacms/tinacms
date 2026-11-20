---
'@tinacms/tinacms': patch
---

Custom validators now run on the Backend, so a collection that lists one saves through the site's server route. This changes four things:

- A validator plugin needs a server segment. Without one, the whole RPC handler fails to compose.
- A collection with a custom validator needs the site's server route.
- Such a collection cannot create documents through a Backend whose content provider has no server `create` op, such as `tinaCloud()`.
- `mountHandler` needs `schema` once a custom validator is installed.
