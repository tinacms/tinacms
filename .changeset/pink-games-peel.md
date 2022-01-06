---
'tinacms': minor
---

Replace `branch`, `clientId`, `isLocalClient` props with single `apiURL`. When working locally, this should be `http://localhost:4001/graphql`. For Tina Cloud, use `https://content.tinajs.io/content/<my-client-id>/github/<my-branch>`

```tsx
// _app.tsx
// ...
<TinaCMS apiURL={process.env.NEXT_PUBLIC_TINA_API_URL} {...pageProps}>
  {(livePageProps) => <Component {...livePageProps} />}
</TinaCMS>
```

DEPRECATION NOTICE: `branch`, `clientId`, `isLocalClient` props will be deprecated in the future
