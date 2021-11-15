# Change Log

## 0.53.5

### Patch Changes

- 138ceb8c4: Clean up dependencies
- 1a7a54424: fixed path to Typescript typings, so that they are included in generated NPM package
- Updated dependencies [138ceb8c4]
- Updated dependencies [0417e3750]
- Updated dependencies [d9f37ea7e]
  - @tinacms/toolkit@0.55.3

## 0.53.4

### Patch Changes

- Updated dependencies [2724c48c0]
  - @tinacms/toolkit@0.55.2

## 0.53.3

### Patch Changes

- Updated dependencies [9c0d48e09]
  - @tinacms/toolkit@0.55.1

## 0.53.2

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14
- Updated dependencies [b99baebf1]
  - @tinacms/toolkit@0.55.0

## 0.53.1

### Patch Changes

- Updated dependencies [b961c7417]
  - @tinacms/toolkit@0.54.1

## 0.53.0

### Minor Changes

- b59f23295: Fixed issue where heading button would not work in the WYSIWYG editor when using react 17

### Patch Changes

- aa714b1fb: Improve BlockComponentProps and Block.Component
- Updated dependencies [9213d5608]
- Updated dependencies [b59f23295]
- Updated dependencies [a419056b6]
- Updated dependencies [ded8dfbee]
- Updated dependencies [5df9fe543]
- Updated dependencies [9d68b058f]
- Updated dependencies [91cebe5bc]
  - @tinacms/toolkit@0.54.0

## 0.52.5

### Patch Changes

- Updated dependencies [7b149a4e7]
- Updated dependencies [906d72c50]
  - @tinacms/toolkit@0.53.0

## 0.52.4

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.
- Updated dependencies [9b27192fe]
  - @tinacms/toolkit@0.52.3

## 0.52.3

### Patch Changes

- Updated dependencies [6b1cbf916]
  - @tinacms/toolkit@0.52.2

## 0.52.2

### Patch Changes

- Updated dependencies [4de977f63]
  - @tinacms/toolkit@0.52.1

## 0.52.1

### Patch Changes

- Updated dependencies [b4f5e973f]
  - @tinacms/toolkit@0.52.0

## 0.52.0

### Minor Changes

- 634524925: filetype acceptance now comes from the media store configuration
- ef50311e2: Add the style attribute to the InlineBlocks component of the react-tinacms-inline package

### Patch Changes

- Updated dependencies [634524925]
  - @tinacms/toolkit@0.51.0

## 0.51.1

### Patch Changes

- Updated dependencies [e074d555]
  - @tinacms/toolkit@0.50.1

## 0.51.0

### Minor Changes

- 6f4ca997: Move InlineWysiwyg to react-tinacms-inline

### Patch Changes

- 840741f0: Use workspace versions for dependencies

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
- Updated dependencies [d0335573]
- Updated dependencies [7f3c8c1a]
  - tinacms@0.5.0
  - react-tinacms-editor@0.44.0
  - @tinacms/toolkit@0.44.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

### Features

- **react-tinacms-inline:** InlineBlocks children ([00d5804](https://github.com/tinacms/tinacms/commit/00d580492370714096c051761b90cea013dc7644))

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

**Note:** Version bump only for package react-tinacms-inline

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package react-tinacms-inline

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package react-tinacms-inline

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package react-tinacms-inline

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package react-tinacms-inline

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- close on click outside ([462e09f](https://github.com/tinacms/tinacms/commit/462e09f57ed2fa63c13120356d6c36e7f8f78ba5))
- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- inline group click event bug ([15c8675](https://github.com/tinacms/tinacms/commit/15c8675b600b882f8812f6d83c7b1a5c8f94dd01))
- modal x button cancels changes ([258d190](https://github.com/tinacms/tinacms/commit/258d19006ba4518fae3ab97b27e95fea19c1ffe9))

### Features

- inline block search ([3080eac](https://github.com/tinacms/tinacms/commit/3080eacbe85bfa8fbe7ab7a284c294dce26fd4e9))

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

### Features

- **react-tinacms-inline:** add RBIE feature flag plugin ([cc63851](https://github.com/tinacms/tinacms/commit/cc63851430c5e0c2555504d9f726233a47011c8d))

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

### Bug Fixes

- **react-tinacms-inline:** Fix ability to clear field selection, closes [#1725](https://github.com/tinacms/tinacms/issues/1725) ([3e8aab4](https://github.com/tinacms/tinacms/commit/3e8aab4f324454752e2a88d99e9bdf869c26447f))

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

### Bug Fixes

- **react-tinacms-inline:** dep constraint syntax ([c9c3f05](https://github.com/tinacms/tinacms/commit/c9c3f057ffc3ed0dc54f5ee469cf70dab8885d4f))

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

### Features

- **react-tinacms-inline:** inline block duplicate action ([0b79ecf](https://github.com/tinacms/tinacms/commit/0b79ecf468b7ad9c35cb5cd9696e144ffc456a4f))

# [0.35.0](https://github.com/tinacms/tinacms/compare/v0.34.0...v0.35.0) (2020-12-15)

### Bug Fixes

- **react-tinacms-inline:** [#1640](https://github.com/tinacms/tinacms/issues/1640) support defaultItem as a function in add-block-menu.tsx ([85acb9d](https://github.com/tinacms/tinacms/commit/85acb9d493a0ea4f7d7df839f69ab0fbb2deecad))

### Features

- add inline block label ([af24e52](https://github.com/tinacms/tinacms/commit/af24e52754082354fe9297d7b5204f6dcc5f2647))
- Use custom actions in BlocksControls ([d01e14a](https://github.com/tinacms/tinacms/commit/d01e14a56db03ad2484527fdbb14ec58a5de52f3))

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

**Note:** Version bump only for package react-tinacms-inline

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

### Bug Fixes

- **react-tinacms-inline:** better control InlineBlocks rerenders ([611fc70](https://github.com/tinacms/tinacms/commit/611fc70eaba95168db9531f35d283d69dfe56e05))
- **react-tinacms-inline:** stop focus event bubble before returning early ([698e0b5](https://github.com/tinacms/tinacms/commit/698e0b5d1573087068ed5517d22a7f3cede5ac74))

### Features

- **react-tinacms-inline:** Export SettingsModal ([ba5e03e](https://github.com/tinacms/tinacms/commit/ba5e03e8403d52b0b9ffcc068af7e3cbf845cfa6))
- **react-tinacms-inline:** FocusRing accepts render-child ([e1cc04c](https://github.com/tinacms/tinacms/commit/e1cc04c76898a800e2a792ba210e305bddbc9771))
- **react-tinacms-inline:** InlineGroup field names are relative ([57bcb3d](https://github.com/tinacms/tinacms/commit/57bcb3d2f70deec3f96437054d678b2551a559e6))

### Performance Improvements

- **react-tinacms-inline:** don't render block menu when block not active ([2b26b8a](https://github.com/tinacms/tinacms/commit/2b26b8a5c7a64b64e10f4faebc8712c0832218a5))

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

### Bug Fixes

- **react-tinacms-inline:** empty inline img to click/drag ([c879441](https://github.com/tinacms/tinacms/commit/c879441541a955d3e3d33c4f30c35a2b8cfbf92a))
- **react-tinacms-inline:** field focus is not lost when editing settings ([8a078b4](https://github.com/tinacms/tinacms/commit/8a078b4f9b5138c7821f859511cc53d618b93366))
- **react-tinacms-inline:** inline image field allows media to be deleted from media manager ([352284f](https://github.com/tinacms/tinacms/commit/352284f8fdeb13b145ce54d0b3359a7076353284))
- **react-tinacms-inline:** some fields were mis-handling focus ([5d7318c](https://github.com/tinacms/tinacms/commit/5d7318c0ccdfe89709f2e8bc7d1c8f8d3a115019)), closes [#1516](https://github.com/tinacms/tinacms/issues/1516)
- **react-tinacms-inline:** uploadDir passes formValues ([99de78a](https://github.com/tinacms/tinacms/commit/99de78acd9768358fc2b43ba0f52d63b07db9988))

### Features

- **react-tinacms-inline:** block components are given their name ([8d42e9a](https://github.com/tinacms/tinacms/commit/8d42e9abbfb98bd50bd7dc1913fa3d8bc799972c)), closes [#1536](https://github.com/tinacms/tinacms/issues/1536)

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Features

- **react-tinacms-inline:** adds inline image style extension ([f4348e5](https://github.com/tinacms/tinacms/commit/f4348e583f0ec794b8b45483cd8456ab4e9160a2))
- **react-tinacms-inline:** image children only receive src ([9b48aa6](https://github.com/tinacms/tinacms/commit/9b48aa68874fdfe9ce567f47b5945a9365c888aa))
- **react-tinacms-inline:** inline img accepts alt ([e576838](https://github.com/tinacms/tinacms/commit/e5768385f878418353fa1c108632290e4c3f8c1a))
- **react-tinacms-inline:** InlineField accepts parse and format functions ([8d62b8e](https://github.com/tinacms/tinacms/commit/8d62b8e65cae511118c16a4f4427672b0812bcd9))
- **react-tinacms-inline:** InlineImage parse accepts a Media rather then a string ([3be3e16](https://github.com/tinacms/tinacms/commit/3be3e166b83e1ba60a041898c9b0165310cbb623))
- **react-tinacms-inline:** InlineImageField#previewSrc matches MediaStore API ([aeb0cd5](https://github.com/tinacms/tinacms/commit/aeb0cd5f5a717f035074e1406556b621c5e874f3))
- **react-tinacms-inline:** uploadDir on InlineImageField is now optional ([4259804](https://github.com/tinacms/tinacms/commit/425980478046e50620ce2b6441b4db68d1e0223c))

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

### Bug Fixes

- **react-tinacms-inline:** preview src passes form values ([e376424](https://github.com/tinacms/tinacms/commit/e37642482c78182d72bf74eb34e3f1a2a311675f))

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

### Bug Fixes

- multiple instances of components not accepting multiple child elements ([cbbb03d](https://github.com/tinacms/tinacms/commit/cbbb03df7d1c98450355b93e1189cda8811aa5a3))

### Features

- **react-tinacms-inline:** InlineImage defaults to using cms.media.store.previewSrc ([d050e63](https://github.com/tinacms/tinacms/commit/d050e6301bc2a7e38681d1fb72b31b36283bf920))
- **react-tinacms-inline:** InlineImage now works with an async previewSrc ([91b8995](https://github.com/tinacms/tinacms/commit/91b8995f4741f3aed8aee2fd045242623bc86221))
- **react-tinacms-inline:** InlineText and InlineTextarea will render children instead of input.value when cms.disabled ([1ee29ab](https://github.com/tinacms/tinacms/commit/1ee29abaf526168b06af232ff31bf1fc5bbc01e3))
- **react-tinacms-inline:** InlineTextarea now accepts placeholder ([1be2566](https://github.com/tinacms/tinacms/commit/1be2566a5177cdbf4a439d80ba0ff8d048528d76))

## [0.27.3](https://github.com/tinacms/tinacms/compare/v0.27.2...v0.27.3) (2020-08-10)

### Bug Fixes

- **react-tinacms-inline:** BlocksControls always returns a JSX Element ([36d84f6](https://github.com/tinacms/tinacms/commit/36d84f62316bd8d7683a5c317ab3fc4a5a3ee9cd))

## [0.27.2](https://github.com/tinacms/tinacms/compare/v0.27.1...v0.27.2) (2020-08-10)

### Bug Fixes

- **react-tinacms-inline:** BlocksControlsProps#children is not optional ([9ca8bc9](https://github.com/tinacms/tinacms/commit/9ca8bc95ce0751fe5713449d11f89392568540cf))

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

### Bug Fixes

- switch from ReactNode to ReactChild for various props ([a585ce9](https://github.com/tinacms/tinacms/commit/a585ce990de45a499ff8befd93554133768e5e43))

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

### Features

- **react-tinacms-inline:** InlineText now accepts a placeholder prop ([319d29f](https://github.com/tinacms/tinacms/commit/319d29f303bcb38286ec24982030327ec2a44f0f))

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

### Features

- add focus ring to inline wysiwyg ([2768afd](https://github.com/tinacms/tinacms/commit/2768afd1b69bdef2a3dce38dab6b71d002ddbad6))

## [0.10.2-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.10.1...react-tinacms-inline@0.10.2-alpha.0) (2020-07-15)

**Note:** Version bump only for package react-tinacms-inline

## [0.10.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.10.1-alpha.0...react-tinacms-inline@0.10.1) (2020-07-07)

**Note:** Version bump only for package react-tinacms-inline

## [0.10.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.10.0...react-tinacms-inline@0.10.1-alpha.0) (2020-07-04)

**Note:** Version bump only for package react-tinacms-inline

# [0.10.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.9.1-alpha.0...react-tinacms-inline@0.10.0) (2020-06-29)

### Features

- adds limits to inline blocks ([030a644](https://github.com/tinacms/tinacms/commit/030a644))

## [0.9.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.9.0...react-tinacms-inline@0.9.1-alpha.0) (2020-06-24)

**Note:** Version bump only for package react-tinacms-inline

# [0.9.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.8.1-alpha.0...react-tinacms-inline@0.9.0) (2020-06-23)

### Bug Fixes

- changed inline block field controls to use vertical and horizontal ([1fe1c01](https://github.com/tinacms/tinacms/commit/1fe1c01))
- changed the direction of inline blocks from row and col to vertical and horizontal ([03eaeb9](https://github.com/tinacms/tinacms/commit/03eaeb9))
- rename to itemprops ([209df7b](https://github.com/tinacms/tinacms/commit/209df7b))
- use kep prop ([bfda51f](https://github.com/tinacms/tinacms/commit/bfda51f))

### Features

- add a blockProps prop which spreads props to child elements ([f02bcee](https://github.com/tinacms/tinacms/commit/f02bcee))

## [0.8.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.8.0...react-tinacms-inline@0.8.1-alpha.0) (2020-06-17)

**Note:** Version bump only for package react-tinacms-inline

# [0.8.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.8.0-alpha.0...react-tinacms-inline@0.8.0) (2020-06-15)

### Bug Fixes

- toggles in inline settings ([471bdfb](https://github.com/tinacms/tinacms/commit/471bdfb))

# [0.8.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.7.1-alpha.0...react-tinacms-inline@0.8.0-alpha.0) (2020-06-12)

### Bug Fixes

- block/group panels now stay within the settings modal ([89f9ee5](https://github.com/tinacms/tinacms/commit/89f9ee5))
- inline group accepts false for focus ring ([8c69c60](https://github.com/tinacms/tinacms/commit/8c69c60))

### Features

- adds x & y config on offset ([685aa30](https://github.com/tinacms/tinacms/commit/685aa30))
- export field context ([8a1d3d4](https://github.com/tinacms/tinacms/commit/8a1d3d4))

## [0.7.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.7.0...react-tinacms-inline@0.7.1-alpha.0) (2020-06-08)

**Note:** Version bump only for package react-tinacms-inline

# [0.7.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.6.0...react-tinacms-inline@0.7.0) (2020-06-08)

### Bug Fixes

- only one block/group is focussed at a time ([8d78a2b](https://github.com/tinacms/tinacms/commit/8d78a2b))
- **InlineGroup:** name is required and it always has controls ([a485e40](https://github.com/tinacms/tinacms/commit/a485e40))

### Features

- adds confirm button to inline settings ([3c87589](https://github.com/tinacms/tinacms/commit/3c87589))
- adds focus ring prop to inline groups and inline blocks ([764cb78](https://github.com/tinacms/tinacms/commit/764cb78))
- inline group renders controls by default ([33eaebf](https://github.com/tinacms/tinacms/commit/33eaebf))
- inline settings cancel btn reverts form values ([5445c51](https://github.com/tinacms/tinacms/commit/5445c51))

# [0.6.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.6.0-alpha.3...react-tinacms-inline@0.6.0) (2020-06-01)

**Note:** Version bump only for package react-tinacms-inline

# [0.6.0-alpha.3](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.6.0-alpha.2...react-tinacms-inline@0.6.0-alpha.3) (2020-06-01)

**Note:** Version bump only for package react-tinacms-inline

# [0.6.0-alpha.2](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.6.0-alpha.1...react-tinacms-inline@0.6.0-alpha.2) (2020-05-29)

### Bug Fixes

- group supports blocks and group-list ([009e944](https://github.com/tinacms/tinacms/commit/009e944))
- inline blocks works inside of groups ([a2b17d8](https://github.com/tinacms/tinacms/commit/a2b17d8))
- inline group does not require fields ([8c8536c](https://github.com/tinacms/tinacms/commit/8c8536c))
- opening blocks in settings modals ([d0ff8b9](https://github.com/tinacms/tinacms/commit/d0ff8b9))

### Features

- focus ring accepts offset and borderradius props ([36afdd9](https://github.com/tinacms/tinacms/commit/36afdd9))

# [0.6.0-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.6.0-alpha.0...react-tinacms-inline@0.6.0-alpha.1) (2020-05-28)

**Note:** Version bump only for package react-tinacms-inline

# [0.6.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.5.0...react-tinacms-inline@0.6.0-alpha.0) (2020-05-28)

### Features

- adds inline group ([885307a](https://github.com/tinacms/tinacms/commit/885307a))

# [0.5.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.9...react-tinacms-inline@0.5.0) (2020-05-25)

### Features

- inline block image handles preview src ([46e09b6](https://github.com/tinacms/tinacms/commit/46e09b6))
- inline-wysiwyg component ([547a2d8](https://github.com/tinacms/tinacms/commit/547a2d8))

## [0.4.9](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.8...react-tinacms-inline@0.4.9) (2020-05-19)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.8](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.7...react-tinacms-inline@0.4.8) (2020-05-12)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.7](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.7-alpha.3...react-tinacms-inline@0.4.7) (2020-05-11)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.7-alpha.3](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.7-alpha.2...react-tinacms-inline@0.4.7-alpha.3) (2020-05-08)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.7-alpha.2](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.7-alpha.1...react-tinacms-inline@0.4.7-alpha.2) (2020-05-08)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.7-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.7-alpha.0...react-tinacms-inline@0.4.7-alpha.1) (2020-05-08)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.7-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.6...react-tinacms-inline@0.4.7-alpha.0) (2020-05-06)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.6](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.6-alpha.0...react-tinacms-inline@0.4.6) (2020-05-04)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.6-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5...react-tinacms-inline@0.4.6-alpha.0) (2020-04-28)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.5](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5-alpha.4...react-tinacms-inline@0.4.5) (2020-04-27)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.5-alpha.4](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5-alpha.3...react-tinacms-inline@0.4.5-alpha.4) (2020-04-24)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.5-alpha.3](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5-alpha.2...react-tinacms-inline@0.4.5-alpha.3) (2020-04-20)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.5-alpha.2](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5-alpha.1...react-tinacms-inline@0.4.5-alpha.2) (2020-04-14)

### Bug Fixes

- dependend on react-textarea-autosize ([e1315d7](https://github.com/tinacms/tinacms/commit/e1315d7)), closes [#999](https://github.com/tinacms/tinacms/issues/999)
- don't show add block btn when inline form is inactive ([e1d2a45](https://github.com/tinacms/tinacms/commit/e1d2a45))

## [0.4.5-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.5-alpha.0...react-tinacms-inline@0.4.5-alpha.1) (2020-04-07)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.5-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.4...react-tinacms-inline@0.4.5-alpha.0) (2020-04-06)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.4](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.3...react-tinacms-inline@0.4.4) (2020-04-06)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.3](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.2...react-tinacms-inline@0.4.3) (2020-04-06)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.2](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.1...react-tinacms-inline@0.4.2) (2020-03-30)

**Note:** Version bump only for package react-tinacms-inline

## [0.4.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.4.0...react-tinacms-inline@0.4.1) (2020-03-30)

**Note:** Version bump only for package react-tinacms-inline

# [0.4.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.3.0...react-tinacms-inline@0.4.0) (2020-03-23)

### Features

- **react-tinacms-inline:** adds inline image field ([f35e263](https://github.com/tinacms/tinacms/commit/f35e263))
- adds inline block image ([c216d44](https://github.com/tinacms/tinacms/commit/c216d44))
- adds inline image field, needs work ([64b0531](https://github.com/tinacms/tinacms/commit/64b0531))

# [0.3.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.2.1...react-tinacms-inline@0.3.0) (2020-03-16)

### Features

- adds inline textarea block and field ([e90c350](https://github.com/tinacms/tinacms/commit/e90c350))
- inline text and block text accept extended styles ([e5665db](https://github.com/tinacms/tinacms/commit/e5665db))
- inline textarea and block accept style overrides ([6428362](https://github.com/tinacms/tinacms/commit/6428362))

## [0.2.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.2.1-alpha.1...react-tinacms-inline@0.2.1) (2020-03-09)

**Note:** Version bump only for package react-tinacms-inline

## [0.2.1-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.2.1-alpha.0...react-tinacms-inline@0.2.1-alpha.1) (2020-03-06)

**Note:** Version bump only for package react-tinacms-inline

## [0.2.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.2.0-alpha.0...react-tinacms-inline@0.2.1-alpha.0) (2020-03-05)

### Bug Fixes

- react warning from AddBlockMenu ([cff0dd3](https://github.com/tinacms/tinacms/commit/cff0dd3))
- react warnings with index ([b705b85](https://github.com/tinacms/tinacms/commit/b705b85))

# [0.2.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.2.0-alpha.0...react-tinacms-inline@0.2.0) (2020-03-02)

**Note:** Version bump only for package react-tinacms-inline

# [0.2.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.2...react-tinacms-inline@0.2.0-alpha.0) (2020-02-26)

### Features

- **InlineForm:** accept optional defaultStatus ([1f30cb2](https://github.com/tinacms/tinacms/commit/1f30cb2))

## [0.1.2](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.2-alpha.1...react-tinacms-inline@0.1.2) (2020-02-24)

**Note:** Version bump only for package react-tinacms-inline

## [0.1.2-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.2-alpha.0...react-tinacms-inline@0.1.2-alpha.1) (2020-02-21)

**Note:** Version bump only for package react-tinacms-inline

## [0.1.2-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.1...react-tinacms-inline@0.1.2-alpha.0) (2020-02-20)

**Note:** Version bump only for package react-tinacms-inline

## [0.1.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.1-alpha.1...react-tinacms-inline@0.1.1) (2020-02-18)

**Note:** Version bump only for package react-tinacms-inline

## [0.1.1-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.1-alpha.0...react-tinacms-inline@0.1.1-alpha.1) (2020-02-16)

**Note:** Version bump only for package react-tinacms-inline

## [0.1.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.0...react-tinacms-inline@0.1.1-alpha.0) (2020-02-14)

**Note:** Version bump only for package react-tinacms-inline

# [0.1.0](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.0-alpha.1...react-tinacms-inline@0.1.0) (2020-02-11)

**Note:** Version bump only for package react-tinacms-inline

# [0.1.0-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-inline@0.1.0-alpha.0...react-tinacms-inline@0.1.0-alpha.1) (2020-02-11)

**Note:** Version bump only for package react-tinacms-inline

# 0.1.0-alpha.0 (2020-02-06)

### Features

- **BlockField:** lets you edit fields relative to a block ([42cf8de](https://github.com/tinacms/tinacms/commit/42cf8de))
- **BlocksControls:** provides UI for managing a block ([8e8864d](https://github.com/tinacms/tinacms/commit/8e8864d))
- **InlineBlocks:** helps with editing Blocks data inline ([ea460f7](https://github.com/tinacms/tinacms/commit/ea460f7))
- **InlineField:** a component for editing fields inline ([4b075d1](https://github.com/tinacms/tinacms/commit/4b075d1))
- **InlineForm:** a component for making inline forms ([e9dcc93](https://github.com/tinacms/tinacms/commit/e9dcc93))
- **InlineTextField:** makes editing inline text easy ([3cfb059](https://github.com/tinacms/tinacms/commit/3cfb059))
