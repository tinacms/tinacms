# react-tinacms-editor

This package provides a WYSIWYM Editor for HTML and Markdown. 

## Install

```
yarn add react-tinacms-editor
```

## Field Plugins

This package provides two field plugins for TinaCMS: `MarkdownFieldPlugin` and `HtmlFieldPlugin`.

### Registering the new Field Plugins
in your _app.{js,tsx}
```js
<TinaCMS
    apiURL={...}
    
    cmsCallback={(cms) => {
      import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
        cms.plugins.add(MarkdownFieldPlugin);
      });
      // or
      import("react-tinacms-editor").then(({ HtmlFieldPlugin }) => {
        cms.plugins.add(HtmlFieldPlugin);
      });
      //...
    }}
   //... 
```

### Using in a form
And then in your `schema.ts` file you can use these in the [ui.component](https://tina.io/docs/advanced/configuring-field-plugin/#configuring-a-field-plugin) portion of a field

```ts
{
  type: 'string',
  label: 'mainContent',
  name: 'body',
  // isBody is used to tell the backend to write this to the body of the markdown or MDX file.
  isBody: true
  ui: {
    component: "markdown",
  }
},
```


Or for the html plugin

```ts
{
  type: 'string',
  label: 'mainContent',
  name: 'body',
  // isBody is used to tell the backend to write this to the body of the markdown or MDX file.
  isBody: true
  ui: {
    component: "html",
  }
},

