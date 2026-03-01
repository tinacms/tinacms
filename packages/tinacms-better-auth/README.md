# TinaCMS Better Auth

Integration between [Better Auth](https://better-auth.com/docs) and TinaCMS for self-hosted backends. Provides a frontend auth provider and a backend auth provider for the Tina API route.

## Installation

```bash
pnpm add tinacms-better-auth better-auth
```

## Setup

Configure Better Auth in your app (see [Better Auth docs](https://better-auth.com/docs)), then wire the providers:

```ts
// Tina config
authProvider: new BetterAuthProvider({ authClient })

// API route (e.g. pages/api/tina/[...routes].ts)
TinaNodeBackend({
  authProvider: BetterAuthBackendAuthProvider({ auth }),
  databaseClient,
})
```

See [TinaCMS: Bring your own auth](https://tina.io/docs/reference/self-hosted/auth-provider/bring-your-own) for the full interface.
