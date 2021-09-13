---
'tinacms': patch
---

Allow tina.io URLs to be supplied as a a prop:

```tsx
<TinaEditProvider
  editMode={
    <TinaCMS
      branch="main"
      clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
      tinaioConfig={{
        baseUrl: "some-base.io"
      }}
      //...
```

Or just the identity/content URLs:

```tsx
<TinaEditProvider
  editMode={
    <TinaCMS
      branch="main"
      clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
      tinaioConfig={{
        identityApiUrl: "https://some-base.io"
        // AND/OR
        contentApiUrl: "https://content.some-base.io"
      }}
      //...
```
