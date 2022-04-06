---
title: Active Field Indicator (Experimental)
last_edited: '2021-11-06T18:00:00.000Z'
---

{{ WarningCallout text="This is an experimental feature, and the API is subject to change. We don't yet suggest using this for production use-cases. Have any thoughts? Let us know in the chat, or through the [GitHub discussion](https://github.com/tinacms/tinacms/discussions/2250)!" }}

## Try it out

To enable Active field indication you will need to add the `data-tinafield` to your client code that is powered by Tina. The `data-tinafield` will need to match the field name you provided in your schema. Below is an example:

### Schema Code

```typescript
export default defineSchema({
  collections: [
    {
      label: "Blog Posts",
      name: "posts",
      path: "content/posts",
      format: "mdx",
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "rich-text",
          label: "Body",
          name: "_body",
          templates: []
        }
      ]
    }
  ]
```
### Client Code
```javascript,copy
<h2 data-tinafield="title">
    {props.data.getPostDocument.data.title}
</h2>
```
![Active Field Indicator](https://res.cloudinary.com/forestry-demo/image/upload/v1639489428/tina-io/Active%20Field%20Indicator.gif)
