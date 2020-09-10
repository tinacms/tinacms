# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.30.0](https://github.com/tinacms/tinacms/compare/v0.29.0...v0.30.0) (2020-09-10)

### Bug Fixes

- link modal keybaord shortcut ([96de0de](https://github.com/tinacms/tinacms/commit/96de0de62710dc897f6f5de6c615a49a1f8e6829))
- wysiwym image modal issues ([4473310](https://github.com/tinacms/tinacms/commit/447331019878289471a2f0e885d47b7e8a05c4b7))
- wysiwym table and link modal ([5965e12](https://github.com/tinacms/tinacms/commit/5965e122b3855defedbba45ab92b2a917af9cd70))

### Features

- **react-tinacms-github:** introduce useGithubClient hook ([2111d70](https://github.com/tinacms/tinacms/commit/2111d70c289684d06eec3aeff89e7a76bd618a23)), closes [#1436](https://github.com/tinacms/tinacms/issues/1436)
- keyboard shortcut for toggle editor mode ([03074ac](https://github.com/tinacms/tinacms/commit/03074ac36ca6d542e29883b7f0f21957d9a4b771))

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

### Bug Fixes

- add parse function ([4add855](https://github.com/tinacms/tinacms/commit/4add855928e3557fc9c97985399fe68b640e5931))
- **react-tinacms-inline:** preview src passes form values ([e376424](https://github.com/tinacms/tinacms/commit/e37642482c78182d72bf74eb34e3f1a2a311675f))

### Features

- **next-tinacms-json:** remove deprecated apis ([0a03345](https://github.com/tinacms/tinacms/commit/0a033450d6b6a1137b5a1865daf77c1e24032534))
- **next-tinacms-markdown:** sunset outdated APIs ([8b6e90a](https://github.com/tinacms/tinacms/commit/8b6e90a0405cc031ec46da39dc5e8e640c36d5c6))

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

### Bug Fixes

- multiple instances of components not accepting multiple child elements ([cbbb03d](https://github.com/tinacms/tinacms/commit/cbbb03df7d1c98450355b93e1189cda8811aa5a3))
- **react-tinacms-editor:** prosemirror image plugin is only added if imageProps was was defined ([c29cc4c](https://github.com/tinacms/tinacms/commit/c29cc4c18e1a6b3ca3395cf51f3d274af2be58fb))
- **react-tinacms-editor:** renamed previewUrl to previewSrc to make it consistent with InlineImage component and ImageFieldPlugin ([db55a85](https://github.com/tinacms/tinacms/commit/db55a852ab445f7553b68bf1a9a62d5484afcb9f))
- **react-tinacms-editor:** seevral UX issues addressed for tables, headings, and the link modal ([#1393](https://github.com/tinacms/tinacms/issues/1393)) ([28cfaec](https://github.com/tinacms/tinacms/commit/28cfaec04cfdb63376b04e23113911af00ddad9c))
- **react-tinacms-editor:** when InlineWysiwyg is not given imageProps then images are disabled ([ebefdf1](https://github.com/tinacms/tinacms/commit/ebefdf1a914cdb9a2e2bd0f8ffbfc1dfea2fef52))
- **react-tinacms-github:** an authorized user trying access a deleted branch will be prompted to switch back to the base branch ([137b5ee](https://github.com/tinacms/tinacms/commit/137b5ee01ef289cf3a26ceae2e2d0c327fd9b1ea))
- **react-tinacms-github:** improved error modals on 404s ([4a998fc](https://github.com/tinacms/tinacms/commit/4a998fc79436b504fcfada4c80de1249b34a899a))

### Features

- **@tinacms/core:** events from APIs are dispatched to the entire CMS ([1a47d0b](https://github.com/tinacms/tinacms/commit/1a47d0b85ac0aedc65a26caed5fea6dc5d0f7f2a))
- **@tinacms/fields:** ImageFieldPlugin will default to useing cms.media.store for previewSrc ([a4f377c](https://github.com/tinacms/tinacms/commit/a4f377c90f7fc8b895c9e116a56a2752d8a9ae93))
- **@tinacms/media:** MediaStore's can have an optional previewSrc method ([e4024d2](https://github.com/tinacms/tinacms/commit/e4024d2404dd833617fed5715c3d1f8fb397ee46))
- **react-tinacms-editor:** by default InlineWysiwyg will use cms.media.store for the previewUrl ([d7dbda7](https://github.com/tinacms/tinacms/commit/d7dbda72954a28c3e990790b3656485e89004c37))
- **react-tinacms-editor:** InlineWysiwyg expects imageProps.parse to modify the filename before inserting the img tag ([1738671](https://github.com/tinacms/tinacms/commit/17386712e449c21355e44b928f7b06f9bf90c222))
- **react-tinacms-github:** GithubMediaStore implements previewSrc ([325fdb4](https://github.com/tinacms/tinacms/commit/325fdb4ddda710c5b7baf2e0ab3ac4027f572905))
- **react-tinacms-inline:** InlineImage defaults to using cms.media.store.previewSrc ([d050e63](https://github.com/tinacms/tinacms/commit/d050e6301bc2a7e38681d1fb72b31b36283bf920))
- **react-tinacms-inline:** InlineImage now works with an async previewSrc ([91b8995](https://github.com/tinacms/tinacms/commit/91b8995f4741f3aed8aee2fd045242623bc86221))
- **react-tinacms-inline:** InlineText and InlineTextarea will render children instead of input.value when cms.disabled ([1ee29ab](https://github.com/tinacms/tinacms/commit/1ee29abaf526168b06af232ff31bf1fc5bbc01e3))
- **react-tinacms-inline:** InlineTextarea now accepts placeholder ([1be2566](https://github.com/tinacms/tinacms/commit/1be2566a5177cdbf4a439d80ba0ff8d048528d76))
- **react-tinacms-strapi:** StrapiMediaStore implements previewSrc ([fe5df7d](https://github.com/tinacms/tinacms/commit/fe5df7d804d2c0d1b8f21283dd56ab7132d1414d))

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
