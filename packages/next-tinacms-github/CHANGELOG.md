# Change Log

## 1.1.22

### Patch Changes

- 138ceb8c4: Clean up dependencies
- Updated dependencies [138ceb8c4]
  - react-tinacms-github@0.51.5

## 1.1.21

### Patch Changes

- react-tinacms-github@0.51.4

## 1.1.20

### Patch Changes

- react-tinacms-github@0.51.4

## 1.1.19

### Patch Changes

- react-tinacms-github@0.51.3

## 1.1.18

### Patch Changes

- react-tinacms-github@0.51.3

## 1.1.17

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14
- Updated dependencies [b99baebf1]
  - react-tinacms-github@0.51.2

## 1.1.16

### Patch Changes

- react-tinacms-github@0.51.1

## 1.1.15

### Patch Changes

- react-tinacms-github@0.51.0

## 1.1.14

### Patch Changes

- react-tinacms-github@0.51.0

## 1.1.13

### Patch Changes

- Updated dependencies [b59f23295]
  - react-tinacms-github@0.51.0

## 1.1.12

### Patch Changes

- react-tinacms-github@0.50.8

## 1.1.11

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.
- Updated dependencies [9b27192fe]
  - react-tinacms-github@0.50.7

## 1.1.10

### Patch Changes

- react-tinacms-github@0.50.6

## 1.1.9

### Patch Changes

- react-tinacms-github@0.50.6

## 1.1.8

### Patch Changes

- react-tinacms-github@0.50.5

## 1.1.7

### Patch Changes

- react-tinacms-github@0.50.4

## 1.1.6

### Patch Changes

- react-tinacms-github@0.50.4

## 1.1.5

### Patch Changes

- react-tinacms-github@0.50.3

## 1.1.4

### Patch Changes

- react-tinacms-github@0.50.2

## 1.1.3

### Patch Changes

- react-tinacms-github@0.50.2

## 1.1.2

### Patch Changes

- react-tinacms-github@0.50.2

## 1.1.1

### Patch Changes

- Updated dependencies [840741f0]
  - react-tinacms-github@0.50.1

## 1.1.0

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
- Updated dependencies [d0335573]
- Updated dependencies [7f3c8c1a]
  - tinacms@0.5.0
  - react-tinacms-github@0.44.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.43.1](https://github.com/tinacms/tinacms/compare/v0.43.0...v0.43.1) (2021-07-13)

**Note:** Version bump only for package next-tinacms-github

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

**Note:** Version bump only for package next-tinacms-github

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

**Note:** Version bump only for package next-tinacms-github

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package next-tinacms-github

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package next-tinacms-github

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package next-tinacms-github

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package next-tinacms-github

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

**Note:** Version bump only for package next-tinacms-github

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

**Note:** Version bump only for package next-tinacms-github

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

**Note:** Version bump only for package next-tinacms-github

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

**Note:** Version bump only for package next-tinacms-github

## [0.35.1](https://github.com/tinacms/tinacms/compare/v0.35.0...v0.35.1) (2021-01-19)

**Note:** Version bump only for package next-tinacms-github

# [0.35.0](https://github.com/tinacms/tinacms/compare/v0.34.0...v0.35.0) (2020-12-15)

**Note:** Version bump only for package next-tinacms-github

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

**Note:** Version bump only for package next-tinacms-github

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

**Note:** Version bump only for package next-tinacms-github

## [0.32.1](https://github.com/tinacms/tinacms/compare/v0.32.0...v0.32.1) (2020-10-29)

### Bug Fixes

- **next-tinacms-github:** correct typedef path ([2ac9a52](https://github.com/tinacms/tinacms/commit/2ac9a528659eb7129c40fa9344df1482ceb0c2fc))

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

**Note:** Version bump only for package next-tinacms-github

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Features

- **next-tinacms-github:** Add NextGithubMediaStore ([357dcd8](https://github.com/tinacms/tinacms/commit/357dcd85a12e1687fa03104ada2e4a1ba3bba49b))

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package next-tinacms-github

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

### Bug Fixes

- **next-tinacms-github:** auth handler sends 500 error when missing signing key ([90b5916](https://github.com/tinacms/tinacms/commit/90b591676c8bdc4b688ac7350a679709f0381f21))
- **next-tinacms-github:** preview handler responds with 500 if signing key is missing ([31273f7](https://github.com/tinacms/tinacms/commit/31273f7acaea7687f577f8eb3961283bb1eb7840))
- **next-tinacms-github:** sends 500 with message if signing key is missing ([002ce35](https://github.com/tinacms/tinacms/commit/002ce356523ef9f6e39f8296827acac8924a3acb))

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package next-tinacms-github

# [0.25.0](https://github.com/tinacms/tinacms/compare/v0.24.0...v0.25.0) (2020-07-27)

### Features

- getGithubFile let's you fetch and parse a file without the entire preview props ([17cb428](https://github.com/tinacms/tinacms/commit/17cb42840b080a671d69ca91ee2b85a57fec6db9))

## [0.2.1](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.2.1-alpha.0...next-tinacms-github@0.2.1) (2020-07-07)

### Bug Fixes

- send json message on succesful preview handling ([3b0cbee](https://github.com/tinacms/tinacms/commit/3b0cbee))

## [0.2.1-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.2.0...next-tinacms-github@0.2.1-alpha.0) (2020-07-06)

### Bug Fixes

- adjust readme according to [@jhuggett](https://github.com/jhuggett)'s comments ([91051a5](https://github.com/tinacms/tinacms/commit/91051a5))
- adjust readme to new signature ([4535323](https://github.com/tinacms/tinacms/commit/4535323))

# [0.2.0](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.2.0-alpha.0...next-tinacms-github@0.2.0) (2020-06-23)

**Note:** Version bump only for package next-tinacms-github

# [0.2.0-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.1.1...next-tinacms-github@0.2.0-alpha.0) (2020-06-17)

### Features

- reworked api calls to work with the new auth flow ([a494f8f](https://github.com/tinacms/tinacms/commit/a494f8f))

## [0.1.1](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.1.0...next-tinacms-github@0.1.1) (2020-05-25)

### Bug Fixes

- fixed setting github working branch ([59b8c81](https://github.com/tinacms/tinacms/commit/59b8c81))

# [0.1.0](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.1.0-canary4.1...next-tinacms-github@0.1.0) (2020-04-27)

**Note:** Version bump only for package next-tinacms-github

# [0.1.0-canary4.1](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.1.0-canary4.0...next-tinacms-github@0.1.0-canary4.1) (2020-04-24)

**Note:** Version bump only for package next-tinacms-github

# [0.1.0-canary4.0](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.0.2-canary4.1...next-tinacms-github@0.1.0-canary4.0) (2020-04-20)

### Features

- **github:** Show error message when github fork fails ([7403015](https://github.com/tinacms/tinacms/commit/7403015))

## [0.0.2-canary4.1](https://github.com/tinacms/tinacms/compare/next-tinacms-github@0.0.2-canary4.0...next-tinacms-github@0.0.2-canary4.1) (2020-04-14)

**Note:** Version bump only for package next-tinacms-github

## 0.0.2-canary4.0 (2020-04-07)

**Note:** Version bump only for package next-tinacms-github
