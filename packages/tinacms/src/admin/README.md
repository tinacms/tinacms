# TinaCMS

## Introducing `TinaAdmin`

`TinaAdmin` seeks to bridge the gap between Tina's elegant page editing experience with a more traditional content management experience.

Right now, the first phase adds a more "complete" Document Creator utilizing your `schema.ts` (inside the `.tina` folder) to build an interface for **listing** and **updating** existing documents and **creating** new documents.

## How to Setup

### From a fresh `tina-cloud-starter`...

> Make sure you use the latest version of `tinacms` and `@tinacms/cli`!

1. Remove or rename `pages/admin.tsx`
  * `TinaAdmin` serves as a replacement for this file, offering the same ability to handle enabling and disabled `TinaCMS` while also providing additional UI.

2. Add `pages/admin.tsx`
  * `TinaAdmin` leverages a single page route.  All you need to do is add two lines to this file:
  ```tsx
  /**
   * pages/admin.tsx
   **/
  import { TinaAdmin } from "tinacms";
  export default TinaAdmin;
  ```

3. Set the `tina-admin` flag to `true` inside the `cmsCallback` in `pages/_app.tsx`:
  ```tsx
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

4. Run `yarn dev`

5. Visit `http://localhost:3000/admin` 👍

### From an existing TinaCMS-powered site

> Make sure you use the latest version of `tinacms` and `@tinacms/cli`!

1. Make sure `/admin` is open and available.
  * For existing sites, we need to ensure there are no routes currently using or conflicting with `/admin`.  In the future, we'd like to make `TinaAdmin`'s base route configurable, but for now, remove or rename any files under `/pages/admin`.

2. Add `pages/admin.tsx`
  * `TinaAdmin` leverages a single page route.  All you need to do is add two lines to this file:
  ```tsx
  /**
   * pages/admin.tsx
   **/
  import { TinaAdmin } from "tinacms";
  export default TinaAdmin;
  ```

3. Set the `tina-admin` flag to `true` inside the `cmsCallback` in `pages/_app.tsx`:
  ```tsx
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

4. Run `yarn dev`

5. Visit `http://localhost:3000/admin` 👍

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
const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        ...
        editMode={
          <TinaCMS
            ...
            cmsCallback={(cms) => {
              import("tinacms").then(({ RouteMappingPlugin }) => {
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
                      if (document._sys.filename === "home") {
                        return `/`;
                      }
                      if (document._sys.filename === "about") {
                        return `/about`;
                      }
                      return undefined;
                    }
                    /**
                     * Finally, any other collections (`posts`, for example)
                     * have URLs based on values in the `collection` and `document`.
                     **/
                    return `/${collection.name}/${document._sys.filename}`;
                  }
                );

                /**
                 * 2. Add the `RouteMappingPlugin` to the `cms`.
                 **/
                cms.plugins.add(RouteMapping);
              })
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

## Important Details

* `TinaAdmin` only works with `TinaCMS`-enabled sites that are utilizing our GraphQL backend (that is, sites with a `schema.ts` in the `.tina` folder).
* `TinaAdmin` is still very much experimental and we have grand plans for ways to expand on its functionality.
* If you encounter an issue getting it working, please let us know!
  * Contact us via https://tina.io/community/ for feedback, questions, or bugs!
