---
'@tinacms/mdx': patch
'tinacms': patch
---

Add support for basic markdown tables.

### Usage

```ts
// tina/config.ts
import `tinaTableTemplate` from `tinacms`

// add it to the rich-text template
  {
    type: 'rich-text',
    label: 'Body',
    name: '_body',
    templates: [
      tinaTableTemplate
    ///
```

Customize the `th` and `td` fields in the `<TinaMarkdown>` component:

```tsx
<TinaMarkdown content={props.body} components={{
  th: (props) => <th className="bg-gray-100 font-bold" {...props} />,
  td: (props) => <td className="bg-gray-100" {...props} />,
}} />
```

To control the rendering for `
