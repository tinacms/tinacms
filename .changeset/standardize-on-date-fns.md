---
'tinacms': patch
'@tinacms/graphql': patch
---

Standardize date handling on date-fns and remove the moment stack. `@tinacms/graphql` moves to date-fns v4 (collapsing the previous v2/v4 split), and `tinacms` drops `moment`, `moment-timezone`, and `react-datetime`. The date-field display label now formats with date-fns via a non-breaking moment→date-fns token converter, so existing `dateFormat`/`timeFormat` schemas (moment token syntax) keep working unchanged. Also removes the orphaned vendored react-datetime views. Net effect: the admin bundle no longer ships moment (~18.6 KB gzip smaller first load).
