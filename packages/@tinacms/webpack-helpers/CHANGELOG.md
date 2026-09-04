# Change Log

## 1.0.6

### Patch Changes

- [#7476](https://github.com/tinacms/tinacms/pull/7476) [`f48009e`](https://github.com/tinacms/tinacms/commit/f48009ec6cabe28427a430b80299fe92ede5da0d) Thanks [@kulesy](https://github.com/kulesy)! - chore(tinacms-pkgs): point `repository.directory` at each package's own folder

  Eight packages declared a `repository.directory` copied from whichever package they were forked from, so the "repository" link on their npm pages resolved to unrelated source. Also drops a dead `generate:schema` script from `@tinacms/metrics`, `@tinacms/cli` and `@tinacms/schema-tools` - it referenced a `scripts/generateSchema.js` that has never existed in the repo and nothing invoked it.

## 1.0.5

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

## 1.0.4

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

## 1.0.3

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

## 1.0.2

### Patch Changes

- 0503072: update ts, remove rimraf, fix types

## 1.0.1

### Patch Changes

- efd56e769: Remove license headers

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package @tinacms/webpack-helpers

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package @tinacms/webpack-helpers

# [0.1.0](https://github.com/tinacms/tinacms/compare/@tinacms/webpack-helpers@0.1.0-alpha.0...@tinacms/webpack-helpers@0.1.0) (2020-03-23)

**Note:** Version bump only for package @tinacms/webpack-helpers

# 0.1.0-alpha.0 (2020-03-17)

### Features

- introduce @tinacms/webpack-helpers ([67448d6](https://github.com/tinacms/tinacms/commit/67448d6))
