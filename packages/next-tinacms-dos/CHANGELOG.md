# next-tinacms-cloudinary

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

## 1.3.0

### Minor Changes

- 817b10b8a: deliver multiple size thumbnails

## 1.2.0

### Minor Changes

- 4cd5cd4f7: Refactor: Remove previewSrc from imageAPI

### Patch Changes

- 0b7687424: support pdf uploads

## 1.1.2

### Patch Changes

- cfc59fdf4: Add optional mediaRoot configuration to allow specifying a configurable root folder in DO spaces

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

## 0.1.5

### Patch Changes

- 86dae3189: Fix dran'n'drop uploaded image not shown issue

## 0.1.4

### Patch Changes

- be40bfd71: Remove unnecessary media helper deps

## 0.1.3

### Patch Changes

- 2422e505d: Removed styled-components as a dependency in tinacms.
  Removed deprecated react-toolbar in @tinacms/toolkit.

## 0.1.2

### Patch Changes

- 112b7271d: fix vulnerabilities

## 0.1.1

### Patch Changes

- 857f43c28: Tinacms Media store using DigitalOcean space

## 3.5.29

### Patch Changes

- ae23e9ad6: Remove unused deps from monorepo

## 3.5.28

## 3.5.27

## 3.5.26

## 3.5.25

## 3.5.24

## 3.5.23

## 3.5.22

## 3.5.21

## 3.5.20

## 3.5.19

## 3.5.18

## 3.5.17

## 3.5.16

## 3.5.15

## 3.5.14

## 3.5.13

## 3.5.12

## 3.5.11

### Patch Changes

- d6f0cc835: fix: fix broken link in CMS placeholder screen

## 3.5.10

## 3.5.9

## 3.5.8

## 3.5.7

## 3.5.6

### Patch Changes

- cdcd49215: fixed a type error

## 3.5.5

## 3.5.4

## 3.5.3

## 3.5.2

## 3.5.1

## 3.5.0

### Minor Changes

- 4a3990c7e: Cloudinary media store now serves images over `https` by default. This can now be configured though the handler provided.

  To revert to the old behavior:

  ```ts
  export default createMediaHandler(
    {
      // ...
    },
    {
      useHttps: false,
    }
  )
  ```

  The default for `useHttps` is `true`

## 3.4.5

### Patch Changes

- 2a4a23b74: Fixed issue where folders could not have spaces

## 3.4.4

## 3.4.3

## 3.4.2

## 3.4.1

## 3.4.0

### Minor Changes

- e792dd0fd: Added basic Create Tina App

## 3.3.8

## 3.3.7

## 3.3.6

## 3.3.5

### Patch Changes

- 138ceb8c4: Clean up dependencies
- d9f37ea7e: Ensure the full image resolution URL is persisted

## 3.3.4

## 3.3.3

## 3.3.2

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

## 3.3.1

## 3.3.0

### Minor Changes

- 9d68b058f: Add support for multiple image upload in the Media Store.

## 3.2.5

## 3.2.4

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

## 3.2.3

## 3.2.2

## 3.2.1

## 3.2.0

### Minor Changes

- 634524925: filetype acceptance now comes from the media store configuration

### Patch Changes

- c8be48892: Fix drag & drop behavior in ImageFieldPlugin

## 3.1.2

### Patch Changes

- 33382db1a: Fix files in root not showing when using default directory argument

## 3.1.1

## 3.1.0

### Minor Changes

- 7f3c8c1a: # 🔧 Changes coming to TinaCMS ⚙️

  👋 You may have noticed we've been hard at-work lately building out a more opinionated approach to TinaCMS. To that end, we've settled around a few key points we'd like to announce. To see the work in progress, check out the [main](https://github.com/tinacms/tinacms/tree/main) branch, which will become the primary branch soon.

  ## Consolidating @tinacms packages in to @tinacms/toolkit

  By nature, Tina relies heavily on React context, and the dependency mismatches from over-modularizing our toolkit has led to many bugs related to missing context. To fix this, we'll be consolidating nearly every package in the @tinacms scope to a single package called `@tinacms/toolkit`

  We'll also be rolling out esm support as it's now much easier to address build improvements

  ## A more focused tinacms package

  The `tinacms` package now comes baked-in with APIs for working with the TinaCMS GraphQL API. Because `@tinacms/toolkit` now encompasses everything you'd need to build your own CMS integration, we're repurposing the `tinacms` package to more accurately reflect the "batteries-included" approach.

  If you haven't been introduced, the GraphQL API is a Git-backed CMS which we'll be leaning into more in the future. With a generous free tier and direct syncing with Github its something we're really excited to push forward. Sign up for free here
  Note: tinacms still exports the same APIs, but we'll gradually start moving the backend-agnostic tools to @tinacms/toolkit.

  ## Consolidating the tina-graphql-gateway repo

  The tina-graphql-gateway repo will be absorbed into this one. If you've been working with our GraphQL APIs you'll need to follow our migration guide.

  ## Moving from Lerna to Yarn PNP

  We've had success with Yarn 2 and PNP in other monorepos, if you're a contributor you'll notice some updates to the DX, which should hopefully result in a smoother experience.

  ## FAQ

  ### What about other backends?

  The `@tinacms/toolkit` isn't going anywhere. And if you're using packages like `react-tinacms-strapi` or r`eact-tinacms-github` with success, that won't change much, they'll just be powered by `@tinacms/toolkit` under the hood.

  ### Do I need to do anything?

  We'll be bumping all packages to `0.50.0` to reflect the changes. If you're using @tincams scoped packages those won't receive the upgrade. Unscoped packages like `react-tinacms-editor` will be upgraded, and should be bumped to 0.50.0 as well.
  When we move to `1.0.0` we'll be pushing internal APIs to `@tinacms/toolkit`, so that's the long-term location of

  ### Will you continue to patch older versions?

  We'll continue to make security patches, however major bug fixes will likely not see any updates. Keep in mind that `@tinacms/toolkit` will continue to be developed.

### Patch Changes

- d0335573: Upgrade to use @tinacms/toolkit instead of tinacms
- Updated dependencies [434d61d4]
- Updated dependencies [7f3c8c1a]
  - tinacms@0.5.0
  - @tinacms/toolkit@0.44.0

## 2.0.0

### Minor Changes

- 7e8f414e: contextual error messages in media library

### Patch Changes

- Updated dependencies [d42e2bcf]
- Updated dependencies [ab4e388b]
- Updated dependencies [7351d92f]
- Updated dependencies [95244e14]
  - tinacms@0.4.0

## 1.0.0

### Patch Changes

- Updated dependencies [96ee3eb1]
  - tinacms@0.3.0

## 0.1.0

### Patch Changes

- Create package
