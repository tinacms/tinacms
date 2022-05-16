# @tinacms/schema-tools

## 0.0.4

### Patch Changes

- 6e2ed31a2: Added `isTitle` property to the schema that allows the title to be displayed in the CMS

## 0.0.3

### Patch Changes

- 921709a7e: Adds validation to the schema instead of only using typescript types

## 0.0.2

### Patch Changes

- abf25c673: The schema can now to used on the frontend (optional for now but will be the main path moving forward).

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

- 801f39f62: Update types
- e8b0de1f7: Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
