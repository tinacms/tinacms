---
"@tinacms/graphql": minor
---

Add the `authCollection` option to `createDatabase`. On self-hosted sites with an auth collection, only users listed in `authCollection.admins` can add, edit, or remove users from the admin. Every user can still change their own password. To keep managing users from the admin, add your username: `createDatabase({ ..., authCollection: { admins: ['your-username'] } })`.
