---
'@tinacms/mdx': patch
---

Stop importing the `uvu` test runner from shipped source

`@tinacms/mdx` listed `uvu` as a runtime dependency and imported it in two shortcode parsing files, in both cases only for `ok` as a one-line assertion helper. A local `assert` function replaces those six call sites, so the dependency and its catalog entry are gone. Shortcode parsing behaviour is unchanged.

This does not remove `uvu` from a consumer's `node_modules`. `micromark` and its extensions still depend on it at runtime, and `@tinacms/mdx` depends on those.
