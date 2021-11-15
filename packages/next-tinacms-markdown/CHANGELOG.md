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

**Note:** Version bump only for package next-tinacms-markdown

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- Unifies FormOptions across all useForm(...) variations ([ff3c058](https://github.com/tinacms/tinacms/commit/ff3c058496ab0b0979540e49a1391a506f4a34a3))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package next-tinacms-markdown

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package next-tinacms-markdown

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package next-tinacms-markdown

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package next-tinacms-markdown

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- **next-tinacms-markdown:** Fixes fileRelativePath for useMarkdownForm ([6ce43fc](https://github.com/tinacms/tinacms/commit/6ce43fc609bb38b67fbeaf192846e3aa4d1e4856))

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

**Note:** Version bump only for package next-tinacms-markdown

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

**Note:** Version bump only for package next-tinacms-markdown

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

**Note:** Version bump only for package next-tinacms-markdown

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

**Note:** Version bump only for package next-tinacms-markdown

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

**Note:** Version bump only for package next-tinacms-markdown

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

**Note:** Version bump only for package next-tinacms-markdown

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

**Note:** Version bump only for package next-tinacms-markdown

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

### Features

- **next-tinacms-markdown:** sunset outdated APIs ([8b6e90a](https://github.com/tinacms/tinacms/commit/8b6e90a0405cc031ec46da39dc5e8e640c36d5c6))

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

**Note:** Version bump only for package next-tinacms-markdown

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

**Note:** Version bump only for package next-tinacms-markdown

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

**Note:** Version bump only for package next-tinacms-markdown

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

### Bug Fixes

- **next-tinacms-markdown:** useMarkdownForm#loadInitialValues does not run when cms is disabled ([3292bf4](https://github.com/tinacms/tinacms/commit/3292bf4bae15ee3c47f474ce46555a1491249d56))

## [0.2.24-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.23...next-tinacms-markdown@0.2.24-alpha.0) (2020-07-15)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.23](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.23-alpha.0...next-tinacms-markdown@0.2.23) (2020-07-07)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.23-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.22...next-tinacms-markdown@0.2.23-alpha.0) (2020-07-04)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.22](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.22-alpha.0...next-tinacms-markdown@0.2.22) (2020-06-29)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.22-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.21...next-tinacms-markdown@0.2.22-alpha.0) (2020-06-24)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.21](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.21-alpha.0...next-tinacms-markdown@0.2.21) (2020-06-23)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.21-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.20...next-tinacms-markdown@0.2.21-alpha.0) (2020-06-17)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.20](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.20-alpha.1...next-tinacms-markdown@0.2.20) (2020-06-15)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.20-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.20-alpha.0...next-tinacms-markdown@0.2.20-alpha.1) (2020-06-12)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.20-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.19...next-tinacms-markdown@0.2.20-alpha.0) (2020-06-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.19](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.18...next-tinacms-markdown@0.2.19) (2020-06-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.18](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.18-alpha.2...next-tinacms-markdown@0.2.18) (2020-06-01)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.18-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.18-alpha.1...next-tinacms-markdown@0.2.18-alpha.2) (2020-06-01)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.18-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.18-alpha.0...next-tinacms-markdown@0.2.18-alpha.1) (2020-05-29)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.18-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.17...next-tinacms-markdown@0.2.18-alpha.0) (2020-05-28)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.17](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.16...next-tinacms-markdown@0.2.17) (2020-05-25)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.16](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.15...next-tinacms-markdown@0.2.16) (2020-05-19)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.15](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.14...next-tinacms-markdown@0.2.15) (2020-05-12)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.14](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.14-alpha.3...next-tinacms-markdown@0.2.14) (2020-05-11)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.14-alpha.3](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.14-alpha.2...next-tinacms-markdown@0.2.14-alpha.3) (2020-05-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.14-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.14-alpha.1...next-tinacms-markdown@0.2.14-alpha.2) (2020-05-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.14-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.14-alpha.0...next-tinacms-markdown@0.2.14-alpha.1) (2020-05-08)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.14-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.13...next-tinacms-markdown@0.2.14-alpha.0) (2020-05-06)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.13](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.13-alpha.0...next-tinacms-markdown@0.2.13) (2020-05-04)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.13-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12...next-tinacms-markdown@0.2.13-alpha.0) (2020-04-28)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12-alpha.4...next-tinacms-markdown@0.2.12) (2020-04-27)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12-alpha.4](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12-alpha.3...next-tinacms-markdown@0.2.12-alpha.4) (2020-04-24)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12-alpha.3](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12-alpha.2...next-tinacms-markdown@0.2.12-alpha.3) (2020-04-20)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12-alpha.2](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12-alpha.1...next-tinacms-markdown@0.2.12-alpha.2) (2020-04-14)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.12-alpha.0...next-tinacms-markdown@0.2.12-alpha.1) (2020-04-07)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.12-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.11...next-tinacms-markdown@0.2.12-alpha.0) (2020-04-06)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.11](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.10...next-tinacms-markdown@0.2.11) (2020-04-06)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.10](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.9...next-tinacms-markdown@0.2.10) (2020-04-06)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.9](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.8...next-tinacms-markdown@0.2.9) (2020-03-30)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.8](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.7...next-tinacms-markdown@0.2.8) (2020-03-30)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.7](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.6...next-tinacms-markdown@0.2.7) (2020-03-23)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.6](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.5...next-tinacms-markdown@0.2.6) (2020-03-16)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.5](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.5-alpha.1...next-tinacms-markdown@0.2.5) (2020-03-09)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.5-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.5-alpha.0...next-tinacms-markdown@0.2.5-alpha.1) (2020-03-06)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.5-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.4-alpha.0...next-tinacms-markdown@0.2.5-alpha.0) (2020-03-05)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.4](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.4-alpha.0...next-tinacms-markdown@0.2.4) (2020-03-02)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.4-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.3...next-tinacms-markdown@0.2.4-alpha.0) (2020-02-26)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.3](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.3-alpha.1...next-tinacms-markdown@0.2.3) (2020-02-24)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.3-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.3-alpha.0...next-tinacms-markdown@0.2.3-alpha.1) (2020-02-21)

### Bug Fixes

- **useMarkdownForm:** grab fileRelativePath from form values ([a7f594c](https://github.com/tinacms/tinacms/commit/a7f594c))

## [0.2.3-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.2...next-tinacms-markdown@0.2.3-alpha.0) (2020-02-20)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.2](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.2-alpha.1...next-tinacms-markdown@0.2.2) (2020-02-18)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.2-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.2-alpha.0...next-tinacms-markdown@0.2.2-alpha.1) (2020-02-16)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.2-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.1...next-tinacms-markdown@0.2.2-alpha.0) (2020-02-14)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.1-alpha.1...next-tinacms-markdown@0.2.1) (2020-02-11)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.1-alpha.1](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.1-alpha.0...next-tinacms-markdown@0.2.1-alpha.1) (2020-02-11)

**Note:** Version bump only for package next-tinacms-markdown

## [0.2.1-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.0...next-tinacms-markdown@0.2.1-alpha.0) (2020-02-06)

**Note:** Version bump only for package next-tinacms-markdown

# [0.2.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.2.0-alpha.0...next-tinacms-markdown@0.2.0) (2020-02-03)

**Note:** Version bump only for package next-tinacms-markdown

# [0.2.0-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.1.0...next-tinacms-markdown@0.2.0-alpha.0) (2020-02-03)

### Features

- adds form to markdownForm ([dabdd8f](https://github.com/tinacms/tinacms/commit/dabdd8f))
- adds next-tinacms-markdown general Markdown HOC ([2531099](https://github.com/tinacms/tinacms/commit/2531099))

## [0.1.1-alpha.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.1.0...next-tinacms-markdown@0.1.1-alpha.0) (2020-01-29)

**Note:** Version bump only for package next-tinacms-markdown

# [0.1.0](https://github.com/tinacms/tinacms/compare/next-tinacms-markdown@0.1.0-alpha.1...next-tinacms-markdown@0.1.0) (2020-01-27)

**Note:** Version bump only for package next-tinacms-markdown

# 0.1.0-alpha.1 (2020-01-24)

### Bug Fixes

- removes react & react-dom as devDeps ([a4fb6f6](https://github.com/tinacms/tinacms/commit/a4fb6f6))
- updates devDep versions to use ^ ([13db764](https://github.com/tinacms/tinacms/commit/13db764))

### Features

- adds use-global-markdown-form helper ([19d408c](https://github.com/tinacms/tinacms/commit/19d408c))
- adds useMarkdownForm nextjs helper ([4639223](https://github.com/tinacms/tinacms/commit/4639223))
