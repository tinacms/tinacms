---
"@tinacms/mdx": patch
---

Serializer errors that a content editor can hit now say what to change.

The raw markdown editor prints the thrown message verbatim in the field, so these are read by whoever is editing, not only by developers. "Marks inside inline code are not supported" put a Slate term in front of someone who has never met it, and messages naming internal node types did the same.

Reworded: the two mark-combination errors, the block and inline node errors, and the one raised for a field type that cannot be written. Each now names what to remove. Schema and template errors are unchanged, since a developer hits those on first run and needs the exact term.
