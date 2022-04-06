---
title: The "datetime" field
last_edited: '2021-07-27T15:51:56.737Z'
---

# `datetime`

```ts
type DatetimeField = {
  label: string
  name: string
  type: 'string'
  /** See docs/reference/toolkit/fields for customizing the UI **/
  ui?: {
    dateFormat: string // eg 'YYYY MM DD'
    [key: string]: unknown
  }
}
```

The return value for a datetime is in [ISO string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/datetime" />

## Custom format

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/iframe/datetime-format" />
