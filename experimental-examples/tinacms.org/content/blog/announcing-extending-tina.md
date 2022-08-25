---
title: Announcing the new "Extending Tina"
date: '2022-04-28T03:00:00.000Z'
last_edited: '2022-04-28T03:00:00.000Z'
author: Logan Anderson
prev: content/blog/automating-pull-requests.md
---

The latest update empowers developers to put `validation` ,`component` and `parse` functions directly into the schema.

## Quick Demo

### Validation

Below, if you click the "pencil" icon and edit the "Title" field, the validation function runs and gives an error to the user when it is more than 20 characters.

<Iframe
  height="500"
  iframeSrc="https://tina-gql-playground.vercel.app/?markdownCode=---%0Atitle%3A+Hello%2C+World%0A---&schemaCode=import+%7B+defineSchema+%7D+from+%27tinacms%27%0A%0Aexport+default+defineSchema%28%7B%0A++collections%3A+%5B%7B%0A++++label%3A+%22Post%22%2C%0A++++name%3A+%22post%22%2C%0A++++path%3A+%22posts%22%2C%0A++++fields%3A+%5B%7B%0A++++++label%3A+%22Title%22%2C%0A++++++name%3A+%22title%22%2C%0A++++++type%3A+%22string%22%2C%0A++++++ui%3A+%7B%0A++++++++validate%3A+%28val%29+%3D%3E+%7B%0A++++++++++if+%28val.length+%3E+20%29+%7B%0A++++++++++++return+%27The+title+can+not+be+more+the+20+characters%27%0A++++++++++%7D%0A++++++++%7D%0A++++++%7D%0A++++%7D%5D%0A++%7D%5D%0A%7D%29&reactCode=import+*+as+React+from+%27react%27%0Aimport+%7B+useTina+%7D+from+%27tinacms%2Fdist%2Fedit-state%27%0A%0Aexport+default+function+Page%28props%29+%7B%0A++const+%7Bdata%2C+isLoading%7D+%3D+useTina%28%7B+query%3A+%60query+%7B%0A++post%28relativePath%3A+%22hello-world.md%22%29+%7B%0A++++title%0A++%7D%0A%7D%60%2C%0A++++variables%3A+%7B%7D%2C%0A++++data%3A+props.data%0A++%7D%29%0A%0A++if%28isLoading%29+%7B%0A++++return+%3Cdiv%3ELoading...%3C%2Fdiv%3E%0A++%7D%0A%0A++return+%28%0A++++%3Cdiv+className%3D%22bg-white%22%3E%0A++++++%3Cdiv+className%3D%22max-w-7xl+mx-auto+text-center+py-12+px-4+sm%3Apx-6+lg%3Apy-16+lg%3Apx-8%22%3E%0A++++++++%3Ch2+className%3D%22text-3xl+font-extrabold+tracking-tight+text-gray-900+sm%3Atext-4xl%22%3E%0A++++++++++%3Cspan+className%3D%22block%22%3E%7Bdata.post.title%7D%3C%2Fspan%3E%0A++++++++++%3Cspan+className%3D%22block%22%3EStart+your+free+trial+today.%3C%2Fspan%3E%0A++++++++%3C%2Fh2%3E%0A++++++++%3Cdiv+className%3D%22mt-8+flex+justify-center%22%3E%0A++++++++++%3Cdiv+className%3D%22inline-flex+rounded-md+shadow%22%3E%0A++++++++++++%3Ca%0A++++++++++++++href%3D%22%23%22%0A++++++++++++++className%3D%22inline-flex+items-center+justify-center+px-5+py-3+border+border-transparent+text-base+font-medium+rounded-md+text-white+bg-indigo-600+hover%3Abg-indigo-700%22%0A++++++++++++%3E%0A++++++++++++++Get+started%0A++++++++++++%3C%2Fa%3E%0A++++++++++%3C%2Fdiv%3E%0A++++++++++%3Cdiv+className%3D%22ml-3+inline-flex%22%3E%0A++++++++++++%3Ca%0A++++++++++++++href%3D%22%23%22%0A++++++++++++++className%3D%22inline-flex+items-center+justify-center+px-5+py-3+border+border-transparent+text-base+font-medium+rounded-md+text-indigo-700+bg-indigo-100+hover%3Abg-indigo-200%22%0A++++++++++++%3E%0A++++++++++++++Learn+more%0A++++++++++++%3C%2Fa%3E%0A++++++++++%3C%2Fdiv%3E%0A++++++++%3C%2Fdiv%3E%0A++++++%3C%2Fdiv%3E%0A++++%3C%2Fdiv%3E%0A++%29%0A%7D"
/>

### Custom components

With this update, you can create your custom components easily; see the example below for using a custom component.

<Iframe
  height="500"
  iframeSrc="https://tina-gql-playground.vercel.app/string-component"
/>

## How to update

> Check out [this getting started guide](/docs/setup-overview/) if you want to get started with tina

To update do the following,

### 1.  Update imports in the `.tina/schema.{ts,tsx,js}` file

We will be using the `schema` file on the backend and frontend (previously, it was just the frontend), so all imports from `@tinacms/cli` need to be changed to `tinacms`.

### 2. add `defineConfig`  to the schema

We are now recommending that your config be separate from the wrapper component and placed in the `schema.{ts,tsx,js}` or in its only folder.

So previously, the schema file would look like this. 

```ts
export default defineSchema({
  // schema here
})
``` 

must be changed to

```ts
import { defineSchema, defineConfig } from 'tinacms'
const schema = defineSchema({
  // schema here
})

export const tinaConfig = defineConfig({
  // pass schema and apiUrl to the config (required) (this is how it is passed to the fronend)
  schema: schema,
  apiUrl: apiUrl,
  // add other config that would have previosly been in the _app.{js,tsx} file in the <TinaCMS> component. 
  cmsCallback: (cms) =>{
    //...
  },
  mediaStore: async () => {
    //...
  }

})
export default schema
```

You should add the following two files in the `.tina/components`  folder.

### 3. Add `.tina/components/TinaProvider.js`

This file handles the Tina configuration and the tina provider component, and this will only load when in edit mode, and an [you can find an example of the Tina Provider here](https://github.com/tinacms/tina-cloud-starter/blob/main/.tina/components/TinaProvider.jsx) and below. 

```js   
import TinaCMS from "tinacms";
import { tinaConfig } from "../schema.ts";

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamically imported in edit-mode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */
const TinaProvider = ({ children }) => {
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>;
};

```

### 4. Add `.tina/components/TinaDynamicProvider.js`

The `TinaDynamicProvider.js` handles the loading of the TinaProvider when in "Edit mode." [See this example](https://github.com/tinacms/tina-cloud-starter/blob/main/.tina/components/TinaDynamicProvider.jsx) or the example provided below

```js
import dynamic from "next/dynamic";
const TinaProvider = dynamic(() => import("./TinaProvider"), { ssr: false });
import { TinaEditProvider } from "tinacms/dist/edit-state";

const DynamicTina = ({ children }) => {
  return (
    <>
      <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
        {children}
      </TinaEditProvider>
    </>
  );
};

export default DynamicTina;
```

> [Read more](/docs/tina-folder/overview/#tinadynamicproviderjs) about these two files in our reference docs

### 5. Update your `_app.{js,tsx}`

The last step is to update your `_app.{js,tsx}`. Since the config and the provider are in a separate file, this will be less code than what was there previously.

`_app.{js,tsx}` before:

```js
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
//...

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            cmsCallback={(cms) => {
              //...
            }}
            apiURL={apiURL}
          >
            <Component {...pageProps} />
          </TinaCMS>
        }
      >
        <Component {...pageProps} />
      </TinaEditProvider>
    </>
  );
};
export default App
```

`_app.{js,tsx}` after:

```js
import DynamicTina  from '../.tina/components/TinaDynamicProvider'

const App = ({ Component, pageProps }) => {
  return (
    <DynamicTina>
      <Component {...pageProps} />
    </DynamicTina>
  );
};
export default App
```

This separation of config into another file makes it much cleaner and easier to understand. In addition, the schema now being a part of the config and used on the frontend will allow functions to be passed and used. It will also allow us to make fewer network requests since we have more information.


## Closing words

The new features we talked about in this article only scratch the surface of what is possible; please [read the docs](/docs/extending-tina/overview/) to find out more.

If you are having any issues at all, please [reach out to us on discord](https://discord.com/invite/zumN63Ybpf) or create a [github issue](https://github.com/tinacms/tinacms/issues/new/choose).



