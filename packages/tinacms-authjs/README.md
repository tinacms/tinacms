# TinaCMS Next Auth

This library provides integration with NextAuth.js and TinaCMS including a NextAuth Credentials Provider for Vercel KV store.

## Managing users

Only users listed in `authCollection.admins` can add, edit, or remove users from the admin. Every user can change their own password.

```ts
createDatabase({
  // ...
  authCollection: { admins: ['your-username'] },
})
```
