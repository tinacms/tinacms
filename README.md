# [![TINA CMS](https://res.cloudinary.com/forestry-demo/image/upload/h_46/v1573166832/Tina_CMS_Wordmark.png)](https://tinacms.org) &nbsp; [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Ftinacms.org&text=I%20just%20checked%20out%20@tina_cms%20on%20GitHub%20and%20it%20is%20saweet%21&hashtags=TinaCMS%2Cjamstack%2Cheadlesscms)

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Ftinacms%2Ftinacms%2Fbadge&style=flat)](https://actions-badge.atrox.dev/tinacms/tinacms/goto)
[![Slack](https://img.shields.io/badge/slack-tinacms-blue.svg?logo=slack)](https://tinacms.slack.com)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-48-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Getting Started

- [Website](https://tinacms.org/)
- [Documentation](https://tinacms.org/docs/)
- [Slack](https://tinacms.slack.com)
- [Forum](https://community.tinacms.org/)
- [Roadmap](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
  - [How to Contribute](./CONTRIBUTING.md#How-to-Contribute)
  - [Creating Packages](./CONTRIBUTING.md#Creating-Packages)
  - [Troubleshooting in Development](./CONTRIBUTING.md#Troubleshooting-in-Development)

[![Tina Demo](https://res.cloudinary.com/forestry-demo/video/upload/du_16,w_700,e_loop/v1571159974/tina-hero-demo.gif)](https://tinacms.org/)

## Development

To get started:

```bash
git clone git@github.com:tinacms/tinacms.git
cd tinacms
npm install && npm run bootstrap
npm run build

# Start Gatsby demo
cd packages/demo-gatsby
npm run start
```

**Do not run `npm install` from inside the `packages` directory**

TinaCMS uses [Lerna](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

### Commands

| Commands                           | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| npm run bootstrap                  | Install dependencies and link local packages. |
| npm run build                      | Build all packages.                           |
| npm run watch                      | Watch all packages for rebuilds.              |
| npm run test                       | Run tests for all packages.                   |
| lerna run build --scope \<package> | Build only \<package>.                        |

### Testing With External Projects

Currently, testing with external projects is somewhat inelegant, but this repo includes a folder designed for importing external projects into the monorepo so the development versions of Tina packages can be bootstrapped into the project. To import an external project:

1. `git clone` or simply copy the project into the `packages/@testing` folder. Everything in this folder is ignored by git.
2. In the root of the monorepo, run `npm run bs` to link the necessary development packages
3. Navigate to your project folder and develop normally

**Pitfalls of Testing with External Projects**

- Running `npm run build` in the root of the monorepo will run a `build` script if your project has one defined. If this causes problems (tina may be causing your build to fail in the first place, and you want to skip the build for now but still build the other packages,) you can get around this by either running `lerna run build --ignore=YOUR_PACKAGE_NAME` or adding the name of your package to the `ignore` array for the `run` command in `lerna.json`.

```json
//lerna.json
{
  "command": {
    "run": {
      "ignore": ["YOUR_PACKAGE_NAME"]
    }
  }
}
```

- Gatsby and React both rely on some globally-persisted values which can cause errors if you have multiple copies of these dependencies installed. When testing a Gatsby site, many issues can be worked around by temporarily deleting the `demo-gatsby` package and bootstrapping again.

## Release Process

Tina has two main branches:

- **master:** The bleeding edge of tinacms
- **latest:** The current stable release

The flow of changes therefore looks like:

> `fix-some-bug` => `master` => `latest`

This is a weekly process:

- On Monday `master` is merged into `latest` which is then published to npm.
- Hot fixes are cherry picked onto `latest` and then published.
- Prereleases are created off of `master` whenever they're needed.

With this process:

- critical fixes are published as soon as possible
- new features and minor fixes take 3-5 days to be published

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://forestry.io"><img src="https://avatars3.githubusercontent.com/u/16868456?v=4" width="100px;" alt=""/><br /><sub><b>Forestry.io</b></sub></a><br /><a href="#financial-forestryio" title="Financial">💵</a></td>
    <td align="center"><a href="http://www.ncphi.com"><img src="https://avatars2.githubusercontent.com/u/824015?v=4" width="100px;" alt=""/><br /><sub><b>NCPhillips</b></sub></a><br /><a href="#projectManagement-ncphillips" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/commits?author=ncphillips" title="Code">💻</a> <a href="#blog-ncphillips" title="Blogposts">📝</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ancphillips" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=ncphillips" title="Documentation">📖</a> <a href="#ideas-ncphillips" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-ncphillips" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-ncphillips" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Ancphillips" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=ncphillips" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/dwalkr"><img src="https://avatars2.githubusercontent.com/u/15221702?v=4" width="100px;" alt=""/><br /><sub><b>DJ</b></sub></a><br /><a href="#projectManagement-dwalkr" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/commits?author=dwalkr" title="Code">💻</a> <a href="#blog-dwalkr" title="Blogposts">📝</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Adwalkr" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=dwalkr" title="Documentation">📖</a> <a href="#ideas-dwalkr" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-dwalkr" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Adwalkr" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=dwalkr" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://scottbyrne.ca"><img src="https://avatars2.githubusercontent.com/u/5075484?v=4" width="100px;" alt=""/><br /><sub><b>Scott Byrne</b></sub></a><br /><a href="#design-spbyrne" title="Design">🎨</a> <a href="https://github.com/tinacms/tinacms/commits?author=spbyrne" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Aspbyrne" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-spbyrne" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/commits?author=spbyrne" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jamespohalloran"><img src="https://avatars1.githubusercontent.com/u/3323181?v=4" width="100px;" alt=""/><br /><sub><b>James O'Halloran</b></sub></a><br /><a href="#projectManagement-jamespohalloran" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajamespohalloran" title="Bug reports">🐛</a> <a href="#ideas-jamespohalloran" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-jamespohalloran" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Ajamespohalloran" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=jamespohalloran" title="Tests">⚠️</a> <a href="https://github.com/tinacms/tinacms/commits?author=jamespohalloran" title="Code">💻</a></td>
    <td align="center"><a href="http://www.kendallstrautman.com/"><img src="https://avatars3.githubusercontent.com/u/36613477?v=4" width="100px;" alt=""/><br /><sub><b>Kendall Strautman</b></sub></a><br /><a href="#design-kendallstrautman" title="Design">🎨</a> <a href="#projectManagement-kendallstrautman" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Akendallstrautman" title="Bug reports">🐛</a> <a href="#ideas-kendallstrautman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-kendallstrautman" title="Maintenance">🚧</a> <a href="#talk-kendallstrautman" title="Talks">📢</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Akendallstrautman" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=kendallstrautman" title="Code">💻</a></td>
    <td align="center"><a href="http://itsnwa.com"><img src="https://avatars1.githubusercontent.com/u/19958806?v=4" width="100px;" alt=""/><br /><sub><b>Nichlas Wærnes Andersen</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=itsnwa" title="Code">💻</a> <a href="#design-itsnwa" title="Design">🎨</a> <a href="#ideas-itsnwa" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/jpatters"><img src="https://avatars1.githubusercontent.com/u/195614?v=4" width="100px;" alt=""/><br /><sub><b>Jordan</b></sub></a><br /><a href="#projectManagement-jpatters" title="Project Management">📆</a> <a href="#talk-jpatters" title="Talks">📢</a> <a href="#ideas-jpatters" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajpatters" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://frank.taillandier.me"><img src="https://avatars3.githubusercontent.com/u/103008?v=4" width="100px;" alt=""/><br /><sub><b>Frank Taillandier</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3ADirtyF" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=DirtyF" title="Documentation">📖</a> <a href="#projectManagement-DirtyF" title="Project Management">📆</a> <a href="#userTesting-DirtyF" title="User Testing">📓</a></td>
    <td align="center"><a href="http://forestry.io"><img src="https://avatars0.githubusercontent.com/u/776019?v=4" width="100px;" alt=""/><br /><sub><b>Scott Gallant</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=scottgallant" title="Documentation">📖</a> <a href="#talk-scottgallant" title="Talks">📢</a> <a href="#fundingFinding-scottgallant" title="Funding Finding">🔍</a></td>
    <td align="center"><a href="http://www.mitchmac.com"><img src="https://avatars2.githubusercontent.com/u/618212?v=4" width="100px;" alt=""/><br /><sub><b>Mitch MacKenzie</b></sub></a><br /><a href="#userTesting-mitchmac" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/zacchg"><img src="https://avatars2.githubusercontent.com/u/46639997?v=4" width="100px;" alt=""/><br /><sub><b>zacchg</b></sub></a><br /><a href="#userTesting-zacchg" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/lyleunderwood"><img src="https://avatars0.githubusercontent.com/u/605824?v=4" width="100px;" alt=""/><br /><sub><b>Lyle Underwood</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Alyleunderwood" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=lyleunderwood" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Laura1111999"><img src="https://avatars3.githubusercontent.com/u/38682924?v=4" width="100px;" alt=""/><br /><sub><b>Laura1111999</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=Laura1111999" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.thomkrupa.com"><img src="https://avatars2.githubusercontent.com/u/8614811?v=4" width="100px;" alt=""/><br /><sub><b>Thom Krupa</b></sub></a><br /><a href="#userTesting-thomkrupa" title="User Testing">📓</a></td>
    <td align="center"><a href="https://twitter.com/hypertextmike"><img src="https://avatars1.githubusercontent.com/u/120511?v=4" width="100px;" alt=""/><br /><sub><b>Michael Gauthier</b></sub></a><br /><a href="#userTesting-gauthierm" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/dcgoodwin2112"><img src="https://avatars1.githubusercontent.com/u/4554388?v=4" width="100px;" alt=""/><br /><sub><b>dcgoodwin2112</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=dcgoodwin2112" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/akshayknz"><img src="https://avatars3.githubusercontent.com/u/25759518?v=4" width="100px;" alt=""/><br /><sub><b>akshayknz</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=akshayknz" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.10up.com"><img src="https://avatars0.githubusercontent.com/u/2676022?v=4" width="100px;" alt=""/><br /><sub><b>Adam Silverstein</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=adamsilverstein" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.bradmcgonigle.com"><img src="https://avatars0.githubusercontent.com/u/115338?v=4" width="100px;" alt=""/><br /><sub><b>Brad McGonigle</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=BradMcGonigle" title="Code">💻</a></td>
    <td align="center"><a href="http://jake.cx"><img src="https://avatars2.githubusercontent.com/u/601264?v=4" width="100px;" alt=""/><br /><sub><b>Jake Coxon</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=JakeCoxon" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.prskavec.net"><img src="https://avatars3.githubusercontent.com/u/100356?v=4" width="100px;" alt=""/><br /><sub><b>Ladislav Prskavec</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=abtris" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bolariin"><img src="https://avatars1.githubusercontent.com/u/24629960?v=4" width="100px;" alt=""/><br /><sub><b>Bolarinwa Balogun</b></sub></a><br /><a href="#infra-bolariin" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://metamas.com"><img src="https://avatars2.githubusercontent.com/u/2520253?v=4" width="100px;" alt=""/><br /><sub><b>Mason Medeiros</b></sub></a><br /><a href="#userTesting-metamas" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/IronSean"><img src="https://avatars3.githubusercontent.com/u/1960190?v=4" width="100px;" alt=""/><br /><sub><b>ironsean</b></sub></a><br /><a href="#userTesting-IronSean" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/kypp"><img src="https://avatars1.githubusercontent.com/u/4457071?v=4" width="100px;" alt=""/><br /><sub><b>kyp</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Akypp" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/smashercosmo"><img src="https://avatars0.githubusercontent.com/u/273283?v=4" width="100px;" alt=""/><br /><sub><b>Vladislav Shkodin</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Asmashercosmo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/maciekgrzybek"><img src="https://avatars2.githubusercontent.com/u/16546428?v=4" width="100px;" alt=""/><br /><sub><b>maciek_grzybek</b></sub></a><br /><a href="#ideas-maciekgrzybek" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tinacms/tinacms/commits?author=maciekgrzybek" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/weibenfalk"><img src="https://avatars1.githubusercontent.com/u/11212270?v=4" width="100px;" alt=""/><br /><sub><b>weibenfalk</b></sub></a><br /><a href="#video-weibenfalk" title="Videos">📹</a> <a href="#blog-weibenfalk" title="Blogposts">📝</a> <a href="https://github.com/tinacms/tinacms/commits?author=weibenfalk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SceptreData"><img src="https://avatars2.githubusercontent.com/u/15841748?v=4" width="100px;" alt=""/><br /><sub><b>David Bergeron</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3ASceptreData" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kellanmartin.com"><img src="https://avatars1.githubusercontent.com/u/17299952?v=4" width="100px;" alt=""/><br /><sub><b>Kellan Martin</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=Spraynard" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jonmiller0"><img src="https://avatars1.githubusercontent.com/u/22771842?v=4" width="100px;" alt=""/><br /><sub><b>Jon Miller</b></sub></a><br /><a href="#ideas-jonmiller0" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://pcast01.github.io/"><img src="https://avatars1.githubusercontent.com/u/1172644?v=4" width="100px;" alt=""/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Apcast01" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/chriswillsflannery"><img src="https://avatars3.githubusercontent.com/u/6463453?v=4" width="100px;" alt=""/><br /><sub><b>Chris Flannery</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=chriswillsflannery" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/JeffersonBledsoe"><img src="https://avatars1.githubusercontent.com/u/30210785?v=4" width="100px;" alt=""/><br /><sub><b>Jefferson Bledsoe</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=JeffersonBledsoe" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kenniaa"><img src="https://avatars2.githubusercontent.com/u/14225265?v=4" width="100px;" alt=""/><br /><sub><b>Kenia</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=kenniaa" title="Code">💻</a></td>
    <td align="center"><a href="https://andrewjames.dev"><img src="https://avatars3.githubusercontent.com/u/13269277?v=4" width="100px;" alt=""/><br /><sub><b>Andrew James</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=andrew-t-james" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brooksztb"><img src="https://avatars3.githubusercontent.com/u/31398142?v=4" width="100px;" alt=""/><br /><sub><b>Zach B</b></sub></a><br /><a href="#talk-brooksztb" title="Talks">📢</a></td>
    <td align="center"><a href="https://github.com/jpuri"><img src="https://avatars0.githubusercontent.com/u/2182307?v=4" width="100px;" alt=""/><br /><sub><b>Jyoti Puri</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jpuri" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nibtime"><img src="https://avatars2.githubusercontent.com/u/52962482?v=4" width="100px;" alt=""/><br /><sub><b>nibtime</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=nibtime" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Anibtime" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://doyoubuzz.com/johan-soulet"><img src="https://avatars0.githubusercontent.com/u/2269599?v=4" width="100px;" alt=""/><br /><sub><b>Johan Soulet</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jsoulet" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajsoulet" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/cleitonper"><img src="https://avatars1.githubusercontent.com/u/13934790?v=4" width="100px;" alt=""/><br /><sub><b>Cleiton Pereira</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Acleitonper" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/chrisdmacrae"><img src="https://avatars2.githubusercontent.com/u/6855186?v=4" width="100px;" alt=""/><br /><sub><b>chrisdmacrae</b></sub></a><br /><a href="#infra-chrisdmacrae" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#question-chrisdmacrae" title="Answering Questions">💬</a> <a href="#ideas-chrisdmacrae" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/jhuggett"><img src="https://avatars2.githubusercontent.com/u/59655877?v=4" width="100px;" alt=""/><br /><sub><b>jhuggett</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jhuggett" title="Code">💻</a></td>
    <td align="center"><a href="https://www.nckweb.com.ar"><img src="https://avatars0.githubusercontent.com/u/174561?v=4" width="100px;" alt=""/><br /><sub><b>Nicolas Cisco</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=NickCis" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/commits?author=NickCis" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.hungrybearstudio.com/"><img src="https://avatars1.githubusercontent.com/u/22930449?v=4" width="100px;" alt=""/><br /><sub><b>Hungry Bear Studio</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=molebox" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/alexbarbato"><img src="https://avatars1.githubusercontent.com/u/23562192?v=4" width="100px;" alt=""/><br /><sub><b>Alex Barbato</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=alexbarbato" title="Code">💻</a></td>
    <td align="center"><a href="http://danitulp.nl"><img src="https://avatars3.githubusercontent.com/u/18421761?v=4" width="100px;" alt=""/><br /><sub><b>Dani Tulp</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=DaniTulp" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

![](https://res.cloudinary.com/forestry-demo/image/upload/h_85/v1573167387/Favicon.png)
