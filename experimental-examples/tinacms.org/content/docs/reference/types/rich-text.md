---
title: The "rich-text" field
last_edited: '2021-07-27T15:51:56.737Z'
---

# `rich-text`

```ts
type RichTextField = {
  label: string
  name: string
  type: 'rich-text'
  templates: Template[]
  /** See docs/reference/toolkit/fields for customizing the UI **/
  ui?: object
}
```

<iframe width="100%" height="700px" src="https://tina-gql-playground.vercel.app/iframe/rich-text" />

## Experimental update

To enable the experimental version of the rich-text editor, set a feature flag:

```js
cms.flags.set('rich-text-alt', true)
```

For a full list of the changes, checkout the [changelog](https://github.com/tinacms/tinacms/blob/main/packages/%40tinacms/toolkit/CHANGELOG.md#05612)

#### Slash commands

To add an embedded template quickly enter `/`, this will present you with the embedable objects,
filtering them out as you type.

### Give it a try in the playground

<iframe width="100%" height="700px" src="https://tina-gql-playground.vercel.app/iframe/rich-text-experimental" />
