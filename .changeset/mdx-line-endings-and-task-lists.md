---
"@tinacms/mdx": patch
---

`parseMDX` now normalizes CRLF to LF before parsing. A carriage return used to survive micromark into the value of a text node, so a document authored on Windows carried `\r` into the editor.

GFM task list items now keep their checked state through a round trip. `parseMDX` reads `checked` onto the `li` node, and both stringifiers write it back. A ticked checkbox previously came back unticked on save. `ListItemElement` gains an optional `checked?: boolean` — set only on task list items.
