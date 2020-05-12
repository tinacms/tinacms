# @tinacms/browser-storage-client

Provides a TinaCMS adapter api for browser storage.

This can be used to cache Form data in the browser
so it's not lost when refreshing the page.

**Adding BrowserStorage to a CMS**

```ts
import { BrowserStorageClient } from "@tinacms/browser-storage-client"

cms.api.storage = new BrowserStorageClient(window.localStorage)
```

**Syncing Form Data to Browser Storage**

```tsx
import { useForm } from "@tinacms/react-core"
import { useFormBrowserCache } from "@tinacms/browser-storage-client"

function MyComponent({ editing }) {
  const [, form] = useForm(...)

  useFormBrowserCache(form, editing)

  return (
    ...
  )
}
```
