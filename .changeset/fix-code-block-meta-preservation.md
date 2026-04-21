---
"@tinacms/mdx": patch
---

Preserve code block infostring meta through parse/serialize round-trip. Metadata after the language identifier (e.g. `{1,3-5}` or `title="app.py"`) was silently dropped on every save; it is now captured in the parser and emitted by the serializer.
