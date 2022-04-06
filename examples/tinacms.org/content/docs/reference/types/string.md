---
title: The "string" field
last_edited: '2021-07-27T15:51:56.737Z'
next: /docs/reference/types/number
---

# `string`

```ts
type StringField = {
  label: string
  name: string
  type: 'string'
  list?: boolean
  options?: (string | { value: string; label: string })[]
  /** Represents the "body" of a markdown file **/
  isBody: boolean
  /** See docs/reference/toolkit/fields for customizing the UI **/
  ui?: object
}
```

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string" />

### With `options`

Specifying an `options` array will provide a selection list

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-options" />

### As a `list`

Setting `list: true` will make the value an array

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-list" />

### As a `list` with `options`

Setting `list: true` and providing `options` will make the value an array with a selection list

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-list-options" />

## The `isBody` property

When working with markdown, you can indicate that a given field should repesent the markdown body

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-body" />

## Overriding the component

By default, the `text` field is used for strings. To use a different core field plugin, specify it with the `ui.component` property

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-textarea" />

## Providing a custom component

You can create your own components by adding them to the CMS

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/string-custom" />
