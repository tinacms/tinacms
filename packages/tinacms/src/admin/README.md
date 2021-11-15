# TinaCMS

## Introducing `TinaAdmin`

`TinaAdmin` seeks to bridge the gap between Tina's elegant page editing experience with a more traditional content management experience.

Right now, the first phase adds a more "complete" Document Creator utilizing your `schema.ts` (inside the `.tina` folder) to build an interface for **listing** and **updating** existing documents and **creating** new documents.

## How to Setup

### From a fresh `tina-cloud-starter`...

> Make sure you use the latest version of `tinacms` and `@tinacms/cli`!

1. Remove or rename `pages/admin/[[...slug]].tsx`
  * `TinaAdmin` serves as a replacement for this file, offering the same ability to handle enabling and disabled `TinaCMS` while also providing additional UI.

2. Add `pages/admin/[[...tina]].tsx`
  * `TinaAdmin` leverages a wildcard, catch-all route (`/admin/*`) for all of its routing.  All you need to do is add two lines to this file:
  ```tsx
  /**
   * pages/admin/[[...tina]].tsx
   **/
  import { TinaAdmin } from "tinacms";
  export default TinaAdmin;
  ```

3. Run `yarn dev`

4. Visit `http://localhost:3000/admin` 👍

### From an existing TinaCMS-powered site

> Make sure you use the latest version of `tinacms` and `@tinacms/cli`!

1. Make sure `/admin` is open and available.
  * For existing sites, we need to ensure there are no routes currently using or conflicting with `/admin`.  In the future, we'd like to make `TinaAdmin`'s base route configurable, but for now, remove or rename any files under `/pages/admin`.

2. Add `pages/admin/[[...tina]].tsx`
  * `TinaAdmin` leverages a wildcard, catch-all route (`/admin/*`) for all of its routing.  All you need to do is add two lines to this file:
  ```tsx
  /**
   * pages/admin/[[...tina]].tsx
   **/
  import { TinaAdmin } from "tinacms";
  export default TinaAdmin;
  ``` 

3. Run `yarn dev`

4. Visit `http://localhost:3000/admin` 👍

## Want More?

### Create a `RouteMappingPlugin`

Introduced with `TinaAdmin`, a `RouteMappingPlugin` tells `TinaAdmin` what an individual document's URL is.  This plugin enables `TinaAdmin` to display "View" links when visiting a list of documents.

```ts
RouteMappingPlugin(mapper: (collection: Collection, document: Document) => string | undefined)
```

A new `RouteMappingPlugin` accepts a single argument - the `mapper` function - that is run against each `document` and `collection` that `TinaAdmin` displays.  

* If `mapper` returns a `string`, it displays a "View" link beside the document.
* If `mapper` returns `undefined` (or `null` or `''`), no "View" link is displayed.

Below is an example of how a `RouteMappingPlugin` might be added to our `tina-cloud-starter`:

```tsx
import { RouteMappingPlugin } from "tinacms";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        ...
        editMode={
          <TinaCMS
            ...
            cmsCallback={(cms) => {
              /**
               * 1. Define the `RouteMappingPlugin`
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
               * 2. Add the `RouteMappingPlugin` to the `cms`.
               **/
              cms.plugins.add(RouteMapping);
            }}
            ...
          >
            ...
          </TinaCMS>
        }
      >
        ...
      </TinaEditProvider>
    </>
  );
};
```

### Enable the `tina-admin` flag

We are hard at work implementing ways for `TinaAdmin` and the `TinaCMS` Sidebar Experience to work together.  Right now, we've hidden those changes behind a `flag` to prevent unwanted side effects in the Sidebar Experience.

However, if you'd like to see those features firsthand, you can enable the `tina-admin` flag within the `cmsCallback` inside your `_app.tsx`:

```tsx
/**
 * Inside _app.tsx
 **/
const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        ...
        editMode={
          <TinaCMS
            ...
            cmsCallback={(cms) => {
+             cms.flags.set("tina-admin", true);
            }}
            ...
          >
            ...
          </TinaCMS>
        }
      >
        ...
      </TinaEditProvider>
    </>
  );
};
```

With this `flag` enabled, you'll see links to `TinaAdmin` within the `TinaCMS` Sidebar when visiting a document, choosing a `reference` value, or viewing the `Global` menu.

## Important Details

* `TinaAdmin` only works with `TinaCMS`-enabled sites that are utilizing our GraphQL backend (that is, sites with a `schema.ts` in the `.tina` folder).
* `TinaAdmin` is still very much experimental and we have grand plans for ways to expand on its functionality.
* If you encounter an issue getting it working, please let us know!
  * Contact us via https://tina.io/community/ for feedback, questions, or bugs!
