---
"@tinacms/mdx": patch
---

Fix `<mark>` highlight serialization so output is valid MDX v2 / v3 JSX, unblocking Docusaurus 3.10+ builds (#6899).

Previously the highlight mark serialized `style` as an HTML attribute string:

```mdx
<mark style="background-color: #BFDBFE">highlighted</mark>
```

MDX v2+ parses any angle-bracketed tag as JSX, and React enforces that the `style` prop is an object, not a string. The string form parsed but threw at render time with `Style prop value must be an object`, which aborted Docusaurus SSR builds.

The serializer now emits `style` as a JSX expression with a camelCased object literal, which is valid JSX and a valid React `style` prop:

```mdx
<mark style={{ backgroundColor: "#BFDBFE" }}>highlighted</mark>
```

The parser accepts both the legacy HTML-string form and the new JSX-expression form, so existing files load without data loss. The on-disk format is rewritten to the new form the next time the file is saved through Tina, which will produce a one-time mechanical diff touching every existing `<mark style="...">` tag in a file.
