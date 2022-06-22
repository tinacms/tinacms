---
'@tinacms/datalayer': minor
'@tinacms/graphql': minor
---

Updated matching logic to only return the correct extension.

This means if you are using any other files besides `.md` the format must be provided in the schema.

```ts
// .tina/schema.ts

import { defineSchema } from 'tinacms'

const schema = defineSchema({
  collections: [
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      // Need to provide the format if the file being used (default is `.md`)
      format: 'mdx',
      fields: [
        //...
      ]
    }
  ]
});
//...

export default schema
```
