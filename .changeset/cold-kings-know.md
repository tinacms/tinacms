---
'@tinacms/schema-tools': minor
'@tinacms/datalayer': minor
'@tinacms/graphql': minor
'@tinacms/scripts': minor
'create-tina-app': minor
'next-tinacms-s3': minor
'@tinacms/app': minor
'@tinacms/cli': minor
'@tinacms/mdx': minor
'tinacms': minor
---

Updates Plate Editor to latest version 36.

- Upgrades all remaining packages `Typescript` to version `^5`
- Adds Shadcn/ui styles/colours to our `tinatailwind` config (`packages/@tinacms/cli/src/next/vite/tailwind.ts`)
- Replaces some `lodash` deps with either the specific function i.e. `lodash.set` or implements them in a utility file
- Updates and removes old version of plate (`plate-headless`) for latest version `^36`
- Starts removing and cleaning up some of the old Plate code. 