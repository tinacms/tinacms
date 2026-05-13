---
"@tinacms/schema-tools": minor
"@tinacms/cli": minor
---

Add `build.externalDependencies` to `defineConfig` for extending the package-externalize list when bundling `tina/database.ts`.

Tina automatically externalizes a known-good baseline (currently `better-sqlite3`) so native CJS modules don't crash the ESM build. Users with custom native adapters outside the baseline can now extend this list from their config:

```ts
// tina/config.ts
export default defineConfig({
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    externalDependencies: ['my-custom-native-adapter'],
  },
  // ...
});
```

Externalized packages must be installed in your project's `node_modules` so Node can resolve them at runtime.
