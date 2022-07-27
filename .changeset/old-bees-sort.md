---
'@tinacms/graphql': minor
'@tinacms/mdx': minor
'@tinacms/schema-tools': minor
'@tinacms/scripts': minor
'@tinacms/toolkit': minor
'tinacms': minor
---

Updates to the `rich-text` component as well the shape of the `rich-text` field response from the API

* Adds support for isTitle on MDX elements
* Fixes issues related to nested marks
* Uses monaco editor for code blocks
* Improves styling of nested list items
* Improves handling of rich-text during reset
* No longer errors on unrecognized JSX/html, instead falls back to print `No component provided for <compnonent name>`
* No longer errors on markdown parsing errors, instead falls back to rendering markdown as a string, customizable via the TinaMarkdown component (invalid_markdown prop)
* Prepares rich-text component for raw mode - where you can edit the raw markdown directly in the Tina form. This will be available in future release.
