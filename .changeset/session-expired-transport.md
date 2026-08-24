---
'tinacms': patch
---

A session that expires mid-edit now returns the user to the login modal too. The content API client dispatches `cms:session-expired` and throws a `SessionExpiredError` when a request comes back 401, so saves, deletes, renames and folder creation hit the same re-login flow as collection and document loads, instead of surfacing a generic "There was a problem saving your document" dialog. The admin's error handlers skip the new error so nothing paints over the login modal.

Also fixes the `registerApi` event bridge this rides on: `api.events` was forwarded to the global bus with an unbound `dispatch`, so the api-to-cms direction documented on `Client.events` ("automatically hooked into global event bus") has never delivered an event. Both directions now forward, with re-entrancy guards so the two `*` bridges cannot loop.
