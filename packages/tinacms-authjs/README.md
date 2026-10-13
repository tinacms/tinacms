# TinaCMS Next Auth

This library provides integration with NextAuth.js and TinaCMS including a NextAuth Credentials Provider for Vercel KV store.

## Production use

The built-in username and password login, with users stored in the Tina user collection, is a starting point for trying TinaCMS. It is not production grade. Before you go to production, connect a dedicated auth provider, such as Auth.js with an OAuth provider, Clerk, or TinaCloud.

## Managing users

Only users listed in `authCollection.admins` can add, edit, or remove users from the admin. Every user can change their own password.

```ts
createDatabase({
  // ...
  authCollection: { admins: ['your-username'] },
})
```
