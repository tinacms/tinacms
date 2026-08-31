---
'tinacms': patch
---

A session that expires mid-edit now returns the user to the login modal on every path. The content API client dispatches `cms:session-expired` and throws a typed `SessionExpiredError` when a GraphQL request comes back 401, and the REST transport (`fetchWithToken`, used by branch listing, billing, editorial-workflow polling, search indexing and the media store) notifies the same flow when a tokened request 401s, so saves, deletes, renames, folder creation and every panel land on the login modal instead of generic error dialogs, misleading unauthorized panels, or a success toast for a save that never ran. The auth wall suppresses new alerts between expiry and re-login so nothing paints over the login modal, session expiries are no longer recorded as save failures in analytics, a transient identity-API failure no longer reads as a logged-out session (one retry, then it surfaces as an error), and custom content APIs keep a console diagnostic for 401 loops caused by backend misconfiguration.

Also fixes the `registerApi` event bridge this rides on: `api.events` was forwarded to the global bus with an unbound `dispatch`, so the api-to-cms direction documented on `Client.events` has never delivered an event. Both directions now forward, with guards scoped to the in-flight event so nested dispatches still bridge.
