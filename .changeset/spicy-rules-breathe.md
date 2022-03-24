---
'@tinacms/cli': patch
'@tinacms/graphql': patch
'@tinacms/schema-tools': patch
'@tinacms/toolkit': patch
'tinacms': patch
---

The schema can now to used on the frontend (optional for now but will be the main path moving forward).

### How to migrate.

If you gone though the `tinacms init` process there should be a file called `.tina/components/TinaProvider`. In that file you can import the schema from `schema.ts` and add it to the TinaCMS wrapper component.

```tsx
import TinaCMS from 'tinacms'
import schema, { tinaConfig } from '../schema.ts'

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */
const TinaProvider = ({ children }) => {
  return (
    <TinaCMS {...tinaConfig} schema={schema}>
      {children}
    </TinaCMS>
  )
}

export default TinaProvider
```