---
'@tinacms/cli': patch
---

`tinacms build` and `tinacms dev` print the same boxed summary in CI as they do locally. Before this change, any environment that set `CI` (GitHub Actions, most other CI providers) got the summary as a raw JSON object instead.
