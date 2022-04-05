---
title: Tina now supports MDX.
date: '2021-10-26T08:00:00-04:00'
author: James Perkins
last_edited: '2021-10-26T08:00:00-04:00'
---

The team at Tina is dedicated to revolutionizing the CMS space. We were the first to offer contextual editing in real-time which enabled teams to be more productive. Now we are introducing the world’s first UI editor for MDX. This empowers content teams to add components to a page with a single click.

<Youtube embedSrc={"https://www.youtube.com/embed/yYysK7rCNM4"} />

You can see our starter repository on our [GitHub](https://github.com/tinacms/tina-docs-starter) or select `Documentation Starter` when going through our [quickstart](https://app.tina.io/quickstart?utm_source=blog&utm_medium=link&utm_campaign=mdx_announcement) flow.

## Why MDX?

MDX provides the ability to write JSX into Markdown files, which gives developers the ability to create content that is dynamic, interactive, and customizable. The problem with MDX, by nature, is you need to have some technical understanding to be able to both use and create content using MDX. This is where we have empowered non-technical members of your team to leverage reusable components with a single click. This means that content teams can move quickly and developers can focus on other projects.

## How to start using MDX?

We have made the developer experience a breeze, you can check out our [documentation](/docs/mdx/) or check out the steps to start using MDX :

### Update to the latest version Tina

You will need to update `tinacms` and `@tinacms/cli` to the latest versions to use the MDX features.

### Create your components you want your content team to use.

Create a component as you normally would and use props for any part you would like to be editable, below is an example of a callout component:

```javascript
...
export default function Callout({callout}) {
return(
        <CalloutWrapper type={backgroundColor[callout.type]} >
          <CalloutLabel >{label[callout.type] || callout.type}</CalloutLabel>
          <CalloutText textColor={textColor[callout.type] || textColor.default}>{callout?.text}</CalloutText>
        </CalloutWrapper>
)}
```

3. Add the fields for your components to your `schema.ts`

```typescript
...
{
          type: "rich-text",
          label: "Body",
          name: "body",
          templates: [
            {
              name: "Callout",
              label: "Callout",
              fields:[
                {
                  name: "type",
                  label: "Type",
                  type: "string",
                  options: ["default", "warning", "error"],
                },
                {
                  name: "text",
                  label: "Text",
                  type: "string",
                },
              ]
            },
        ],
          isBody: true,
},
...
```

4. Add the components to your Tina powered pages.

```javascript
//imports
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import Callout from '../../blocks/callout-block'

const components = {
  Callout: props => {
    return <Callout callout={props} />
  },
}

// Code removed for simplification
;<TinaMarkdown components={components}>
  {props.data.getDocsDocument.data.body}
</TinaMarkdown>
```

### Ready to get started?

You can see our starter repository on our [GitHub](https://github.com/tinacms/tina-docs-starter) or select `Documentation Starter` when going through our [quickstart](https://app.tina.io/quickstart?utm_source=blog&utm_medium=link&utm_campaign=mdx_announcement) flow.
