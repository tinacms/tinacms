# Change Log

## 0.50.3

### Patch Changes

- 138ceb8c4: Clean up dependencies

## 0.50.2

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

## 0.50.1

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

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

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

**Note:** Version bump only for package next-tinacms-json

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- Unifies FormOptions across all useForm(...) variations ([ff3c058](https://github.com/tinacms/tinacms/commit/ff3c058496ab0b0979540e49a1391a506f4a34a3))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package next-tinacms-json

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package next-tinacms-json

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package next-tinacms-json

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package next-tinacms-json

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

**Note:** Version bump only for package next-tinacms-json

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

**Note:** Version bump only for package next-tinacms-json

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

**Note:** Version bump only for package next-tinacms-json

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

**Note:** Version bump only for package next-tinacms-json

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

**Note:** Version bump only for package next-tinacms-json

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

**Note:** Version bump only for package next-tinacms-json

## [0.32.1](https://github.com/tinacms/tinacms/compare/v0.32.0...v0.32.1) (2020-10-29)

### Bug Fixes

- **next-tinacms-github:** fix build artifacts ([771c03f](https://github.com/tinacms/tinacms/commit/771c03faf3d7e498842c943b8c063dc9c3bbee9f))

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

**Note:** Version bump only for package next-tinacms-json

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

**Note:** Version bump only for package next-tinacms-json

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

### Features

- **next-tinacms-json:** remove deprecated apis ([0a03345](https://github.com/tinacms/tinacms/commit/0a033450d6b6a1137b5a1865daf77c1e24032534))

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

**Note:** Version bump only for package next-tinacms-json

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

**Note:** Version bump only for package next-tinacms-json

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

**Note:** Version bump only for package next-tinacms-json

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

### Bug Fixes

- **next-tinacms-json:** useJsonForm#loadInitialValues does not run when cms is disabled ([9fbd8e8](https://github.com/tinacms/tinacms/commit/9fbd8e83d1765a97b747fca441869538137488bb))

## [0.3.24-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.23...next-tinacms-json@0.3.24-alpha.0) (2020-07-15)

**Note:** Version bump only for package next-tinacms-json

## [0.3.23](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.23-alpha.0...next-tinacms-json@0.3.23) (2020-07-07)

**Note:** Version bump only for package next-tinacms-json

## [0.3.23-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.22...next-tinacms-json@0.3.23-alpha.0) (2020-07-04)

**Note:** Version bump only for package next-tinacms-json

## [0.3.22](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.22-alpha.0...next-tinacms-json@0.3.22) (2020-06-29)

**Note:** Version bump only for package next-tinacms-json

## [0.3.22-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.21...next-tinacms-json@0.3.22-alpha.0) (2020-06-24)

**Note:** Version bump only for package next-tinacms-json

## [0.3.21](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.21-alpha.0...next-tinacms-json@0.3.21) (2020-06-23)

**Note:** Version bump only for package next-tinacms-json

## [0.3.21-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.20...next-tinacms-json@0.3.21-alpha.0) (2020-06-17)

**Note:** Version bump only for package next-tinacms-json

## [0.3.20](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.20-alpha.1...next-tinacms-json@0.3.20) (2020-06-15)

**Note:** Version bump only for package next-tinacms-json

## [0.3.20-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.20-alpha.0...next-tinacms-json@0.3.20-alpha.1) (2020-06-12)

**Note:** Version bump only for package next-tinacms-json

## [0.3.20-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.19...next-tinacms-json@0.3.20-alpha.0) (2020-06-08)

**Note:** Version bump only for package next-tinacms-json

## [0.3.19](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.18...next-tinacms-json@0.3.19) (2020-06-08)

**Note:** Version bump only for package next-tinacms-json

## [0.3.18](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.18-alpha.2...next-tinacms-json@0.3.18) (2020-06-01)

**Note:** Version bump only for package next-tinacms-json

## [0.3.18-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.18-alpha.1...next-tinacms-json@0.3.18-alpha.2) (2020-06-01)

**Note:** Version bump only for package next-tinacms-json

## [0.3.18-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.18-alpha.0...next-tinacms-json@0.3.18-alpha.1) (2020-05-29)

**Note:** Version bump only for package next-tinacms-json

## [0.3.18-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.17...next-tinacms-json@0.3.18-alpha.0) (2020-05-28)

**Note:** Version bump only for package next-tinacms-json

## [0.3.17](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.16...next-tinacms-json@0.3.17) (2020-05-25)

**Note:** Version bump only for package next-tinacms-json

## [0.3.16](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.15...next-tinacms-json@0.3.16) (2020-05-19)

**Note:** Version bump only for package next-tinacms-json

## [0.3.15](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.14...next-tinacms-json@0.3.15) (2020-05-12)

**Note:** Version bump only for package next-tinacms-json

## [0.3.14](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.14-alpha.3...next-tinacms-json@0.3.14) (2020-05-11)

**Note:** Version bump only for package next-tinacms-json

## [0.3.14-alpha.3](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.14-alpha.2...next-tinacms-json@0.3.14-alpha.3) (2020-05-08)

**Note:** Version bump only for package next-tinacms-json

## [0.3.14-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.14-alpha.1...next-tinacms-json@0.3.14-alpha.2) (2020-05-08)

**Note:** Version bump only for package next-tinacms-json

## [0.3.14-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.14-alpha.0...next-tinacms-json@0.3.14-alpha.1) (2020-05-08)

**Note:** Version bump only for package next-tinacms-json

## [0.3.14-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.13...next-tinacms-json@0.3.14-alpha.0) (2020-05-06)

**Note:** Version bump only for package next-tinacms-json

## [0.3.13](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.13-alpha.0...next-tinacms-json@0.3.13) (2020-05-04)

**Note:** Version bump only for package next-tinacms-json

## [0.3.13-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12...next-tinacms-json@0.3.13-alpha.0) (2020-04-28)

**Note:** Version bump only for package next-tinacms-json

## [0.3.12](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12-alpha.4...next-tinacms-json@0.3.12) (2020-04-27)

**Note:** Version bump only for package next-tinacms-json

## [0.3.12-alpha.4](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12-alpha.3...next-tinacms-json@0.3.12-alpha.4) (2020-04-24)

**Note:** Version bump only for package next-tinacms-json

## [0.3.12-alpha.3](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12-alpha.2...next-tinacms-json@0.3.12-alpha.3) (2020-04-20)

### Bug Fixes

- deprecate useGlobalJsonForm ([6bf0799](https://github.com/tinacms/tinacms/commit/6bf0799))
- deprecate useLocalJsonForm ([e8ae5e8](https://github.com/tinacms/tinacms/commit/e8ae5e8))
- deprecated InlineJsonForm ([bc4ab95](https://github.com/tinacms/tinacms/commit/bc4ab95))

## [0.3.12-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12-alpha.1...next-tinacms-json@0.3.12-alpha.2) (2020-04-14)

### Bug Fixes

- forms are more flexible with the shape of Fields ([90d8b0c](https://github.com/tinacms/tinacms/commit/90d8b0c))

## [0.3.12-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.12-alpha.0...next-tinacms-json@0.3.12-alpha.1) (2020-04-07)

**Note:** Version bump only for package next-tinacms-json

## [0.3.12-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.11...next-tinacms-json@0.3.12-alpha.0) (2020-04-06)

**Note:** Version bump only for package next-tinacms-json

## [0.3.11](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.10...next-tinacms-json@0.3.11) (2020-04-06)

**Note:** Version bump only for package next-tinacms-json

## [0.3.10](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.9...next-tinacms-json@0.3.10) (2020-04-06)

**Note:** Version bump only for package next-tinacms-json

## [0.3.9](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.8...next-tinacms-json@0.3.9) (2020-03-30)

**Note:** Version bump only for package next-tinacms-json

## [0.3.8](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.7...next-tinacms-json@0.3.8) (2020-03-30)

**Note:** Version bump only for package next-tinacms-json

## [0.3.7](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.6...next-tinacms-json@0.3.7) (2020-03-23)

**Note:** Version bump only for package next-tinacms-json

## [0.3.6](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.5...next-tinacms-json@0.3.6) (2020-03-16)

### Bug Fixes

- useJsonForm generates fields automatically ([e4c9689](https://github.com/tinacms/tinacms/commit/e4c9689))

## [0.3.5](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.5-alpha.1...next-tinacms-json@0.3.5) (2020-03-09)

**Note:** Version bump only for package next-tinacms-json

## [0.3.5-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.5-alpha.0...next-tinacms-json@0.3.5-alpha.1) (2020-03-06)

**Note:** Version bump only for package next-tinacms-json

## [0.3.5-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.4-alpha.0...next-tinacms-json@0.3.5-alpha.0) (2020-03-05)

**Note:** Version bump only for package next-tinacms-json

## [0.3.4](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.4-alpha.0...next-tinacms-json@0.3.4) (2020-03-02)

**Note:** Version bump only for package next-tinacms-json

## [0.3.4-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.3...next-tinacms-json@0.3.4-alpha.0) (2020-02-26)

### Bug Fixes

- **useJsonForm:** update writeToDisk when file is changed ([8e90273](https://github.com/tinacms/tinacms/commit/8e90273)), closes [#790](https://github.com/tinacms/tinacms/issues/790)

## [0.3.3](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.3-alpha.1...next-tinacms-json@0.3.3) (2020-02-24)

**Note:** Version bump only for package next-tinacms-json

## [0.3.3-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.3-alpha.0...next-tinacms-json@0.3.3-alpha.1) (2020-02-21)

**Note:** Version bump only for package next-tinacms-json

## [0.3.3-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.2...next-tinacms-json@0.3.3-alpha.0) (2020-02-20)

**Note:** Version bump only for package next-tinacms-json

## [0.3.2](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.2-alpha.1...next-tinacms-json@0.3.2) (2020-02-18)

**Note:** Version bump only for package next-tinacms-json

## [0.3.2-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.2-alpha.0...next-tinacms-json@0.3.2-alpha.1) (2020-02-16)

**Note:** Version bump only for package next-tinacms-json

## [0.3.2-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.1...next-tinacms-json@0.3.2-alpha.0) (2020-02-14)

**Note:** Version bump only for package next-tinacms-json

## [0.3.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.1-alpha.1...next-tinacms-json@0.3.1) (2020-02-11)

**Note:** Version bump only for package next-tinacms-json

## [0.3.1-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.1-alpha.0...next-tinacms-json@0.3.1-alpha.1) (2020-02-11)

**Note:** Version bump only for package next-tinacms-json

## [0.3.1-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.0...next-tinacms-json@0.3.1-alpha.0) (2020-02-06)

**Note:** Version bump only for package next-tinacms-json

# [0.3.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.3.0-alpha.0...next-tinacms-json@0.3.0) (2020-02-03)

**Note:** Version bump only for package next-tinacms-json

# [0.3.0-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.2.0...next-tinacms-json@0.3.0-alpha.0) (2020-02-03)

### Bug Fixes

- having next tinacms json respect passed down props in getInitialProps ([8a95b83](https://github.com/tinacms/tinacms/commit/8a95b83))
- inlineJsonForm passes all props, not just jsonFile ([3585500](https://github.com/tinacms/tinacms/commit/3585500))

### Features

- jsonForm passes form ([a467f89](https://github.com/tinacms/tinacms/commit/a467f89))

### Reverts

- undo fix as other PR was opened ([c267411](https://github.com/tinacms/tinacms/commit/c267411))

## [0.2.1-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.2.0...next-tinacms-json@0.2.1-alpha.0) (2020-01-29)

**Note:** Version bump only for package next-tinacms-json

# [0.2.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.3-alpha.0...next-tinacms-json@0.2.0) (2020-01-27)

### Bug Fixes

- prettify json output for next ([fbe2acc](https://github.com/tinacms/tinacms/commit/fbe2acc))
- remove duplicate options prop from jsonForm interface ([5b941c3](https://github.com/tinacms/tinacms/commit/5b941c3))

### Features

- adds json-form HOC to next-tinacms-json ([7d13dcb](https://github.com/tinacms/tinacms/commit/7d13dcb))

## [0.1.3-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.2...next-tinacms-json@0.1.3-alpha.0) (2020-01-24)

### Bug Fixes

- **deps:** tinacms, react, and next are peerDeps ([2e3347c](https://github.com/tinacms/tinacms/commit/2e3347c))
- move devDeps to root ([a6c827b](https://github.com/tinacms/tinacms/commit/a6c827b))
- updates InlineJsonForm to call useLocalJsonForm ([e6a454c](https://github.com/tinacms/tinacms/commit/e6a454c))

## [0.1.2](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.2-alpha.1...next-tinacms-json@0.1.2) (2020-01-22)

**Note:** Version bump only for package next-tinacms-json

## [0.1.2-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.2-alpha.0...next-tinacms-json@0.1.2-alpha.1) (2020-01-22)

**Note:** Version bump only for package next-tinacms-json

## [0.1.2-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.1...next-tinacms-json@0.1.2-alpha.0) (2020-01-16)

**Note:** Version bump only for package next-tinacms-json

## [0.1.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.0...next-tinacms-json@0.1.1) (2020-01-14)

**Note:** Version bump only for package next-tinacms-json

# [0.1.0](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.0-alpha.1...next-tinacms-json@0.1.0) (2020-01-13)

### Bug Fixes

- updates writeToDisk to write all formState values ([4064394](https://github.com/tinacms/tinacms/commit/4064394))

# [0.1.0-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-json@0.1.0-alpha.0...next-tinacms-json@0.1.0-alpha.1) (2020-01-10)

### Features

- higher order helpers pass useJsonForm options ([af52610](https://github.com/tinacms/tinacms/commit/af52610))
- json forms can be reset ([5f1f719](https://github.com/tinacms/tinacms/commit/5f1f719))
