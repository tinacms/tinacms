---
"@tinacms/mdx": patch
---

Fix `<mark>` highlight serialization to emit `style` as a JSX expression (`style={{ backgroundColor: "..." }}`) so output is valid MDX v2/v3 JSX and unblocks Docusaurus 3.10+ builds.
