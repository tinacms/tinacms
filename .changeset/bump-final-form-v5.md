---
'tinacms': patch
'@tinacms/app': patch
---

Bump the final-form family to the TypeScript releases

`final-form` 4.20.10 → ^5.0.1, `final-form-arrays` ^3.1.0 → ^4.0.1, `react-final-form` ^6.5.9 → ^7.0.1. All three majors are the same event: a coordinated Flow → TypeScript rewrite published on 2025-06-07 and labelled as carrying no API changes. `react-final-form@7` is where React 19 was added to the peer range, which clears the last unmet peer warning on install outside the GraphiQL chain.

They must move together because each peers on the next: `react-final-form@7` requires `final-form@^5`, and `final-form-arrays@3` peers on `final-form@^4`. `final-form-set-field-data` stays put — its peer is `>=1.2.0`.
