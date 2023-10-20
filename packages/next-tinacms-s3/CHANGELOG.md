# next-tinacms-s3

## 1.3.7

### Patch Changes

- Updated dependencies [b6fbab887]
- Updated dependencies [4ae43fdde]
- Updated dependencies [aec44a7dc]
  - tinacms@1.5.22

## 1.3.6

### Patch Changes

- Updated dependencies [177002715]
- Updated dependencies [e69a3ef81]
- Updated dependencies [c925786ef]
- Updated dependencies [9f01550dd]
  - tinacms@1.5.21

## 1.3.5

### Patch Changes

- Updated dependencies [7e4de0b2a]
- Updated dependencies [1144af060]
  - tinacms@1.5.20

## 1.3.4

### Patch Changes

- Updated dependencies [1563ce5b2]
- Updated dependencies [e83ba8855]
  - tinacms@1.5.19

## 1.3.3

### Patch Changes

- 121bd9fc4: Absorb @tinacms/toolkit into tinacms

  fix: Use clean page-sizes on media manager (to make pagination more obvious)

  Fix issue with uploading media in a folder with tina cloud

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

## 1.3.2

### Patch Changes

- bc812441b: Use .mjs extension for ES modules

## 1.3.1

### Patch Changes

- 63dd98904: - Adds newly added images to the top of the list and selects them
  - Adds a refresh button to the image list
  - Fixes a bug where you could not upload images in a directory (Locally)
  - Adds a new folder button to the media manager
  - Logs error messages from the handlers so the user is aware of them (previously they were just swallowed and returned in the response message but this is harder to find)
- 400a7fdeb: Add the `mediaRoot` option to the s3 media store

## 1.3.0

### Minor Changes

- 817b10b8a: deliver multiple size thumbnails

## 1.2.0

### Minor Changes

- 4cd5cd4f7: Refactor: Remove previewSrc from imageAPI

### Patch Changes

- 0b7687424: support pdf uploads

## 1.1.1

### Patch Changes

- efd56e769: Remove license headers

## 1.1.0

### Minor Changes

- 48c4b3d48: Fix accept key in media stores

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.0.6

### Patch Changes

- 86dae3189: Fix dran'n'drop uploaded image not shown issue

## 0.0.5

### Patch Changes

- be40bfd71: Remove unnecessary media helper deps

## 0.0.4

### Patch Changes

- 2422e505d: Removed styled-components as a dependency in tinacms.
  Removed deprecated react-toolbar in @tinacms/toolkit.

## 0.0.3

### Patch Changes

- 112b7271d: fix vulnerabilities

## 0.0.2

### Patch Changes

- 3591c98e0: Introduce support for S3-backed media
