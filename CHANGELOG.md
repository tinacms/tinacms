# Change Log

All notable changes to this project will be documented in this file.

Note: For tinacms package changes, please refer to the [CHANGELOG.md](https://github.com/tinacms/tinacms/packages/tinacms/CHANGELOG.md) located in `/packages/tinacms/`.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.43.1](https://github.com/tinacms/tinacms/compare/v0.43.0...v0.43.1) (2021-07-13)

### Bug Fixes

- **react-tinacms-github:** Makes form-builder a peerDependency ([0e2174c](https://github.com/tinacms/tinacms/commit/0e2174ceef97ecd507e0a13d1f6a23cc7e843064))

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

### Bug Fixes

- **react-tinacms-editor:** fixing FocusRingOptions import path ([7096add](https://github.com/tinacms/tinacms/commit/7096add5f5915ac69f90682d00d73dc1e739ffd5))
- **react-tinacmseditor:** fixing FocusRingOptions import path ([6c231e3](https://github.com/tinacms/tinacms/commit/6c231e3b7b6f7221e691ca8aae3ee2d96634bff6))

### Features

- **react-tinacms-inline:** InlineBlocks children ([00d5804](https://github.com/tinacms/tinacms/commit/00d580492370714096c051761b90cea013dc7644))
- **tinacms:** customize list error message by throwing a MediaListError ([5aff1da](https://github.com/tinacms/tinacms/commit/5aff1da8e725ad4046bf1888fa83599c3ef0a4c5))

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- Unifies FormOptions across all useForm(...) variations ([ff3c058](https://github.com/tinacms/tinacms/commit/ff3c058496ab0b0979540e49a1391a506f4a34a3))
- **@tinacms/form-builder,@tinacms/react-forms:** Combines FormView and FormBuilder ([8b1e194](https://github.com/tinacms/tinacms/commit/8b1e1942c956f822c39b47873661248fb808d893))
- **@tinacms/git-client:** Migrate GitMediaStore to cursor-based pagination ([8d2146c](https://github.com/tinacms/tinacms/commit/8d2146ccb36516b42bbe8b01bb5e31eb955b0635))
- **react-tinacms-github:** Migrate GithubMediaStore to cursor-based pagination ([5163fad](https://github.com/tinacms/tinacms/commit/5163fad6023ac133668736262c5c9732dfdd2c6d))
- **react-tinacms-strapi:** Migrate StrapiMediaStore to cursor-based pagination ([646151f](https://github.com/tinacms/tinacms/commit/646151f73d65a8b862827a1e2eb241ff8df856a6))
- **tinacms:** configure media mgr page size via mediaOptions.pageSize ([5d7890f](https://github.com/tinacms/tinacms/commit/5d7890f5312e5efa08a07cd7fc4e3967d71eccf3))
- **tinacms:** remove pluggable pagination ([846b516](https://github.com/tinacms/tinacms/commit/846b51621aa85520724817192f8d8ade19c1b02a))
- **tinacms:** use cursor-based pagination in media manager ([7a94b97](https://github.com/tinacms/tinacms/commit/7a94b97e228ffd490a68159d458130e089dd6c87))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

### Bug Fixes

- **bug:** disables form save button if field fails validation ([e829ffa](https://github.com/tinacms/tinacms/commit/e829ffa6756a22b58c9de9403895d76696d224fe))

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

### Bug Fixes

- **@tinacms/fields:** Better handling for default formats ([af3496d](https://github.com/tinacms/tinacms/commit/af3496d47b865e2d2e08693cff5b7270aea8eebd))

### Features

- Updates default format to be more standards compliant ([3617ea6](https://github.com/tinacms/tinacms/commit/3617ea67c07be2d155a8bd5ba2b2a21ed9923006))
- **@tinacms/fields:** Adds date field to default plugins ([8ac27d1](https://github.com/tinacms/tinacms/commit/8ac27d12bcc488a73f75b214b718da111e185d28))

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

### Bug Fixes

- **@tinacms/react-sidebar:** disable "create" button while waiting for submit response ([1acc297](https://github.com/tinacms/tinacms/commit/1acc297d6d61adc8ddde930ebe562711d82a608c))

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

### Bug Fixes

- alert container click blocking ([4d3f8ed](https://github.com/tinacms/tinacms/commit/4d3f8ed285a04f6dd75bdc707fbd8bb5a0fe06ba))
- Changes 30px to 1.5rem ([63e7f71](https://github.com/tinacms/tinacms/commit/63e7f716e7a957577c33dd642df2e68dd7f07888))
- Check for \$GH_TOKEN when releasing ([c8c8fc9](https://github.com/tinacms/tinacms/commit/c8c8fc988a98299bc62dc3e74f365b509438149f))
- **@tinacms/fields:** Fixes width for list selects ([2d0f991](https://github.com/tinacms/tinacms/commit/2d0f991d235ac9d9a959326dcad28ad64d0f8fde))
- do not recreate FormPortal on a ref value change ([7fade9a](https://github.com/tinacms/tinacms/commit/7fade9a7aed39e27f1ec8d440fca25f1b1976e76))
- Docs & Nuke.sh ([da36b61](https://github.com/tinacms/tinacms/commit/da36b619789dc8caa8041871b11291b64d80fcb7))
- switched to style prop to set zIndex ([3376dcd](https://github.com/tinacms/tinacms/commit/3376dcdd5023fdc51d217287fdfa9728dc20a668))
- the same mistake with MenuPortal ([94690b3](https://github.com/tinacms/tinacms/commit/94690b33c210f85b051d090d84c5f675f53ce87c))

### Features

- drag to resize sidebar ([5c6b370](https://github.com/tinacms/tinacms/commit/5c6b3700b0a165a0af600ec3bb21c9f271374fd4))

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- close on click outside ([462e09f](https://github.com/tinacms/tinacms/commit/462e09f57ed2fa63c13120356d6c36e7f8f78ba5))
- **dangerfile:** Updates dangerfile ([7badcb5](https://github.com/tinacms/tinacms/commit/7badcb591485985becc1641e4f3afa4f835b0418))
- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- copyright ([c916b63](https://github.com/tinacms/tinacms/commit/c916b63531e7f16bfaf282917e8026815f491ea1)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- **@tinacms/fields:** Fix Radio Final Form Warning ([03cf71b](https://github.com/tinacms/tinacms/commit/03cf71bc5dd04364727e8d54ff65cbf60e3da675))
- modal x button cancels changes ([258d190](https://github.com/tinacms/tinacms/commit/258d19006ba4518fae3ab97b27e95fea19c1ffe9))
- **@tinacms/react-sidebar:** Allows initialValues for ContentCreator Plugins ([7562809](https://github.com/tinacms/tinacms/commit/756280929033e885955f5de4d6653d6efa553bc4))
- **next-tinacms-markdown:** Fixes fileRelativePath for useMarkdownForm ([6ce43fc](https://github.com/tinacms/tinacms/commit/6ce43fc609bb38b67fbeaf192846e3aa4d1e4856))
- **react-tinacms-github:** fix missing unique "key" prop in modal actions ([475bafa](https://github.com/tinacms/tinacms/commit/475bafae0a825e909bcf88bb826d913b960a0c4f))
- **tinacms:** Fixes pagination for MediaStore ([5e51cbe](https://github.com/tinacms/tinacms/commit/5e51cbe9086df2540453295c86bb12575574a2ad))
- inline group click event bug ([15c8675](https://github.com/tinacms/tinacms/commit/15c8675b600b882f8812f6d83c7b1a5c8f94dd01))

### Features

- inline block search ([3080eac](https://github.com/tinacms/tinacms/commit/3080eacbe85bfa8fbe7ab7a284c294dce26fd4e9))
- **react-tinacms-github:** Add WatchableFormValues argument to useGithubFileForm, useGithubJsonForm, useGithubMarkdownForm ([51ce6f3](https://github.com/tinacms/tinacms/commit/51ce6f3301b0487219611430849ab54ad39fcb25))
- **tinacms:** export independent components for CMS provider and UI ([c8bd31e](https://github.com/tinacms/tinacms/commit/c8bd31efdd5966af0dffa3d36e3618cf6ea3e02a))

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

### Bug Fixes

- typo in GithubUploadResponse type ([1c14cff](https://github.com/tinacms/tinacms/commit/1c14cffae83eade3887d865fc33783dd6c9f53d7))

### Features

- **react-tinacms-inline:** add RBIE feature flag plugin ([cc63851](https://github.com/tinacms/tinacms/commit/cc63851430c5e0c2555504d9f726233a47011c8d))
- **react-tinacms-inline:** add useFieldRef hook ([49be9d2](https://github.com/tinacms/tinacms/commit/49be9d210f2ea6d61afd218a0dbf0a6e98e896f8))

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

### Bug Fixes

- check if cleanup is needed before cleaning up ([bbdc166](https://github.com/tinacms/tinacms/commit/bbdc166190446311ea3374e1db92246beae24da9))
- **react-tinacms-inline:** Fix ability to clear field selection, closes [#1725](https://github.com/tinacms/tinacms/issues/1725) ([3e8aab4](https://github.com/tinacms/tinacms/commit/3e8aab4f324454752e2a88d99e9bdf869c26447f))
- radio group name attr ([996c468](https://github.com/tinacms/tinacms/commit/996c468030a9e1f00dc91b8d4e05ba1d5bad1de1))

### Features

- radio group field ([7b53a64](https://github.com/tinacms/tinacms/commit/7b53a649edd35b50522ec70b1ea968bc8e8f6c99))

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

### Bug Fixes

- **react-tinacms-inline:** dep constraint syntax ([c9c3f05](https://github.com/tinacms/tinacms/commit/c9c3f057ffc3ed0dc54f5ee469cf70dab8885d4f))

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

### Bug Fixes

- **@tinacms/react-sidebar:** fixed site elements relative to SiteWrapper ([2f5c75c](https://github.com/tinacms/tinacms/commit/2f5c75c1323d94c033d30c195370254eb5fcffc2))
- **@tinacms/react-sidebar:** fixed site elements relative to SiteWrapper ([de2e1f7](https://github.com/tinacms/tinacms/commit/de2e1f711c87803cf9d161891ea0eb056796b25e))
- **react-tinacms-github:** Fix reversed error messages for 404 errors ([7e3ba86](https://github.com/tinacms/tinacms/commit/7e3ba861a176f7289791391f3c1a70f38ca54240))

### Features

- **react-tinacms-github:** GithubFile: Support committing newly created files ([d13eb76](https://github.com/tinacms/tinacms/commit/d13eb761d805e212cd498f69bc72270efd3115f0))
- **react-tinacms-inline:** inline block duplicate action ([0b79ecf](https://github.com/tinacms/tinacms/commit/0b79ecf468b7ad9c35cb5cd9696e144ffc456a4f))

## [0.35.1](https://github.com/tinacms/tinacms/compare/v0.35.0...v0.35.1) (2021-01-19)

### Bug Fixes

- **react-tinacms-github:** Fix types for form hooks ([b937ed1](https://github.com/tinacms/tinacms/commit/b937ed1a4c201cfab6621bcf4f6f706e7efb33ad))

# [0.35.0](https://github.com/tinacms/tinacms/compare/v0.34.0...v0.35.0) (2020-12-15)

### Bug Fixes

- **react-tinacms-github:** restore original functionality for github:branch:checkout ([8060075](https://github.com/tinacms/tinacms/commit/806007583c7d5ed2aa3ac3fc65f15776c6cefadc))
- **react-tinacms-inline:** [#1640](https://github.com/tinacms/tinacms/issues/1640) support defaultItem as a function in add-block-menu.tsx ([85acb9d](https://github.com/tinacms/tinacms/commit/85acb9d493a0ea4f7d7df839f69ab0fbb2deecad))

### Features

- add inline block label ([af24e52](https://github.com/tinacms/tinacms/commit/af24e52754082354fe9297d7b5204f6dcc5f2647))
- Use custom actions in BlocksControls ([d01e14a](https://github.com/tinacms/tinacms/commit/d01e14a56db03ad2484527fdbb14ec58a5de52f3))

### Reverts

- Revert "docs: update/fix demo run command" ([d386ea4](https://github.com/tinacms/tinacms/commit/d386ea4db4cde95bf83c146a0a4b4930de756592))

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

### Bug Fixes

- **@tinacms/fields:** input doesn't unset all styles ([8386e4f](https://github.com/tinacms/tinacms/commit/8386e4f5a0cb1701c0a807d62f40c7144d0b3561))
- **@tinacms/react-core:** useForm refreshes data on github branch change ([d16ef76](https://github.com/tinacms/tinacms/commit/d16ef762d75d2b7845049357431c125ed9ce55ff))
- **react-tinacms-github:** only send branchchange event when branch actually changes ([6580c8a](https://github.com/tinacms/tinacms/commit/6580c8afa247e3d6a1beb9d7e4967b45c130fa1e))

### Features

- **@tinacms/react-core:** useForm returns its loading state ([f287275](https://github.com/tinacms/tinacms/commit/f28727510520d44eee82fa1c1a0f7fb466ec2cbd))
- **tinacms:** media manager dropzone accepts multiple files ([179eec6](https://github.com/tinacms/tinacms/commit/179eec60ff25366d10e2657784dab32a1b900ea1))

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

### Bug Fixes

- **@tinacms/core:** unsubscribe from events when replacing api ([5ad8dee](https://github.com/tinacms/tinacms/commit/5ad8dee27eddd81b347baeb033f366c443471186))
- **@tinacms/fields:** onClear function clears the input ([73cd850](https://github.com/tinacms/tinacms/commit/73cd850df61ca5c257cd4a03d0ec01de55d45bab))
- **react-tinacms-inline:** better control InlineBlocks rerenders ([611fc70](https://github.com/tinacms/tinacms/commit/611fc70eaba95168db9531f35d283d69dfe56e05))
- **react-tinacms-inline:** stop focus event bubble before returning early ([698e0b5](https://github.com/tinacms/tinacms/commit/698e0b5d1573087068ed5517d22a7f3cede5ac74))
- **tinacms:** remove yarn.lock ([d304dd5](https://github.com/tinacms/tinacms/commit/d304dd5112d135d3a2abd57925ad5def1cfae76f))

### Features

- **@tinacms/fields/toggle:** add optional true/false labels ([850d875](https://github.com/tinacms/tinacms/commit/850d87518cab21806f949b5f14f2658da271dd92))
- **react-tinacms-editor:** InlineWysiwyg only renders ProseMirror for focused editor ([24a3372](https://github.com/tinacms/tinacms/commit/24a3372e83dd51faad0fa0fa480a716ab140c7b8))
- **react-tinacms-inline:** Export SettingsModal ([ba5e03e](https://github.com/tinacms/tinacms/commit/ba5e03e8403d52b0b9ffcc068af7e3cbf845cfa6))
- **react-tinacms-inline:** FocusRing accepts render-child ([e1cc04c](https://github.com/tinacms/tinacms/commit/e1cc04c76898a800e2a792ba210e305bddbc9771))
- **react-tinacms-inline:** InlineGroup field names are relative ([57bcb3d](https://github.com/tinacms/tinacms/commit/57bcb3d2f70deec3f96437054d678b2551a559e6))
- **tinacms:** expose plugin handle for media pagination ([4b4345b](https://github.com/tinacms/tinacms/commit/4b4345bc2047de88a4d0473ad2e4674182972f0b))

### Performance Improvements

- **react-tinacms-inline:** don't render block menu when block not active ([2b26b8a](https://github.com/tinacms/tinacms/commit/2b26b8a5c7a64b64e10f4faebc8712c0832218a5))

## [0.32.1](https://github.com/tinacms/tinacms/compare/v0.32.0...v0.32.1) (2020-10-29)

### Bug Fixes

- **next-tinacms-github:** correct typedef path ([2ac9a52](https://github.com/tinacms/tinacms/commit/2ac9a528659eb7129c40fa9344df1482ceb0c2fc))
- **next-tinacms-github:** fix build artifacts ([771c03f](https://github.com/tinacms/tinacms/commit/771c03faf3d7e498842c943b8c063dc9c3bbee9f))
- **react-tinacms-editor:** correct typedef path ([064e5fe](https://github.com/tinacms/tinacms/commit/064e5fe33365a4daddbedcfe6505ac62d6185d38))
- **react-tinacms-editor:** fixes menu jumping to top on scroll ([47fb08f](https://github.com/tinacms/tinacms/commit/47fb08fe8ef1a592ba5384c3f6d37f8227cec46f))

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

### Bug Fixes

- **@tinacms/core:** cms.media.open accepts the allowDelete prop ([9364732](https://github.com/tinacms/tinacms/commit/9364732f80baf29dabaf4f2a315c8a04b5ac5dc2))
- **@tinacms/fields:** image field allows media to be deleted from media manager ([7dfbb5e](https://github.com/tinacms/tinacms/commit/7dfbb5eb0a551c429ec2a5f8564b1bd626cd893f))
- **gatsby-tinacms-json:** JsonCreator commits files after writing ([a252c13](https://github.com/tinacms/tinacms/commit/a252c1389b2b93743c4f8ee8d4abe8fabbd6dd56))
- **gatsby-tinacms-remark:** RemarkCreator commits files after writing ([2b8780c](https://github.com/tinacms/tinacms/commit/2b8780cb0050aaeef2add51b26f96f36680750ba))
- **react-tinacms-github:** dispatch event on delete failurecloses [#1493](https://github.com/tinacms/tinacms/issues/1493) ([12d92dc](https://github.com/tinacms/tinacms/commit/12d92dc2220ec326e1e3ec7a59a8d6ab96e9f988))
- **react-tinacms-inline:** empty inline img to click/drag ([c879441](https://github.com/tinacms/tinacms/commit/c879441541a955d3e3d33c4f30c35a2b8cfbf92a))
- **react-tinacms-inline:** field focus is not lost when editing settings ([8a078b4](https://github.com/tinacms/tinacms/commit/8a078b4f9b5138c7821f859511cc53d618b93366))
- **react-tinacms-inline:** inline image field allows media to be deleted from media manager ([352284f](https://github.com/tinacms/tinacms/commit/352284f8fdeb13b145ce54d0b3359a7076353284))
- **react-tinacms-inline:** some fields were mis-handling focus ([5d7318c](https://github.com/tinacms/tinacms/commit/5d7318c0ccdfe89709f2e8bc7d1c8f8d3a115019)), closes [#1516](https://github.com/tinacms/tinacms/issues/1516)
- **react-tinacms-inline:** uploadDir passes formValues ([99de78a](https://github.com/tinacms/tinacms/commit/99de78acd9768358fc2b43ba0f52d63b07db9988))
- **tinacms:** media manager upload button is busy while uploading ([3ab978c](https://github.com/tinacms/tinacms/commit/3ab978c43a11ba64f9db2122e94431f48d1b93c3))

### Features

- **@tinacms/react-core:** useCMSEvent makes subscribing to events easier ([2a276bf](https://github.com/tinacms/tinacms/commit/2a276bf531b4b863cce4740bde18f31d8be3289f))
- **react-tinacms-editor:** image directory prop --> uploadDir func ([67fc8d9](https://github.com/tinacms/tinacms/commit/67fc8d97befbea7e08751d5625103d8d3553046d))
- **react-tinacms-editor:** markdown & html fields accept image props ([06d92e1](https://github.com/tinacms/tinacms/commit/06d92e138365bd73cae2daa20d8a116d7da6f4e0))
- **react-tinacms-editor:** media mgr opens from uploadDir ([7e1b133](https://github.com/tinacms/tinacms/commit/7e1b1330d8fe777469d13fe65f43c75259c9e288))
- **react-tinacms-editor:** parse accepts media object ([f6cf123](https://github.com/tinacms/tinacms/commit/f6cf123039669c477aef6176cdc4187b80eaf19d))
- **react-tinacms-editor:** wysiwyg menu opens media mgr ([026e633](https://github.com/tinacms/tinacms/commit/026e633d97d5462f4d020ce87ca15735c3c08cc7))
- **react-tinacms-inline:** block components are given their name ([8d42e9a](https://github.com/tinacms/tinacms/commit/8d42e9abbfb98bd50bd7dc1913fa3d8bc799972c)), closes [#1536](https://github.com/tinacms/tinacms/issues/1536)

### Reverts

- Revert "chore(react-tinacms-editor): mediaDir not optional" ([af20d84](https://github.com/tinacms/tinacms/commit/af20d849d11da5c93b453b8a63f9e6d9bee92363))

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Bug Fixes

- **@tinacms/forms:** catch errors after submit ([2550a81](https://github.com/tinacms/tinacms/commit/2550a816ca7c4e99ea4965a179431510a9ca333f))
- missing key names ([798ed84](https://github.com/tinacms/tinacms/commit/798ed847b327ba2fe5cadf8be9a263c2e04b7220))
- svg attribute names ([7e06179](https://github.com/tinacms/tinacms/commit/7e06179fb1c54e04e286af946a618513fdeca19d))
- **@tinacms/forms:** the Form#fields array is now optional ([e3d71bf](https://github.com/tinacms/tinacms/commit/e3d71bf426e0d8e40076fc1e161350f9fe469543))
- **@tinacms/media:** deprecated since these interfaces were graduated to core ([39f1a72](https://github.com/tinacms/tinacms/commit/39f1a729a112fbab24af4c1e319cdc94867325aa))
- **@tinacms/react-alerts:** increase z-index ([94d67bb](https://github.com/tinacms/tinacms/commit/94d67bbb67588d08a6e926d70b1d3f55a34bc8bf)), closes [#1503](https://github.com/tinacms/tinacms/issues/1503) [#1055](https://github.com/tinacms/tinacms/issues/1055)
- **@tinacms/react-screens:** ModalBody is padded ([3df3c55](https://github.com/tinacms/tinacms/commit/3df3c5545072840c8f1be58ebf09535a6f86197d))

### Features

- **@tinacms/alerts:** events can be mapped to alerts automatically ([b96e8b9](https://github.com/tinacms/tinacms/commit/b96e8b9624f7afc53fc87ebdf5af08465fb419cd))
- **@tinacms/api-git:** GET /:relPath returns content list for directories ([c613b20](https://github.com/tinacms/tinacms/commit/c613b208b6387f5e2e31c70dd1bc747dd6ddb491))
- **@tinacms/api-git:** the GET /:relPath endpoint returns contents of directories ([9fa7bf8](https://github.com/tinacms/tinacms/commit/9fa7bf8c59a3cba99238138860a9bc2d52dee5d5))
- **@tinacms/core:** add cms.media.open top make showing the media manager easier ([eea3081](https://github.com/tinacms/tinacms/commit/eea3081ce8ad65b773b6843d60604bb4cd389576))
- **@tinacms/core:** cms.media async methods dispatch events ([9196bdf](https://github.com/tinacms/tinacms/commit/9196bdff6723f64e18426f90208837bfb1a93ec1))
- **@tinacms/core:** MediaStore#previewSrc accepts fieldPath and formValues ([e2bf27b](https://github.com/tinacms/tinacms/commit/e2bf27b436b6fc6b5e0b359142fed352c10fb2e0))
- **@tinacms/core:** promoted @tinacms/media classes to core ([5288dc1](https://github.com/tinacms/tinacms/commit/5288dc175db068a2b3cf5800bee66aa180369d92))
- **@tinacms/core:** the MediaStore interface has a delete method ([4c1cf5a](https://github.com/tinacms/tinacms/commit/4c1cf5af1b2b10143bf5c2aa4858b108507b3028))
- **@tinacms/events:** EventBus#subscribe can accept an array of event names ([63ef4db](https://github.com/tinacms/tinacms/commit/63ef4dbd5b17ccbae655b4d9f4962d08b288467f))
- **@tinacms/fields:** clicking on ImageField opens the media picker ui ([7bb8fdb](https://github.com/tinacms/tinacms/commit/7bb8fdb91f482ab5ec307bbffdbc31f4fcc16e08))
- **@tinacms/fields:** ImageFieldPlugin matches new MediaStore#previewSrc api ([76e5b04](https://github.com/tinacms/tinacms/commit/76e5b04151582087ec6538ebadf65fe6ad2ca5b7))
- **@tinacms/fields:** ImageUpload parse returns the whole media object ([94ee917](https://github.com/tinacms/tinacms/commit/94ee917e19061828ddbbb857dc1513eb61da49f5)), closes [#1453](https://github.com/tinacms/tinacms/issues/1453)
- **@tinacms/fields:** the uploadDir function is now optional for image fields ([6095caf](https://github.com/tinacms/tinacms/commit/6095caf5355c811f6bbb9cdd2a7e640b82ae4735))
- **@tinacms/git-client:** GitMediaStore implements delete ([6b6efdb](https://github.com/tinacms/tinacms/commit/6b6efdbb8bd1c72cd5a6045bb832c19b6c105f3c))
- **@tinacms/git-client:** the GitMediaStore implements list ([26ceadd](https://github.com/tinacms/tinacms/commit/26ceadd7b67fe0abf0085f647fad454e274f4c5b))
- **@tinacms/icons:** adds media mgr folder & file icons ([81f1191](https://github.com/tinacms/tinacms/commit/81f1191886088288b71a957c4c984983eaa0dfdd))
- **@tinacms/media:** add optional previewSrc to Media interface ([664701e](https://github.com/tinacms/tinacms/commit/664701e912f11c554f7852eed608f28f3dafd00e))
- **@tinacms/media:** added id property to Media interface ([95ce72c](https://github.com/tinacms/tinacms/commit/95ce72ca76c69d4838efdef0cc196957d9107ff6))
- **@tinacms/media:** cms.media has all of the MediaStore methods ([97b080b](https://github.com/tinacms/tinacms/commit/97b080b90f246f312aefc11d396ec2cde207ef36)), closes [#1458](https://github.com/tinacms/tinacms/issues/1458)
- **@tinacms/media:** cms.media has all of the MediaStore methods ([6109f74](https://github.com/tinacms/tinacms/commit/6109f74b41c315b4800a7764e26b92e3f61f1197)), closes [#1458](https://github.com/tinacms/tinacms/issues/1458)
- **@tinacms/media:** The media in the store can be listed ([8704c29](https://github.com/tinacms/tinacms/commit/8704c290d6161606fb8dae661714dd64d720c686)), closes [#1451](https://github.com/tinacms/tinacms/issues/1451)
- **@tinacms/media:** the Media interface now has a 'type' prop that can be 'file' or 'dir' ([1a867cf](https://github.com/tinacms/tinacms/commit/1a867cfb53b5e6accbdc5e63a41c401fee2ed2d7))
- **next-tinacms-github:** Add NextGithubMediaStore ([357dcd8](https://github.com/tinacms/tinacms/commit/357dcd85a12e1687fa03104ada2e4a1ba3bba49b))
- **react-tinacms-github:** add GithubClient#commit(branch, repo?) ([d62bc3b](https://github.com/tinacms/tinacms/commit/d62bc3bc5cd5dd06935ec8237005039eb817bfee))
- **react-tinacms-github:** GithubMediaStore implements MediaStore#delete ([1c5ded9](https://github.com/tinacms/tinacms/commit/1c5ded9334749ac7905068546eec397a886a9063))
- **react-tinacms-github:** GithubMediaStore implements MediaStore#list ([a963189](https://github.com/tinacms/tinacms/commit/a963189740e9ded9d753fb5bec95a7011350b3a7))
- **react-tinacms-inline:** adds inline image style extension ([f4348e5](https://github.com/tinacms/tinacms/commit/f4348e583f0ec794b8b45483cd8456ab4e9160a2))
- **react-tinacms-inline:** image children only receive src ([9b48aa6](https://github.com/tinacms/tinacms/commit/9b48aa68874fdfe9ce567f47b5945a9365c888aa))
- **react-tinacms-inline:** inline img accepts alt ([e576838](https://github.com/tinacms/tinacms/commit/e5768385f878418353fa1c108632290e4c3f8c1a))
- **react-tinacms-inline:** InlineField accepts parse and format functions ([8d62b8e](https://github.com/tinacms/tinacms/commit/8d62b8e65cae511118c16a4f4427672b0812bcd9))
- **react-tinacms-inline:** InlineImage parse accepts a Media rather then a string ([3be3e16](https://github.com/tinacms/tinacms/commit/3be3e166b83e1ba60a041898c9b0165310cbb623))
- **react-tinacms-inline:** InlineImageField#previewSrc matches MediaStore API ([aeb0cd5](https://github.com/tinacms/tinacms/commit/aeb0cd5f5a717f035074e1406556b621c5e874f3))
- **react-tinacms-inline:** uploadDir on InlineImageField is now optional ([4259804](https://github.com/tinacms/tinacms/commit/425980478046e50620ce2b6441b4db68d1e0223c))
- **react-tinacms-strapi:** the StrapiMediaStore implements MediaStore#delete ([157d1fc](https://github.com/tinacms/tinacms/commit/157d1fcc7f86e5a1064875d68cad743cb4c1a08d))
- **react-tinacms-strapi:** the StrapiMediaStore now implements MediaStore#list ([d851296](https://github.com/tinacms/tinacms/commit/d851296fb899e87394c358bba20c436a74e5c238))
- **tinacms:** add media manager UI ([4f0cf96](https://github.com/tinacms/tinacms/commit/4f0cf9631afe68d0b5204aabb66085a2a2291b24))
- **tinacms:** added a default MediaManager screen ([dc33594](https://github.com/tinacms/tinacms/commit/dc33594c227afd884d5078af53f9340277734bca))
- **tinacms:** an alerts map can be provided to TinaCMS constructor ([fcee016](https://github.com/tinacms/tinacms/commit/fcee01604bb6ae08b126c7903c8d90601adf92e5))
- **tinacms:** apis can define their own event-to-alerts map ([24a9305](https://github.com/tinacms/tinacms/commit/24a93059a0abe7930a4f301fa447de162d19fd5c))

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
