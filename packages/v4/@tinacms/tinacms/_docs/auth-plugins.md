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
| `status` | `'loading'`, `'signed-out'`, `'signed-in'` or `'forbidden'`. |
| `user` | `{ id, name?, email? }` when `status` is `'signed-in'` or `'forbidden'`, else `null`. `id` is a `UserId`; make it with `toUserId()`. |
| `roles` | The roles of the editor, when `status` is `'signed-in'`. They have the same meaning as `Session.roles` on the server. |
| `getToken()` | Resolves to the current bearer token, or `undefined`. It refreshes a token that is about to expire. |
| `login()` | Runs the sign-in flow of the provider: a redirect, a popup, or a hosted page. |
| `logout()` | Ends the session. |
| `LoginScreen?` | A component the admin shows instead of its default sign-in screen, for example an email and password form. It signs the editor in through the plugin, and sets `signed-in`. |

The slice updates `status`, `user` and `roles` with `set`, so the admin
renders again.

`'forbidden'` means that the editor is signed in, but the account cannot edit
the project. The admin does not render. It shows a "You don't have access"
screen with the user and a "Sign out" button.

`useOptionalAuthSlice()` (`@tinacms/tinacms/react`) gives the slice, or `null`
when no plugin provides `auth`. These slices throw
`auth-capability-malformed`:

- A slice that lacks a member.
- A slice that is `signed-in` or `forbidden` with no `user`.
- A slice that is `signed-in` with no `roles` array.
- A slice whose `LoginScreen` is not a component. A function component and a
  `memo` or `forwardRef` component are valid.

A failure in `login()`, `logout()` or `getToken()` is an `AuthError`. It has a `code`, a
`message` to show the user, and an optional `detail` for logs:

| Code | Meaning |
|---|---|
| `unauthenticated` | No session exists. |
| `expired` | The session expired and did not refresh. |
| `network` | The sign-in service did not answer. |
| `invalid-response` | The sign-in service sent a response that the plugin cannot read. |

## The login flow

1. The admin boots. The slice starts at `loading` while it checks for a
   session, then sets `signed-in`, `forbidden` or `signed-out`.
2. At `signed-out`, the admin shows the `LoginScreen` of the slice. Without
   one, it shows a default screen whose button calls `login()`.
3. `login()` completes, and the slice sets `signed-in`, `user` and `roles`.
   If the account cannot edit the project, the slice sets `forbidden` and
   `user`.
4. The sidebar footer shows the user and a "Sign out" button that calls
   `logout()`.

The slice must leave `loading`. If the session check fails, the slice sets
`signed-out`. A slice that stays at `loading` shows the loading screen with
no end, and core does not stop it.

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
- The local content and media plugins attach the token the same way. Each
  request reads `store.auth` and calls `getToken()` at the time it is sent.
- The local Data Layer (`tinaLocalDataLayerVitePlugin`) checks the content
  and media requests with `getSession` of the auth plugin, as the RPC handler
  does. It answers `401` when there is no session. With no auth plugin, or an
  auth plugin with no `getSession`, it checks nothing.
- Roles and permissions are runtime data of the provider. They are not in
  `defineConfig`.
- `roles` on the slice and a permission check in the client are for the UI
  only. They hide controls that the editor cannot use. The server check is
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

- Sign-out on a `401`. A request that carried a token and gets `401` fails,
  and the slice does not change its status.
- An auth slice for `tinaCloud()`.
- `onLogin` and `onLogout` hooks in the config. A plugin does its own work
  inside its `login()` and `logout()`.

## From v3

| v3 | v4 |
|---|---|
| `authProvider.authorize()` | The slice sets `forbidden` when the account cannot edit the project. |
| `admin.authHooks.onLogin` and `onLogout` | No config hooks. The plugin does the work inside `login()` and `logout()`. |
