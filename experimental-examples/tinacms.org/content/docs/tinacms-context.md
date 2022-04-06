---
title: Contextual Editing
id: '/docs/tinacms-context'
next: '/docs/graphql/overview'
---

## Introduction

Out of the box, once you define a new collection in Tina, its content becomes available through the "basic editor".

![basic editor](https://res.cloudinary.com/forestry-demo/image/upload/v1647455231/tina-io/docs/basic-editor.png)

Tina also allows for "Contextual Editing" so that editors can see their pages being updated in real-time as they make changes

![contextual editor](https://res.cloudinary.com/forestry-demo/image/upload/v1647455231/tina-io/docs/contextual-editing.png)

> Note: Before a page can be setup with contextual editing, it first needs to be using [Tina's data-fetching](/docs/features/data-fetching/).

## Adding contextual-editing to a page

Contextual editing can be set up on a page with the `useTina` hook

```jsx
// ...
import { useTina } from 'tinacms/dist/edit-state'

const query = `{
  getPageDocument(relativePath: "home.mdx"){
    data{
      body
    }
  }
}`

export default function Home(props) {
  // Pass our data through the "useTina" hook to make it editable
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

// Note how our page body uses "data", and not the original "props.data".
// This ensures that the content will be updated in edit-mode as the user types
  return <h1>{data.getPageDocument.data.body}</h1>
}

export const getStaticProps = async () => {
  const data = await staticRequest({
      query,
      variables = {},
    })

  // return the original data, which is used in our production page
  return { props: { data } }
}
```

![usetina-hello-world](https://res.cloudinary.com/forestry-demo/image/upload/q_32/v1643294947/tina-io/hello-world.png)

### The `useTina` hook:

`useTina` is used to make a piece of Tina content contextually editable. It is code-split, so that in production, this hook will simply pass through its data value. In edit-mode, it registers an editable form in the sidebar, and contextually updates its value as the user types.

`useTina` takes in a parameter with a few keys:

- `query` and `variables`: These are the same values that you would use for the [backend data-fetching](/docs/features/data-fetching/).
- `data`: This is the production value that gets passed through to the response unchanged in production.

## Accessing contextual-editing from the CMS

At this point, when your editors go to `/your-page-url` in edit-mode, they will be able to edit and see those changes reflected in real-time. Next, let's wire up the CMS so that users will be navigated to that same editing experience when clicking any document in the Document List (instead of seeing the basic editor).

To accomplish this, we will make use of the `RouteMappingPlugin`.

### The `RouteMappingPlugin`

The `RouteMappingPlugin` is used by the CMS's Document List to navigate to a document's contextual editor rather than the basic editor.

```ts
RouteMappingPlugin(mapper: (collection: Collection, document: Document) => string | undefined)
```

The `RouteMappingPlugin` accepts a single argument - the `mapper` function - that is run when a document is clicked within a Document List:

- If the `mapper` returns a `string`, the `string` is used as the document's route rather than the default.
- If the `mapper` returns `undefined`, the user is navigated to the document's basic editor.

This is an example of the `RouteMappingPlugin` added to our `tina-cloud-starter` template:

```tsx
...

cmsCallback={(cms) => {
  /**
   * 1. Import `tinacms` and `RouteMappingPlugin`
   **/
  import('tinacms').then(({ RouteMappingPlugin }) => {

    /**
    * 2. Define the `RouteMappingPlugin`
    **/
    const RouteMapping = new RouteMappingPlugin(
      (collection, document) => {
        /**
        * Because the `authors` and `global` collections do not
        * have dedicated pages, we return `undefined`.
        **/
        if (["authors", "global"].includes(collection.name)) {
          return undefined;
        }

        /**
        * While the `pages` collection does have dedicated pages,
        * their URLs are different than their document names.
        **/
        if (["pages"].includes(collection.name)) {
          if (document.sys.filename === "home") {
            return `/`;
          }
          if (document.sys.filename === "about") {
            return `/about`;
          }
          return undefined;
        }
        /**
        * Finally, any other collections (`posts`, for example)
        * have URLs based on values in the `collection` and `document`.
        **/
        return `/${collection.name}/${document.sys.filename}`;
      }
    );

    /**
    * 3. Add the `RouteMappingPlugin` to the `cms`.
    **/
    cms.plugins.add(RouteMapping);
  });
}
```

## Summary

- A piece of content can be made editable by running it through the `useTina` hook. In production, it returns the original data unchanged. In edit-mode, it returns the live data, which is updated as the user types in the sidebar.
- Make use of the `RouteMappingPlugin` to automatically navigate to the contextual-editing experience from the CMS.
