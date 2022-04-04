---
'tinacms': minor
---

Updates to the way forms are generated in contextual editing. This lays the groundwork for
future updates but doesn't offer new behavior yet. It does come with a small breaking change:

[BREAKING]: The `id` of forms is now the actual document `path`. Previously this was the name of the GraphQL query node (eg. `getPostDocument`).
If you're using the [`formifyCallback`](https://tina.io/docs/advanced/customizing-forms/#customizing-a-form) prop to create global forms, you'll probably need to update the callback to check for the appropriate id.

Eg. `formConfig.id === 'getSiteNavsDocument'` should be something like `formConfig.id === 'content/navs/mynav.md'`

If you're experiencing any issues with contextual editing, you can disable this flag for now by specifying `cms.flags.set('use-unstable-formify', false)`.
