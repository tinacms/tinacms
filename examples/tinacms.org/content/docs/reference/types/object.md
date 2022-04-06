---
title: The "object" field
last_edited: '2021-07-27T15:51:56.737Z'
---

# `object`

```ts
type ObjectField = {
  label: string
  name: string
  type: 'object'
  /** `fields OR `templates` may be provided, not both **/
  fields?: Field[]
  templates?: Template[]
  /** See docs/reference/toolkit/fields for customizing the UI **/
  ui?: object
}
```

<iframe width="100%" height="700px" src="https://tina-gql-playground.vercel.app/iframe/object" />

### As a `list`

> Note: you can set `defaultItem` to auto-populate new items as they're added

<iframe width="100%" height="700px" src="https://tina-gql-playground.vercel.app/iframe/object-list-data" />

### With multiple `templates`

If you always want your object to have the same fields, use the `fields` property. But if an object can be one of any different shape, define them as `templates`.

<iframe width="100%" height="700px" src="https://tina-gql-playground.vercel.app/iframe/object-list-templates" />
