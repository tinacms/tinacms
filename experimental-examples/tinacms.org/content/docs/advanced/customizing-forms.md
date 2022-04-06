---
title: Customizing a form
id: '/docs/advanced/customizing-forms'
next: '/docs/advanced/customizing-ui'
---

With Tina, the editors interact with Tina through forms in the sidebar. These forms are wired up automatically based on the site's schema, and the queries used on each page.

![tinacms editing gif](/gif/tina-nextjs.gif)

## Customizing a form

If you'd like to control the output of those forms, tap into the `formifyCallback` callback parameter in config with the `.tina/schema.ts` file

```diff
// .tina/schema.ts

// ...
export config = defineConfig({
  apiURL,
+ formifyCallback: ({ formConfig, createForm, skip }) => {
+   if (formConfig.id === 'content/navigation/main.json') {
+     const form = new Form(formConfig)
+     // The site nav will be a global plugin
+     cms.plugins.add(new GlobalFormPlugin(form))
+     return form
+   }
+
+   return createForm(formConfig)
+ }
})```
