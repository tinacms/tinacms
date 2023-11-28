---
'@tinacms/schema-tools': patch
'tinacms': patch
---

This extends the existing `LoginStrategy` type to include a new `LoginScreen` option. A `getLoginScreen` function can be set on the AuthProvider to display a custom login screen, rather than showing the modal popups and forcing a redirect or displaying the default username and password form. This will hopefully simplify the process of creating custom auth providers and handling user authentication when self-hosting.
