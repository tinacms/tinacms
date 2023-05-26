---
'@tinacms/cli': patch
'@tinacms/graphql': patch
---

Catch condition where remote schema does not exist to avoid "Invalid or incomplete introspection error" being thrown during build checks
