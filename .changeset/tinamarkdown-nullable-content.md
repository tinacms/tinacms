---
"tinacms": minor
---

`<TinaMarkdown>` and `<StaticTinaMarkdown>` accept `null` and `undefined` for `content`. Both components already rendered nothing for these values, and the prop types now match. You can pass an optional rich-text field to them without a guard.
