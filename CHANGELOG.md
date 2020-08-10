# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

### Bug Fixes

- **@tinacms/react-sidebar:** adds aria label to sidebar toggle button ([fc2957a](https://github.com/tinacms/tinacms/commit/fc2957a8aa15623c8862aa53d00b4309244ea696))
- **@tinacms/react-sidebar:** sidebar doesn't render when cms is disabled ([c24556d](https://github.com/tinacms/tinacms/commit/c24556d9aab40dfd684e11ccf4d3180c6bd26820))
- **next-tinacms-github:** auth handler sends 500 error when missing signing key ([90b5916](https://github.com/tinacms/tinacms/commit/90b591676c8bdc4b688ac7350a679709f0381f21))
- **next-tinacms-github:** preview handler responds with 500 if signing key is missing ([31273f7](https://github.com/tinacms/tinacms/commit/31273f7acaea7687f577f8eb3961283bb1eb7840))
- **next-tinacms-github:** sends 500 with message if signing key is missing ([002ce35](https://github.com/tinacms/tinacms/commit/002ce356523ef9f6e39f8296827acac8924a3acb))
- **tinacms:** enabling cms with sidebar doesn't remount children ([1188dbf](https://github.com/tinacms/tinacms/commit/1188dbfa5bcaeb0ae9b832b15ad299b5c1ea4c01))

### Features

- **react-tinacms-editor:** InlineWysiwyg imageProps.upload now defaults to using the cms.media.store to upload images ([166f380](https://github.com/tinacms/tinacms/commit/166f380e886e88b9edc90948a4c2ca249244d6a3))
- **react-tinacms-editor:** InlineWysiwyg now accepts imageProps.directory ([f75d130](https://github.com/tinacms/tinacms/commit/f75d130855a24f5a3ccbbb6f19cef0a87e196ad3))
- **react-tinacms-inline:** InlineText now accepts a placeholder prop ([319d29f](https://github.com/tinacms/tinacms/commit/319d29f303bcb38286ec24982030327ec2a44f0f))
- **react-tinacms-inline:** previewUrl is now optionally async ([3aaead3](https://github.com/tinacms/tinacms/commit/3aaead34b759d3c8c12bbef75357a2e0925d2c10))

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

### Bug Fixes

- **gatsby-tinacms-git:** useGitForm#loadInitialValues does not run in production ([a42d50c](https://github.com/tinacms/tinacms/commit/a42d50c041941a06770551b66353c82b72cfddd5))
- **gatsby-tinacms-mdx:** useMdxForm#loadInitialValues does not run in production ([e0c2275](https://github.com/tinacms/tinacms/commit/e0c227542970b0a42be60ec8573216d7a54e9c1e))
- **next-tinacms-json:** useJsonForm#loadInitialValues does not run when cms is disabled ([9fbd8e8](https://github.com/tinacms/tinacms/commit/9fbd8e83d1765a97b747fca441869538137488bb))
- **next-tinacms-markdown:** useMarkdownForm#loadInitialValues does not run when cms is disabled ([3292bf4](https://github.com/tinacms/tinacms/commit/3292bf4bae15ee3c47f474ce46555a1491249d56))

### Features

- **@tinacms/forms:** useForm always runs loadInitialValues ([a624087](https://github.com/tinacms/tinacms/commit/a6240872ce18a514ac954f911f481664e71dbb52))
- **@tinacms/react-core:** a new CMS is disabled by default ([ef3ac08](https://github.com/tinacms/tinacms/commit/ef3ac08d2a701cd1b123cf303b69371f16bf81cc))
- add focus ring to inline wysiwyg ([2768afd](https://github.com/tinacms/tinacms/commit/2768afd1b69bdef2a3dce38dab6b71d002ddbad6))
- tooltips for menubar options ([bd06f11](https://github.com/tinacms/tinacms/commit/bd06f113e750b9845ed7e3a34c519562e665c99d))

# [0.25.0](https://github.com/tinacms/tinacms/compare/v0.24.0...v0.25.0) (2020-07-27)

### Bug Fixes

- **react-tinacms-editor**: table delete icon should be visible only if whole table is selected ([dd3313b](https://github.com/tinacms/tinacms/commit/dd3313b8215ab30ccbdfd377bbd92883570ad8a9))
- **react-tinacms-editor**: table row add delete icons overlapping ([cfa9949](https://github.com/tinacms/tinacms/commit/cfa9949c4580d09481362071e562fd7f795496d0))
- **react-tinacms-editor**: UX improvements hide title input from link modal ([6e5ab20](https://github.com/tinacms/tinacms/commit/6e5ab20631435508b1e16f7261b772008c3dda1d))

### Features

- **react-tinacms-github:** added github delete action docs to readme ([dc58e59](https://github.com/tinacms/tinacms/commit/dc58e590f0fdc4874ed243989d83a795e4930d88))
- **next-tinacms-github:** getGithubFile let's you fetch and parse a file without the entire preview props ([17cb428](https://github.com/tinacms/tinacms/commit/17cb42840b080a671d69ca91ee2b85a57fec6db9))

### New Packages

- **react-tinacms-strapi:** a new package for using Strapi as a backend for your website. [Checkout this guide to learn more!](https://tinacms.org/guides/nextjs/tina-with-strapi/overview)
