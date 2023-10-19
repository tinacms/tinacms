# Change Log

## 0.0.18

### Patch Changes

- Updated dependencies [b6fbab887]
- Updated dependencies [4ae43fdde]
- Updated dependencies [aec44a7dc]
  - tinacms@1.5.22

## 0.0.17

### Patch Changes

- Updated dependencies [177002715]
- Updated dependencies [e69a3ef81]
- Updated dependencies [c925786ef]
- Updated dependencies [9f01550dd]
  - tinacms@1.5.21

## 0.0.16

### Patch Changes

- Updated dependencies [7e4de0b2a]
- Updated dependencies [1144af060]
  - tinacms@1.5.20

## 0.0.15

### Patch Changes

- Updated dependencies [1563ce5b2]
- Updated dependencies [e83ba8855]
  - tinacms@1.5.19

## 0.0.14

### Patch Changes

- Updated dependencies [9c27087fb]
- Updated dependencies [65d0a701f]
- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [37cf8bd40]
- Updated dependencies [ad22e0950]
- Updated dependencies [8db979b9f]
- Updated dependencies [7991e097e]
- Updated dependencies [30c7eac58]
- Updated dependencies [121bd9fc4]
  - tinacms@1.5.18

## 0.0.13

### Patch Changes

- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [bc812441b]
  - tinacms@1.5.17

## 0.0.12

### Patch Changes

- Updated dependencies [1889422b0]
  - tinacms@1.5.16

## 0.0.11

### Patch Changes

- tinacms@1.5.15

## 0.0.10

### Patch Changes

- Updated dependencies [f1e8828c8]
- Updated dependencies [304e23318]
  - tinacms@1.5.14

## 0.0.9

### Patch Changes

- Updated dependencies [495108725]
- Updated dependencies [b0eba5d49]
  - tinacms@1.5.13

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
