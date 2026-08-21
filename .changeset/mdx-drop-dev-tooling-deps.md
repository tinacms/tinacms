---
"@tinacms/mdx": patch
---

Stop shipping `typedoc` and `uvu` to consumers. Both were listed as runtime dependencies of `@tinacms/mdx`, so every TinaCMS install downloaded a documentation generator and a test runner it never executed. `typedoc` moves to `devDependencies`, where the script that uses it already expects it. `uvu` was imported only for a single assertion helper on the shortcode parsing paths; that helper is now a local function, so the dependency is gone entirely. Shortcode parsing behaviour is unchanged.
