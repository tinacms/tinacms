# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
