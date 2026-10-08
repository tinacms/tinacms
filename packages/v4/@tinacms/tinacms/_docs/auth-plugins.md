# Auth plugins

An auth plugin supplies the `auth` capability. `auth` is a singleton
capability: a project installs one plugin that provides `auth`. A second one
throws an error at boot, unless it declares `overrides`. Refer to
[plugins.md](./plugins.md#capabilities). Refer to
[ADR-023](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/023-auth-session-mechanics.md)
for the mechanics and
[ADR-008](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/008-authorization-permissions-roles.md)
for the policy.

Core implements no auth. The plugin supplies two halves: hooks on its server
segment that verify a request, and a slice on its client segment that signs
the editor in. The types live in `core/auth/contract.ts`.

## The server half

The server segment of the auth plugin holds two hooks. The RPC handler claims
them, so they are never routable ops (`rpc/handler.ts`).

| Hook | Role |
|---|---|
| `getSession(request)` | Reads the bearer token from the request, and returns a `Session` (`{ identity, roles }`), or `null`. |
| `rolePermissions(role)?` | Returns the permissions of a role. Without it, the built-in `editor` and `admin` defaults apply. |

The handler refuses every op that is not a `publicOp`: `401` with no session,
`403` when the roles do not grant the permission. With no auth plugin, only a
`publicOp` answers. Import `Session` and `AuthTransportHooks` from
`@tinacms/tinacms/server`.

## The client half

The plugin mounts a slice at `store.auth`. The slice is an `AuthSlice`:

| Member | Role |
|---|---|
| `status` | `'loading'`, `'signed-out'` or `'signed-in'`. |
| `user` | `{ id, name?, email? }` when `status` is `'signed-in'`, else `null`. |
| `getToken()` | Resolves to the current bearer token, or `undefined`. It refreshes a token that is about to expire. |
| `login()` | Runs the sign-in flow of the provider: a redirect, a popup, or a hosted page. |
| `logout()` | Ends the session. |

The slice updates `status` and `user` with `set`, so the admin renders again.

`useAuthSlice()` (`@tinacms/tinacms/react`) gives the slice, or `null` when no
plugin provides `auth`. A slice that lacks a member, or that is
`signed-in` with no `user`, throws `auth-capability-malformed`.

A failure in `login()` or `getToken()` is an `AuthError`. It has a `code`, a
`message` to show the user, and an optional `detail` for logs:

| Code | Meaning |
|---|---|
| `unauthenticated` | No session exists. |
| `expired` | The session expired and did not refresh. |
| `network` | The sign-in service did not answer. |
| `invalid-response` | The sign-in service sent a response that the plugin cannot read. |

## The login flow

1. The admin boots. The slice starts at `loading` while it checks for a
   session, then sets `signed-in` or `signed-out`.
2. At `signed-out`, the admin shows a sign-in screen. Its button calls
   `login()`.
3. `login()` completes, and the slice sets `signed-in` and `user`.
4. The sidebar footer shows the user and a "Sign out" button that calls
   `logout()`.

With no auth plugin, the admin shows no sign-in screen. A local setup works
with no login.

## Token rules

- The token is a bearer token in the `Authorization` header, not a cookie
  (ADR-023 §4).
- Keep the token in memory, in a closure of the slice. Do not put it in slice
  state, because devtools show slice state. Never put it in `localStorage`.
- Keep the token short-lived. `getToken()` refreshes it.
- `useRpcClient({ url })` (`@tinacms/tinacms/react`) creates an RPC client
  that calls `getToken()` before each request and attaches the token. A
  plugin does not attach the token itself.
- Roles and permissions are runtime data of the provider. They are not in
  `defineConfig`.
- A permission check in the client is for the UI only. The server check is
  the security boundary.

## Swap a provider

Core reads only the contract, so a change of provider is a change of plugin.
A plugin that needs a signed-in editor declares `dependsOn: ['auth']`, and any
auth plugin satisfies it.

To replace an auth plugin that another plugin installs, add a second auth
plugin that declares `overrides`:

```ts
defineConfig({
  plugins: [
    teamAuth(),
    { ...acmeAuth(), overrides: [{ capability: 'auth' }] },
  ],
  schema: { collections: [] },
});
```

The overriding plugin mounts `store.auth`. For a plugin that provides more
than one capability, the override replaces `auth` only, and the first plugin
keeps its other capabilities.

## Not supported yet

- Sign-out on a `401`. A request that carried a token and gets `401` throws
  `RpcError`; the slice does not change its status.
- The token on requests of the local content and media plugins. They do not
  use the RPC client.
- An auth slice for `tinaCloud()`.
