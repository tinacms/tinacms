# Change Log

## 0.51.5

### Patch Changes

- 138ceb8c4: Clean up dependencies
- Updated dependencies [138ceb8c4]
- Updated dependencies [0417e3750]
- Updated dependencies [d9f37ea7e]
  - @tinacms/toolkit@0.55.3
  - next-tinacms-markdown@0.50.3

## 0.51.4

### Patch Changes

- Updated dependencies [2724c48c0]
  - @tinacms/toolkit@0.55.2
  - next-tinacms-markdown@0.50.2

## 0.51.3

### Patch Changes

- Updated dependencies [9c0d48e09]
  - @tinacms/toolkit@0.55.1
  - next-tinacms-markdown@0.50.2

## 0.51.2

### Patch Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14
- Updated dependencies [b99baebf1]
  - @tinacms/toolkit@0.55.0
  - next-tinacms-markdown@0.50.2

## 0.51.1

### Patch Changes

- Updated dependencies [b961c7417]
  - @tinacms/toolkit@0.54.1
  - next-tinacms-markdown@0.50.1

## 0.51.0

### Minor Changes

- b59f23295: Fixed issue where heading button would not work in the WYSIWYG editor when using react 17

### Patch Changes

- Updated dependencies [9213d5608]
- Updated dependencies [b59f23295]
- Updated dependencies [a419056b6]
- Updated dependencies [ded8dfbee]
- Updated dependencies [5df9fe543]
- Updated dependencies [9d68b058f]
- Updated dependencies [91cebe5bc]
  - @tinacms/toolkit@0.54.0
  - next-tinacms-markdown@0.50.1

## 0.50.8

### Patch Changes

- Updated dependencies [7b149a4e7]
- Updated dependencies [906d72c50]
  - @tinacms/toolkit@0.53.0
  - next-tinacms-markdown@0.50.1

## 0.50.7

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.
- Updated dependencies [9b27192fe]
  - @tinacms/toolkit@0.52.3
  - next-tinacms-markdown@0.50.1

## 0.50.6

### Patch Changes

- Updated dependencies [6b1cbf916]
  - @tinacms/toolkit@0.52.2
  - next-tinacms-markdown@0.50.0

## 0.50.5

### Patch Changes

- Updated dependencies [4de977f63]
  - @tinacms/toolkit@0.52.1
  - next-tinacms-markdown@0.50.0

## 0.50.4

### Patch Changes

- Updated dependencies [b4f5e973f]
  - @tinacms/toolkit@0.52.0
  - next-tinacms-markdown@0.50.0

## 0.50.3

### Patch Changes

- Updated dependencies [634524925]
  - @tinacms/toolkit@0.51.0
  - next-tinacms-markdown@0.50.0

## 0.50.2

### Patch Changes

- Updated dependencies [e074d555]
  - @tinacms/toolkit@0.50.1
  - next-tinacms-markdown@0.50.0

## 0.50.1

### Patch Changes

- 840741f0: Use workspace versions for dependencies
  - next-tinacms-markdown@0.50.0

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
  - next-tinacms-markdown@0.44.0
  - @tinacms/toolkit@0.44.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.43.1](https://github.com/tinacms/tinacms/compare/v0.43.0...v0.43.1) (2021-07-13)

### Bug Fixes

- **react-tinacms-github:** Makes form-builder a peerDependency ([0e2174c](https://github.com/tinacms/tinacms/commit/0e2174ceef97ecd507e0a13d1f6a23cc7e843064))

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

**Note:** Version bump only for package react-tinacms-github

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- Unifies FormOptions across all useForm(...) variations ([ff3c058](https://github.com/tinacms/tinacms/commit/ff3c058496ab0b0979540e49a1391a506f4a34a3))
- **react-tinacms-github:** Migrate GithubMediaStore to cursor-based pagination ([5163fad](https://github.com/tinacms/tinacms/commit/5163fad6023ac133668736262c5c9732dfdd2c6d))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package react-tinacms-github

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

**Note:** Version bump only for package react-tinacms-github

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package react-tinacms-github

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package react-tinacms-github

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- **react-tinacms-github:** fix missing unique "key" prop in modal actions ([475bafa](https://github.com/tinacms/tinacms/commit/475bafae0a825e909bcf88bb826d913b960a0c4f))

### Features

- **react-tinacms-github:** Add WatchableFormValues argument to useGithubFileForm, useGithubJsonForm, useGithubMarkdownForm ([51ce6f3](https://github.com/tinacms/tinacms/commit/51ce6f3301b0487219611430849ab54ad39fcb25))

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

### Bug Fixes

- typo in GithubUploadResponse type ([1c14cff](https://github.com/tinacms/tinacms/commit/1c14cffae83eade3887d865fc33783dd6c9f53d7))

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

**Note:** Version bump only for package react-tinacms-github

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

**Note:** Version bump only for package react-tinacms-github

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

### Bug Fixes

- **react-tinacms-github:** Fix reversed error messages for 404 errors ([7e3ba86](https://github.com/tinacms/tinacms/commit/7e3ba861a176f7289791391f3c1a70f38ca54240))

### Features

- **react-tinacms-github:** GithubFile: Support committing newly created files ([d13eb76](https://github.com/tinacms/tinacms/commit/d13eb761d805e212cd498f69bc72270efd3115f0))

## [0.35.1](https://github.com/tinacms/tinacms/compare/v0.35.0...v0.35.1) (2021-01-19)

### Bug Fixes

- **react-tinacms-github:** Fix types for form hooks ([b937ed1](https://github.com/tinacms/tinacms/commit/b937ed1a4c201cfab6621bcf4f6f706e7efb33ad))

# [0.35.0](https://github.com/tinacms/tinacms/compare/v0.34.0...v0.35.0) (2020-12-15)

### Bug Fixes

- **react-tinacms-github:** restore original functionality for github:branch:checkout ([8060075](https://github.com/tinacms/tinacms/commit/806007583c7d5ed2aa3ac3fc65f15776c6cefadc))

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

### Bug Fixes

- **@tinacms/react-core:** useForm refreshes data on github branch change ([d16ef76](https://github.com/tinacms/tinacms/commit/d16ef762d75d2b7845049357431c125ed9ce55ff))
- **react-tinacms-github:** only send branchchange event when branch actually changes ([6580c8a](https://github.com/tinacms/tinacms/commit/6580c8afa247e3d6a1beb9d7e4967b45c130fa1e))

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

**Note:** Version bump only for package react-tinacms-github

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

### Bug Fixes

- **react-tinacms-github:** dispatch event on delete failurecloses [#1493](https://github.com/tinacms/tinacms/issues/1493) ([12d92dc](https://github.com/tinacms/tinacms/commit/12d92dc2220ec326e1e3ec7a59a8d6ab96e9f988))

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Features

- **react-tinacms-github:** add GithubClient#commit(branch, repo?) ([d62bc3b](https://github.com/tinacms/tinacms/commit/d62bc3bc5cd5dd06935ec8237005039eb817bfee))
- **react-tinacms-github:** GithubMediaStore implements MediaStore#delete ([1c5ded9](https://github.com/tinacms/tinacms/commit/1c5ded9334749ac7905068546eec397a886a9063))
- **react-tinacms-github:** GithubMediaStore implements MediaStore#list ([a963189](https://github.com/tinacms/tinacms/commit/a963189740e9ded9d753fb5bec95a7011350b3a7))

# [0.30.0](https://github.com/tinacms/tinacms/compare/v0.29.0...v0.30.0) (2020-09-10)

### Features

- **react-tinacms-github:** introduce useGithubClient hook ([2111d70](https://github.com/tinacms/tinacms/commit/2111d70c289684d06eec3aeff89e7a76bd618a23)), closes [#1436](https://github.com/tinacms/tinacms/issues/1436)

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package react-tinacms-github

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

### Bug Fixes

- **react-tinacms-github:** an authorized user trying access a deleted branch will be prompted to switch back to the base branch ([137b5ee](https://github.com/tinacms/tinacms/commit/137b5ee01ef289cf3a26ceae2e2d0c327fd9b1ea))
- **react-tinacms-github:** improved error modals on 404s ([4a998fc](https://github.com/tinacms/tinacms/commit/4a998fc79436b504fcfada4c80de1249b34a899a))

### Features

- **react-tinacms-github:** GithubMediaStore implements previewSrc ([325fdb4](https://github.com/tinacms/tinacms/commit/325fdb4ddda710c5b7baf2e0ab3ac4027f572905))

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

### Bug Fixes

- switch from ReactNode to ReactChild for various props ([a585ce9](https://github.com/tinacms/tinacms/commit/a585ce990de45a499ff8befd93554133768e5e43))

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

**Note:** Version bump only for package react-tinacms-github

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package react-tinacms-github

# [0.7.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.6.0...react-tinacms-github@0.7.0-alpha.0) (2020-07-15)

### Features

- added ability to delete files with github client ([8ccc956](https://github.com/tinacms/tinacms/commit/8ccc956))

# [0.6.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.6.0-alpha.0...react-tinacms-github@0.6.0) (2020-07-07)

### Bug Fixes

- send json message on succesful preview handling ([3b0cbee](https://github.com/tinacms/tinacms/commit/3b0cbee))

# [0.6.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.5.1...react-tinacms-github@0.6.0-alpha.0) (2020-07-04)

### Bug Fixes

- **react-tinacms-github:** allow overwriting uploaded media ([5c6e768](https://github.com/tinacms/tinacms/commit/5c6e768))
- **react-tinacms-github:** allow overwriting when uploading ([8fb4a86](https://github.com/tinacms/tinacms/commit/8fb4a86))
- **react-tinacms-github:** fire checkout event after branch create ([634345c](https://github.com/tinacms/tinacms/commit/634345c))
- **react-tinacms-github:** update branch list on branch create ([4537de1](https://github.com/tinacms/tinacms/commit/4537de1))

### Features

- **react-tinacms-github:** add GitClient#getDownloadUrl ([06b3261](https://github.com/tinacms/tinacms/commit/06b3261))
- **react-tinacms-github:** add GithubFile and useGithubFile ([c6b0535](https://github.com/tinacms/tinacms/commit/c6b0535))

## [0.5.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.5.1-alpha.1...react-tinacms-github@0.5.1) (2020-06-29)

**Note:** Version bump only for package react-tinacms-github

## [0.5.1-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.5.1-alpha.0...react-tinacms-github@0.5.1-alpha.1) (2020-06-24)

**Note:** Version bump only for package react-tinacms-github

## [0.5.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.5.0...react-tinacms-github@0.5.1-alpha.0) (2020-06-24)

**Note:** Version bump only for package react-tinacms-github

# [0.5.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.5.0-alpha.0...react-tinacms-github@0.5.0) (2020-06-23)

**Note:** Version bump only for package react-tinacms-github

# [0.5.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.3...react-tinacms-github@0.5.0-alpha.0) (2020-06-17)

### Bug Fixes

- **react-tinacms-github:** close modal after auth success ([127ee29](https://github.com/tinacms/tinacms/commit/127ee29))
- **react-tinacms-github:** close modal after branch change ([c29ba29](https://github.com/tinacms/tinacms/commit/c29ba29))

### Features

- react-tinacms-github supports the new auth flow ([31f510d](https://github.com/tinacms/tinacms/commit/31f510d))
- **react-tinacms-github:** fire event on branch change ([6f3267c](https://github.com/tinacms/tinacms/commit/6f3267c))

## [0.4.3](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.3-alpha.1...react-tinacms-github@0.4.3) (2020-06-15)

**Note:** Version bump only for package react-tinacms-github

## [0.4.3-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.3-alpha.0...react-tinacms-github@0.4.3-alpha.1) (2020-06-12)

**Note:** Version bump only for package react-tinacms-github

## [0.4.3-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.2...react-tinacms-github@0.4.3-alpha.0) (2020-06-08)

**Note:** Version bump only for package react-tinacms-github

## [0.4.2](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.1...react-tinacms-github@0.4.2) (2020-06-08)

### Bug Fixes

- cleaned github client fetch method ([8ae661d](https://github.com/tinacms/tinacms/commit/8ae661d))
- github client fetch file works on any branch ([d35e07b](https://github.com/tinacms/tinacms/commit/d35e07b))
- removed sha param in github clients fetch file ([6060d0f](https://github.com/tinacms/tinacms/commit/6060d0f))

## [0.4.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.1-alpha.3...react-tinacms-github@0.4.1) (2020-06-01)

**Note:** Version bump only for package react-tinacms-github

## [0.4.1-alpha.3](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.1-alpha.2...react-tinacms-github@0.4.1-alpha.3) (2020-06-01)

### Bug Fixes

- is-authorized defaults to false ([f675d9d](https://github.com/tinacms/tinacms/commit/f675d9d))
- toggle cms when entering/exiting authentication flow ([6f72fa0](https://github.com/tinacms/tinacms/commit/6f72fa0))

## [0.4.1-alpha.2](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.1-alpha.1...react-tinacms-github@0.4.1-alpha.2) (2020-05-29)

### Bug Fixes

- set sha for new files ([fc06337](https://github.com/tinacms/tinacms/commit/fc06337)), closes [#1172](https://github.com/tinacms/tinacms/issues/1172)

## [0.4.1-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.1-alpha.0...react-tinacms-github@0.4.1-alpha.1) (2020-05-28)

### Bug Fixes

- github error uses message from response ([2499773](https://github.com/tinacms/tinacms/commit/2499773))
- set working branch to branchName ([fbfab5a](https://github.com/tinacms/tinacms/commit/fbfab5a))

## [0.4.1-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.4.0...react-tinacms-github@0.4.1-alpha.0) (2020-05-28)

### Bug Fixes

- use-github-file-form no longer registers the form plugin ([0ad8b40](https://github.com/tinacms/tinacms/commit/0ad8b40))

# [0.4.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.2...react-tinacms-github@0.4.0) (2020-05-25)

### Bug Fixes

- fixed setting github working branch ([59b8c81](https://github.com/tinacms/tinacms/commit/59b8c81))
- media persist conditionally removes first '/' ([7cb5335](https://github.com/tinacms/tinacms/commit/7cb5335))

### Features

- added a fetch file method to the github client ([03e12f6](https://github.com/tinacms/tinacms/commit/03e12f6))

## [0.3.2](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.1...react-tinacms-github@0.3.2) (2020-05-19)

**Note:** Version bump only for package react-tinacms-github

## [0.3.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.0...react-tinacms-github@0.3.1) (2020-05-12)

**Note:** Version bump only for package react-tinacms-github

# [0.3.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.0-alpha.3...react-tinacms-github@0.3.0) (2020-05-11)

### Bug Fixes

- use-github-form accepts actions ([9fb83bf](https://github.com/tinacms/tinacms/commit/9fb83bf))

# [0.3.0-alpha.3](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.0-alpha.2...react-tinacms-github@0.3.0-alpha.3) (2020-05-08)

**Note:** Version bump only for package react-tinacms-github

# [0.3.0-alpha.2](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.0-alpha.1...react-tinacms-github@0.3.0-alpha.2) (2020-05-08)

**Note:** Version bump only for package react-tinacms-github

# [0.3.0-alpha.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.3.0-alpha.0...react-tinacms-github@0.3.0-alpha.1) (2020-05-08)

### Bug Fixes

- callstack exceeded when accessing branchName ([6e2ebd3](https://github.com/tinacms/tinacms/commit/6e2ebd3)), closes [#1109](https://github.com/tinacms/tinacms/issues/1109)
- export GithubError interface ([85fc71a](https://github.com/tinacms/tinacms/commit/85fc71a))
- show error modal if creating a branch fails ([614bea6](https://github.com/tinacms/tinacms/commit/614bea6))

# [0.3.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.2.0...react-tinacms-github@0.3.0-alpha.0) (2020-05-06)

### Bug Fixes

- **use-github-format-forms:** the options are optional ([88ccd92](https://github.com/tinacms/tinacms/commit/88ccd92))

### Features

- **github-client:** optionally accept scope ([880a6b6](https://github.com/tinacms/tinacms/commit/880a6b6))

# [0.2.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.2.0-alpha.0...react-tinacms-github@0.2.0) (2020-05-04)

### Bug Fixes

- github-client branch name should default to base branch ([7ea6773](https://github.com/tinacms/tinacms/commit/7ea6773))

# [0.2.0-alpha.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.1.0...react-tinacms-github@0.2.0-alpha.0) (2020-04-28)

### Bug Fixes

- persist return directory and filename ([ec837a2](https://github.com/tinacms/tinacms/commit/ec837a2))

### Features

- add lock icon ([f9df0f3](https://github.com/tinacms/tinacms/commit/f9df0f3))
- added GithubMediaStore ([133cdcc](https://github.com/tinacms/tinacms/commit/133cdcc))
- create new branches ([1c557a2](https://github.com/tinacms/tinacms/commit/1c557a2))
- github.getBranchList ([2a91a61](https://github.com/tinacms/tinacms/commit/2a91a61))
- support working from the origin repository ([18df649](https://github.com/tinacms/tinacms/commit/18df649))
- support working from the origin repository ([9d7398e](https://github.com/tinacms/tinacms/commit/9d7398e))
- switch between existing branches ([c1bf9a0](https://github.com/tinacms/tinacms/commit/c1bf9a0))

# [0.1.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.1.0-canary3.2...react-tinacms-github@0.1.0) (2020-04-27)

**Note:** Version bump only for package react-tinacms-github

# [0.1.0-canary3.2](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.1.0-canary3.1...react-tinacms-github@0.1.0-canary3.2) (2020-04-24)

**Note:** Version bump only for package react-tinacms-github

# [0.1.0-canary3.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.1.0-canary3.0...react-tinacms-github@0.1.0-canary3.1) (2020-04-21)

### Bug Fixes

- **Github:** fix incorrect property access in PRModal ([790f541](https://github.com/tinacms/tinacms/commit/790f541))

# [0.1.0-canary3.0](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.0.1-canary3.1...react-tinacms-github@0.1.0-canary3.0) (2020-04-20)

### Bug Fixes

- **github:** fix issue where you need to click authenticate twice ([8a75122](https://github.com/tinacms/tinacms/commit/8a75122))

### Features

- **github:** Show error message when github fork fails ([7403015](https://github.com/tinacms/tinacms/commit/7403015))

## [0.0.1-canary3.1](https://github.com/tinacms/tinacms/compare/react-tinacms-github@0.0.1-canary3.0...react-tinacms-github@0.0.1-canary3.1) (2020-04-14)

### Bug Fixes

- forms are more flexible with the shape of Fields ([90d8b0c](https://github.com/tinacms/tinacms/commit/90d8b0c))

## 0.0.1-canary3.0 (2020-04-07)

**Note:** Version bump only for package react-tinacms-github

# 0.1.0 (2020-04)

### Features

- **Open Authoring:** using Github
