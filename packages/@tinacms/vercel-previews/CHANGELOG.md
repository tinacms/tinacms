# Change Log

## 0.0.8

### Patch Changes

- tinacms@1.5.12

## 0.0.7

### Patch Changes

- Updated dependencies [c7fa6ddc0]
- Updated dependencies [6e192cc38]
- Updated dependencies [5aaae9902]
  - tinacms@1.5.11

## 0.0.6

### Patch Changes

- tinacms@1.5.10

## 0.0.5

### Patch Changes

- Updated dependencies [c385b5615]
- Updated dependencies [d2ddfa5a6]
- Updated dependencies [9489d5d47]
  - tinacms@1.5.9

## 0.0.4

### Patch Changes

- 66b2a15a3: Update vercel stega function for encoding

## 0.0.3

### Patch Changes

- tinacms@1.5.8

## 0.0.2

### Patch Changes

- Updated dependencies [385c8a865]
- Updated dependencies [ccd928bc3]
  - tinacms@1.5.7

## 0.0.1

### Patch Changes

- 5a6018916: Add support for "quick editing". By adding the `[data-tina-field]` attribute to your elements, editors can click to see the
  correct form and field focused in the sidebar.

  This work closely resembles the ["Active Feild Indicator"](https://tina-io-git-quick-edit-tinacms.vercel.app/docs/editing/active-field-indicator/) feature.
  Which will be phased in out place of this in the future. Note that the attribute name is different, `[data-tinafield]` is the value
  for the "Active Field Indicator" while `[data-tina-field]` is the new attribute.

  The `tinaField` helper function should now only be used with the `[data-tina-field]` attibute.

  Adds experimental support for Vercel previews, the `useVisualEditing` hook from `@tinacms/vercel-previews` can be used
  to activate edit mode and listen for Vercel edit events.

- Updated dependencies [5a6018916]
  - tinacms@1.5.6
