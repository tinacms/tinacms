# create-tina-app

## 2.1.2

### Patch Changes

- [#6277](https://github.com/tinacms/tinacms/pull/6277) [`271a1d0`](https://github.com/tinacms/tinacms/commit/271a1d057234346fc127b6f259c766a8b26a603f) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Fix - selected package manager would not be captured as telemetry when passed in as a parameter

## 2.1.1

### Patch Changes

- [#6290](https://github.com/tinacms/tinacms/pull/6290) [`5befd81`](https://github.com/tinacms/tinacms/commit/5befd8147ee64c2590468182df319cd537506d0d) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - 🌎Telemetry - Add GeoIP for opt-in users

## 2.1.0

### Minor Changes

- [#6245](https://github.com/tinacms/tinacms/pull/6245) [`e1eb9ad`](https://github.com/tinacms/tinacms/commit/e1eb9ad156f2bf076d64ff576505e853045c9e13) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - ✨ Add Features to Templates + 🐛 Fix handling of package-name warnings

### Patch Changes

- [#6255](https://github.com/tinacms/tinacms/pull/6255) [`3f57321`](https://github.com/tinacms/tinacms/commit/3f5732147690cd2cf8c1c6eee823502aab25e121) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - 📊 Telemetry - helping us build a better Tina
  We’ve added anonymous telemetry to `⁠create-tina-app`. This helps our team understand which environments (Node version, OS, Package Manager) and starter templates are most popular so we can prioritize the right features and fixes.
  Privacy First: We never collect personal data or project-specific code.
  Opt-out: Prefer to stay off the grid? You can disable this at any time by passing the `⁠--noTelemetry` flag.

- [#6267](https://github.com/tinacms/tinacms/pull/6267) [`20fccf3`](https://github.com/tinacms/tinacms/commit/20fccf37f142dca17b90945a313fd65b70968ac6) Thanks [@wicksipedia](https://github.com/wicksipedia)! - create-tina-app - add structured error codes to find out where people have problems with the installer

## 2.0.0

### Major Changes

- [#6232](https://github.com/tinacms/tinacms/pull/6232) [`bf308a9`](https://github.com/tinacms/tinacms/commit/bf308a9efed89384264f70f4247f81a6a6ea9fcb) Thanks [@JackDevAU](https://github.com/JackDevAU)! - fix(create-tina-app): update create-tina-app package to use esm

### Patch Changes

- [#6216](https://github.com/tinacms/tinacms/pull/6216) [`5c1e891`](https://github.com/tinacms/tinacms/commit/5c1e89181f595d392ad6cb56ca5fc0b6d9e60a23) Thanks [@JackDevAU](https://github.com/JackDevAU)! - - `@tinacms/graphql`: remove scmp dependency, replaced with modern code (now inbuilt)
  - `@tinacms/metrics`: remove isomorphic-fetch dependency, now relies on global fetch
  - `@tinacms/cli`: remove log4js dependency, replaced with custom logger implementation; update chalk to v5 (ESM-only)
  - `@tinacms/scripts`, `create-tina-app`: update chalk to v5 (ESM-only)
  - `next-tinacms-azure`: Buffer to Uint8Array conversion
  - `tinacms`: TypeScript style prop typing
- Updated dependencies [[`5c1e891`](https://github.com/tinacms/tinacms/commit/5c1e89181f595d392ad6cb56ca5fc0b6d9e60a23)]:
  - @tinacms/metrics@2.0.1

## 1.6.2

### Patch Changes

- Updated dependencies [[`2e1535d`](https://github.com/tinacms/tinacms/commit/2e1535dd5495dc390902f2db6ef1f26afb072396)]:
  - @tinacms/metrics@2.0.0

## 1.6.1

### Patch Changes

- [#5822](https://github.com/tinacms/tinacms/pull/5822) [`4b824be`](https://github.com/tinacms/tinacms/commit/4b824be53572f9231753ebd3b5f14fd778fd73d6) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Migrate from react-beautiful-dnd to dnd-kit to fix deprecation error.

- Updated dependencies []:
  - @tinacms/metrics@1.1.0

## 1.6.0

### Minor Changes

- [#6054](https://github.com/tinacms/tinacms/pull/6054) [`6727bcf`](https://github.com/tinacms/tinacms/commit/6727bcf95200e05e8388986de4546f1730a1be47) Thanks [@0xharkirat](https://github.com/0xharkirat)! - fix broken links, from `tina.io/docs/tina-cloud` to `tina.io/docs/tinacloud`

### Patch Changes

- [#6059](https://github.com/tinacms/tinacms/pull/6059) [`b23aa0c`](https://github.com/tinacms/tinacms/commit/b23aa0c5defc51b8f9fe00a59dd87e1d2f8b9f0b) Thanks [@kulesy](https://github.com/kulesy)! - docs: Update references from tina-cloud-starter to tina-nextjs-starter

## 1.5.2

### Patch Changes

- [#5939](https://github.com/tinacms/tinacms/pull/5939) [`8a5ca67`](https://github.com/tinacms/tinacms/commit/8a5ca6745b918c6fe7cb15b4b4f3420fd4b3104d) Thanks [@wicksipedia](https://github.com/wicksipedia)! - fix: cli compatibility with CommonJS

## 1.5.1

### Patch Changes

- [#5937](https://github.com/tinacms/tinacms/pull/5937) [`3f1e88d`](https://github.com/tinacms/tinacms/commit/3f1e88dfed8d597cee7936f9b0c09e6e4a2e4e71) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - fix: added missing devUrl

- [#5624](https://github.com/tinacms/tinacms/pull/5624) [`0e749d5`](https://github.com/tinacms/tinacms/commit/0e749d5bf7bce552da1beadef3772103c55afd67) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - Add TinaDocs to NPX CLI templates

## 1.5.0

### Minor Changes

- [#5929](https://github.com/tinacms/tinacms/pull/5929) [`ec43c87`](https://github.com/tinacms/tinacms/commit/ec43c87a1da55b4cb86e9b428eb39fc0740a9e1f) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Enhanced CLI output with some branded ASCII art
  Refined user experience with clearer messaging and structure
  Added optional --verbose flag (disabled by default) for detailed output

## 1.4.0

### Minor Changes

- [#5744](https://github.com/tinacms/tinacms/pull/5744) [`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be) Thanks [@Ben0189](https://github.com/Ben0189)! - Upgrade Plate editor to v48 beta, integrating latest features and improvements.

### Patch Changes

- Updated dependencies [[`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be)]:
  - @tinacms/metrics@1.1.0

## 1.3.4

### Patch Changes

- [#5594](https://github.com/tinacms/tinacms/pull/5594) [`95a293c`](https://github.com/tinacms/tinacms/commit/95a293cffab73635dc0677ad5277fc84cbf2c507) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - feat: Added `bun` package manager.
  fix: Removed dead code from `install` method.
- Updated dependencies []:
  - @tinacms/metrics@1.0.9

## 1.3.3

### Patch Changes

- [#5565](https://github.com/tinacms/tinacms/pull/5565) [`b4450e7`](https://github.com/tinacms/tinacms/commit/b4450e7ed610eec217429cd85900c5b7956b952f) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Add a message to indicate that the user needs to install Hugo before running “yarn dev”

## 1.3.2

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

- Updated dependencies [[`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571)]:
  - @tinacms/metrics@1.0.9

## 1.3.1

### Patch Changes

- [#5457](https://github.com/tinacms/tinacms/pull/5457) [`4b04107`](https://github.com/tinacms/tinacms/commit/4b04107f9799748f93205a743c393ed22fc5f424) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update template title for Astro Starter

## 1.3.0

### Minor Changes

- [#5433](https://github.com/tinacms/tinacms/pull/5433) [`ba036d7`](https://github.com/tinacms/tinacms/commit/ba036d71bacbcb98f3c7c63eaa4db26f754d8642) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Add Tina Astro Starter template to create-tina-app

### Patch Changes

- [#5411](https://github.com/tinacms/tinacms/pull/5411) [`fe34947`](https://github.com/tinacms/tinacms/commit/fe34947bd9ef0c510f4bf5a4933a375c956d7a92) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - refactor: support a range of node versions instead of specific versions.

## 1.2.5

### Patch Changes

- [#5341](https://github.com/tinacms/tinacms/pull/5341) [`d80714b`](https://github.com/tinacms/tinacms/commit/d80714bd1065f59fe1bb2c7da9dcf114faee5faf) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Remove `got` package

## 1.2.4

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

- Updated dependencies [[`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6)]:
  - @tinacms/metrics@1.0.8

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
