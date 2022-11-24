---
'@tinacms/app': patch
'@tinacms/schema-tools': patch
'@tinacms/toolkit': patch
'tinacms': patch
---

Added a `onLogin` Callback function that is called when the user logs in.

EX:

```ts
import { defineConfig } from 'tinacms'

export default defineConfig({
  admin: {
    auth: {
      onLogin: () => {
        console.log('On Log in!')
      },
    },
  },
  /// ... 
});
```
