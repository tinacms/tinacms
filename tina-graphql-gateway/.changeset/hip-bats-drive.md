---
'tina-graphql-gateway-cli': patch
'tina-graphql': patch
---

- Improve types for ui field
- Marks system fields as required so the user has a guarantee that they'll be there
- Return null for listable fields which are null or undefined
- Handle null values for reference fields better
