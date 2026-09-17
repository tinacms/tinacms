---
'@tinacms/schema-tools': patch
---

Image fields with an unknown `accept` value now fail schema validation. The error names the value and lists the accepted extensions and categories, so a typo such as `accept: 'docx'` no longer silently disables the field's file filter.
