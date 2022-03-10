## Making changes to the content

### Edit the `.tina/schema.ts`

### Run `yarn zeus .tina/__generated__/schema.gql --ts` to update the Zues client with the new schema. The updated zues config will be viewable at `zeus/index.ts`.

### Update the query at `components/page.tsx` the new changes

## Working with local TinaCMS

Ensure your local TinaCMS repo has run `yarn build`

Drop this into your `package.json`:

```json
"resolutions": {
  "tinacms": "portal:../tinacms/packages/tinacms",
  "next-tinacms-cloudinary": "portal:../tinacms/packages/next-tinacms-cloudinary",
  "@tinacms/cli": "portal:../tinacms/packages/@tinacms/cli",
  "@tinacms/auth": "portal:../tinacms/packages/@tinacms/auth",
  "@tinacms/scripts": "portal:../tinacms/packages/@tinacms/scripts",
  "@tinacms/graphql": "portal:../tinacms/packages/@tinacms/graphql",
  "@tinacms/toolkit": "portal:../tinacms/packages/@tinacms/toolkit"
}
```
