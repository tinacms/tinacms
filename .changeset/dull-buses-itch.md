---
'@tinacms/cli': patch
---

Use [esbuild](https://esbuild.github.io/) to build the schema instead of typescript.

This allows the user to
- use non typescript files like JS, JSX, TS
- Import from outside of the tina folder

The downside
- Now type errors will still pass (The schema will compile) and one will get an error at runtime instead of compile time
 