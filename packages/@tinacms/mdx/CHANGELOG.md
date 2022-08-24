# @tinacms/mdx

## 0.61.3

### Patch Changes

- 7506a46b9: Fix issue where marks within links would throw an error
- 5fbdd05be: Fix stringification of code element nested in link

## 0.61.2

### Patch Changes

- c6726c65b: Fix regression in handling images in rich-text

## 0.61.1

### Patch Changes

- 3d36a0e42: Add null check in markdownToAst to fix error during new doc creation

## 0.61.0

### Minor Changes

- 7b0dda55e: Updates to the `rich-text` component as well the shape of the `rich-text` field response from the API

  - Adds support for isTitle on MDX elements
  - Fixes issues related to nested marks
  - Uses monaco editor for code blocks
  - Improves styling of nested list items
  - Improves handling of rich-text during reset
  - No longer errors on unrecognized JSX/html, instead falls back to print `No component provided for <compnonent name>`
  - No longer errors on markdown parsing errors, instead falls back to rendering markdown as a string, customizable via the TinaMarkdown component (invalid_markdown prop)
  - Prepares rich-text component for raw mode - where you can edit the raw markdown directly in the Tina form. This will be available in future release.

### Patch Changes

- Updated dependencies [7b0dda55e]
- Updated dependencies [8183b638c]
  - @tinacms/schema-tools@0.1.0
