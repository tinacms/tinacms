---
'@tinacms/mdx': patch
---

Drop the unused `typedoc` dependency

`typedoc` landed in `@tinacms/mdx`'s runtime dependencies by copy-paste and has shipped to every consumer since, dragging an unmet `typescript` peer range with it. Nothing in `src/` imports it and only the `docs` script used it, so both are removed along with the now-orphaned `typedoc-plugin-markdown` and `concat-md` catalog entries.
