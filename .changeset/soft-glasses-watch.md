---
'@tinacms/schema-tools': patch
'tinacms': patch
---

Add a `beforeSubmit` hook function on a collection.ui. This give users the ability to run a function before the form is submitted. 

If the function returns values those values will be used will be submitted instead of the form values.

If the function returns a falsy value the original form values will be submitted.

### Example



```js
// tina/config.{ts.js}

export default defineConfig({
  schema: {
    collections: [
      {
        ui: {
          // Example of beforeSubmit
          beforeSubmit: async ({ values }) => {
            return {
              ...values,
              lastUpdated: new Date().toISOString(),
            };
          },
          //...
        },
        //...
      },
      //...
    ],
  },
  //...
});
```