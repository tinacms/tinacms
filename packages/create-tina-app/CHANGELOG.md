# create-tina-app

## 1.2.3

### Patch Changes

- [#5167](https://github.com/tinacms/tinacms/pull/5167) [`abdf668`](https://github.com/tinacms/tinacms/commit/abdf668daf7d9e679b26610f8cb66fecf86aef97) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - Remove `demo-docs` from `create-tina-app`

## 1.2.2

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

- Updated dependencies [[`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a)]:
  - @tinacms/metrics@1.0.7

## 1.2.1

### Patch Changes

- [#4820](https://github.com/tinacms/tinacms/pull/4820) [`1f9bad5`](https://github.com/tinacms/tinacms/commit/1f9bad55f97d0256e1ddc493587add6b97ca4eff) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - - Created `Logger` class. Moved all pre-defined styles into `Logger`.

  - Moved global variables such as `program` to local space.
  - Updated `preRunChecks` to warn the user if they're using a non-supported version of Node.
  - Replaced `throw new Error('...')` with `exit(1)` to clean up CLI error outputs.
  - Added the ability for the user to `CTRL+C` or `SIGINT` early.
  - Added validation on project name to conform with NPM naming standards.
  - Added error handling around functions that could throw errors. Previously, many errors were being ignored.
  - Added more logs to the CLI tool so the user can remain updated throughout the initialisation process.
  - The `name` and `version` field within the generated `package.json` now reflect what was entered by the user.
  - Linted files.

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

- Updated dependencies [[`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4)]:
  - @tinacms/metrics@1.0.6

## 1.3.0

### Minor Changes

- 6d6ca77: - Added `--pkg-manager` option to `create-tina-app` cli.
  - Renamed `--example` option to `--template` for `create-tina-app` cli.
  - Added GitHub action to build / test starter templates using `create-tina-app`.

## 1.2.0

### Minor Changes

- 324950a: Updates Plate Editor to latest version 36.

  - Upgrades all remaining packages `Typescript` to version `^5`
  - Adds Shadcn/ui styles/colours to our `tinatailwind` config (`packages/@tinacms/cli/src/next/vite/tailwind.ts`)
  - Replaces some `lodash` deps with either the specific function i.e. `lodash.set` or implements them in a utility file
  - Updates and removes old version of plate (`plate-headless`) for latest version `^36`
  - Starts removing and cleaning up some of the old Plate code.

### Patch Changes

- @tinacms/metrics@1.0.5

## 1.1.6

### Patch Changes

- af3c593: Updates tar and other packages. Leaves chalk at version 4 due to esm issue with chalk 5.

## 1.1.5

### Patch Changes

- e58b951: update vulnerable packages so npm audit does not complain
- 9076d09: update next js version from 12 to 14 in tinacms packages
- Updated dependencies [e58b951]
- Updated dependencies [9076d09]
  - @tinacms/metrics@1.0.5

## 1.1.4

### Patch Changes

- 2940594: Add pnpm option to create-tina-app
- 82ab066: upgrade vulnerable packages in example project, test project and peer dependency packages
- Updated dependencies [2940594]
  - @tinacms/metrics@1.0.4

## 1.1.3

### Patch Changes

- 789ecba: create-tina-app - Change from 'Tailwind starter' to 'NextJS starter'

## 1.1.2

### Patch Changes

- bce9ae1: Create-tina-app - Revert back to using require

## 1.1.1

### Patch Changes

- 0503072: update ts, remove rimraf, fix types
- dffa355: Remove yarn for pnpm
- Updated dependencies [0503072]
- Updated dependencies [dffa355]
  - @tinacms/metrics@1.0.3

## 1.1.0

### Minor Changes

- 011571c8a: Added demo docs starter

### Patch Changes

- @tinacms/metrics@1.0.2

## 1.0.5

### Patch Changes

- 11b09eb89: TinaCLI - added descriptions for starter templates

## 1.0.4

### Patch Changes

- a9e04bf33: feat: Add docusaurus starter to cli
  - @tinacms/metrics@1.0.2

## 1.0.3

### Patch Changes

- efd56e769: Remove license headers
- Updated dependencies [efd56e769]
  - @tinacms/metrics@1.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [4ebc44068]
  - @tinacms/metrics@1.0.1

## 1.0.1

### Patch Changes

- c91bc0fc9: Tweak CLI styling for create-tina-app, tinacms dev, and tinacms init

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

### Patch Changes

- Updated dependencies [958d10c82]
  - @tinacms/metrics@1.0.0

## 0.2.0

### Minor Changes

- 0fb26ac91: Updated to use new init for iframe way of editing.

## 0.1.9

### Patch Changes

- 03aa3e09e: Remove the use of ESM package, which allowed CJS scripts to run as ES modules. This was initially used for yarn pnp support but is no longer necessary.
  - @tinacms/metrics@0.0.3

## 0.1.8

### Patch Changes

- 4deaf0d54: fix: fix windows directory creation

## 0.1.7

### Patch Changes

- b369d7238: Update dependencies to fix vulnerabilities in external packages.

## 0.1.6

### Patch Changes

- Updated dependencies [ef450a53a]
  - @tinacms/metrics@0.0.3

## 0.1.5

### Patch Changes

- 9f609eb09: Warn user when using node version 15
  - @tinacms/metrics@0.0.2

## 0.1.4

### Patch Changes

- a05546eb4: Added basic open source telemetry

  See [this discussion](https://github.com/tinacms/tinacms/discussions/2451) for more information and how to opt out.

- Updated dependencies [8bf0ac832]
- Updated dependencies [a05546eb4]
  - @tinacms/metrics@0.0.2

## 0.1.3

### Patch Changes

- d0ac25b73: Update link for bare bones starter

## 0.1.2

### Patch Changes

- 371fc73dd: remove tailwind site builder from list of starters

## 0.1.1

### Patch Changes

- 127b0ae5d: Use the github URL instead of the local copy
- 10a36f3a0: Fix issue where startup time was very slow

## 0.1.0

### Minor Changes

- e792dd0fd: Added basic Create Tina App
