# next-tinacms-cloudinary

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
