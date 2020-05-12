# @tinacms/browser-storage-client

**Adding BrowserStorage to a CMS**

```ts
cms.api.storage = new BrowserStorage(window.localStorage)
```

**Syncing Form Data to Browser Storage**

```tsx
import { useForm } from "@tinacms/react-core"

function MyComponent({ editing }) {
  const [, form] = useForm(...)

  useLocalStorageCache(form.id, form, editing)

  return (
    ...
  )
}
```
