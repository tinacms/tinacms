---
---

Remove Babel from the `@tinacms/cli` Jest setup. `ts-jest` now converts the one ESM-only test dependency, so the CLI drops its `@babel/core`, `@babel/preset-env` and `babel-jest` dev dependencies. No published code changes.
