# Change Log

## 0.51.6

### Patch Changes

- 138ceb8c4: Clean up dependencies
- ccf6a7098: added path to Typescript typings, so that they are included in generated NPM package
- befeb29ea: moved `react` and `react-dom` to peer dependencies to avoid conflict with newer React versions (e.g. 17)
- Updated dependencies [138ceb8c4]
- Updated dependencies [0417e3750]
- Updated dependencies [d9f37ea7e]
  - @tinacms/toolkit@0.55.3

## 0.51.5

### Patch Changes

- f267b2807: Fix package dependency on styled-components which would result in multiple contexts

## 0.51.4

### Patch Changes

- Updated dependencies [2724c48c0]
  - @tinacms/toolkit@0.55.2

## 0.51.3

### Patch Changes

- Updated dependencies [9c0d48e09]
  - @tinacms/toolkit@0.55.1

## 0.51.2

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14
- Updated dependencies [b99baebf1]
  - @tinacms/toolkit@0.55.0

## 0.51.1

### Patch Changes

- Updated dependencies [b961c7417]
  - @tinacms/toolkit@0.54.1

## 0.51.0

### Minor Changes

- 3911fd6e8: Fixes a bug, that npm package is missing `dist` folder and is not working, because of changed build path.

### Patch Changes

- Updated dependencies [9213d5608]
- Updated dependencies [b59f23295]
- Updated dependencies [a419056b6]
- Updated dependencies [ded8dfbee]
- Updated dependencies [5df9fe543]
- Updated dependencies [9d68b058f]
- Updated dependencies [91cebe5bc]
  - @tinacms/toolkit@0.54.0

## 0.50.7

### Patch Changes

- Updated dependencies [7b149a4e7]
- Updated dependencies [906d72c50]
  - @tinacms/toolkit@0.53.0

## 0.50.6

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.
- Updated dependencies [9b27192fe]
  - @tinacms/toolkit@0.52.3

## 0.50.5

### Patch Changes

- Updated dependencies [6b1cbf916]
  - @tinacms/toolkit@0.52.2

## 0.50.4

### Patch Changes

- Updated dependencies [4de977f63]
  - @tinacms/toolkit@0.52.1

## 0.50.3

### Patch Changes

- Updated dependencies [b4f5e973f]
  - @tinacms/toolkit@0.52.0

## 0.50.2

### Patch Changes

- Updated dependencies [634524925]
  - @tinacms/toolkit@0.51.0

## 0.50.1

### Patch Changes

- Updated dependencies [e074d555]
  - @tinacms/toolkit@0.50.1

## 0.50.0

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

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

**Note:** Version bump only for package react-tinacms-strapi

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- **react-tinacms-strapi:** Migrate StrapiMediaStore to cursor-based pagination ([646151f](https://github.com/tinacms/tinacms/commit/646151f73d65a8b862827a1e2eb241ff8df856a6))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package react-tinacms-strapi

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package react-tinacms-strapi

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package react-tinacms-strapi

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

**Note:** Version bump only for package react-tinacms-strapi

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

**Note:** Version bump only for package react-tinacms-strapi

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

**Note:** Version bump only for package react-tinacms-strapi

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

**Note:** Version bump only for package react-tinacms-strapi

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

**Note:** Version bump only for package react-tinacms-strapi

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

**Note:** Version bump only for package react-tinacms-strapi

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Bug Fixes

- **@tinacms/media:** deprecated since these interfaces were graduated to core ([39f1a72](https://github.com/tinacms/tinacms/commit/39f1a729a112fbab24af4c1e319cdc94867325aa))

### Features

- **react-tinacms-strapi:** the StrapiMediaStore implements MediaStore#delete ([157d1fc](https://github.com/tinacms/tinacms/commit/157d1fcc7f86e5a1064875d68cad743cb4c1a08d))
- **react-tinacms-strapi:** the StrapiMediaStore now implements MediaStore#list ([d851296](https://github.com/tinacms/tinacms/commit/d851296fb899e87394c358bba20c436a74e5c238))

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package react-tinacms-strapi

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

### Features

- **react-tinacms-strapi:** StrapiMediaStore implements previewSrc ([fe5df7d](https://github.com/tinacms/tinacms/commit/fe5df7d804d2c0d1b8f21283dd56ab7132d1414d))

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

**Note:** Version bump only for package react-tinacms-strapi

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package react-tinacms-strapi

# [0.25.0](https://github.com/tinacms/tinacms/compare/v0.24.0...v0.25.0) (2020-07-27)

**Note:** Version bump only for package react-tinacms-strapi

## [0.24.1-alpha.0](https://github.com/tinacms/tinacms/compare/v0.24.0...v0.24.1-alpha.0) (2020-07-22)

**Note:** Version bump only for package react-tinacms-strapi
