[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Ftinacms.org&text=I%20just%20checked%20out%20@tina_cms%20on%20GitHub%20and%20it%20is%20saweet%21&hashtags=TinaCMS%2Cjamstack%2Cheadlesscms)
[![Slack](https://img.shields.io/badge/slack-tinacms-blue.svg?logo=slack)](https://tinacms.slack.com)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-66-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# ![TINA CMS](https://res.cloudinary.com/forestry-demo/image/upload/v1585234360/TinaCMS/TinaCMS.png)

> Tina is an open-source toolkit for building content management directly into your website.

[![Tina Demo](https://res.cloudinary.com/forestry-demo/video/upload/du_16,w_700,e_loop/v1571159974/tina-hero-demo.gif)](https://tinacms.org/)

## Learn More

- [Website](https://tinacms.org/)
  - [Blog](https://tinacms.org/docs/)
  - [Docs](https://tinacms.org/docs/)
- [Community](https://tinacms.org/docs/)
  - [Slack](https://tinacms.slack.com)
  - [Forum](https://community.tinacms.org/)
- [Contributing](./CONTRIBUTING.md)
  - [Troubleshooting in Development](./CONTRIBUTING.md#Troubleshooting-in-Development)
- [Projects](https://github.com/orgs/tinacms/projects)

## Development

**Disclaimer**:

- Tina is a new and fast moving project. Although API stability and easy developer experience is important to the core team, they cannot be guaranteed while the project is pre-1.0.
- Although Tina supports many use cases not all of them have helper packages or comprehensive guides. If you’re looking to use Tina in a novel way you will have to do a lot of manual setup.

To get started:

```bash
git clone git@github.com:tinacms/tinacms.git
cd tinacms
npm install
npm run build

# Start Gatsby demo
cd packages/demo-gatsby
npm run start
```

**WARNING: Do not run `npm install` from inside the `packages` directory**

TinaCMS uses [Lerna](https://lerna.js.org/) to manage dependencies when developing locally. This allows the various packages to reference each other via symlinks. Running `npm install` from within a package replaces the symlinks with references to the packages in the npm registry.

### Commands

| Commands                           | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| npm run bootstrap                  | Install dependencies and link local packages. |
| npm run build                      | Build all packages.                           |
| npm run test                       | Run tests for all packages.                   |
| lerna run build --scope \<package> | Build only \<package>.                        |
| lerna run watch --scope \<package> | Build a the \<package> in watch mode.         |

### Testing With External Projects

Linking apps to a monorepo can be tricky. Tools like `npm link` are buggy and introduce inconsistencies with module resolution. If multiple modules rely on the same package you can easily end up with multiple instances of that package, this is problematic for packages like `react` which expect only one instance.

[`@tinacms/webpack-helpers`](./packages/@tinacms/webpack-helpers) provides tools and instructions for testing local TinaCMS changes on external websites.

## Release Process

TinaCMS packages are updated every Monday.

Checkout the [RELEASE](./RELEASE.md) file for the details.

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
    <td align="center"><a href="http://scottbyrne.ca"><img src="https://avatars2.githubusercontent.com/u/5075484?v=4" width="100px;" alt=""/><br /><sub><b>Scott Byrne</b></sub></a><br /><a href="#design-spbyrne" title="Design">🎨</a> <a href="https://github.com/tinacms/tinacms/commits?author=spbyrne" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Aspbyrne" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-spbyrne" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/commits?author=spbyrne" title="Documentation">📖</a> <a href="#blog-spbyrne" title="Blogposts">📝</a></td>
    <td align="center"><a href="https://github.com/jamespohalloran"><img src="https://avatars1.githubusercontent.com/u/3323181?v=4" width="100px;" alt=""/><br /><sub><b>James O'Halloran</b></sub></a><br /><a href="#projectManagement-jamespohalloran" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajamespohalloran" title="Bug reports">🐛</a> <a href="#ideas-jamespohalloran" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-jamespohalloran" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Ajamespohalloran" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=jamespohalloran" title="Tests">⚠️</a> <a href="https://github.com/tinacms/tinacms/commits?author=jamespohalloran" title="Code">💻</a> <a href="#blog-jamespohalloran" title="Blogposts">📝</a></td>
    <td align="center"><a href="http://www.kendallstrautman.com/"><img src="https://avatars3.githubusercontent.com/u/36613477?v=4" width="100px;" alt=""/><br /><sub><b>Kendall Strautman</b></sub></a><br /><a href="#design-kendallstrautman" title="Design">🎨</a> <a href="#projectManagement-kendallstrautman" title="Project Management">📆</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Akendallstrautman" title="Bug reports">🐛</a> <a href="#ideas-kendallstrautman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-kendallstrautman" title="Maintenance">🚧</a> <a href="#talk-kendallstrautman" title="Talks">📢</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Akendallstrautman" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=kendallstrautman" title="Code">💻</a> <a href="#blog-kendallstrautman" title="Blogposts">📝</a></td>
    <td align="center"><a href="http://itsnwa.com"><img src="https://avatars1.githubusercontent.com/u/19958806?v=4" width="100px;" alt=""/><br /><sub><b>Nichlas Wærnes Andersen</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=itsnwa" title="Code">💻</a> <a href="#design-itsnwa" title="Design">🎨</a> <a href="#ideas-itsnwa" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/jpatters"><img src="https://avatars1.githubusercontent.com/u/195614?v=4" width="100px;" alt=""/><br /><sub><b>Jordan</b></sub></a><br /><a href="#projectManagement-jpatters" title="Project Management">📆</a> <a href="#talk-jpatters" title="Talks">📢</a> <a href="#ideas-jpatters" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajpatters" title="Bug reports">🐛</a> <a href="#infra-jpatters" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tinacms/tinacms/commits?author=jpatters" title="Documentation">📖</a> <a href="https://github.com/tinacms/tinacms/commits?author=jpatters" title="Code">💻</a></td>
    <td align="center"><a href="https://frank.taillandier.me"><img src="https://avatars3.githubusercontent.com/u/103008?v=4" width="100px;" alt=""/><br /><sub><b>Frank Taillandier</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3ADirtyF" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=DirtyF" title="Documentation">📖</a> <a href="#projectManagement-DirtyF" title="Project Management">📆</a> <a href="#userTesting-DirtyF" title="User Testing">📓</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3ADirtyF" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=DirtyF" title="Code">💻</a></td>
    <td align="center"><a href="http://forestry.io"><img src="https://avatars0.githubusercontent.com/u/776019?v=4" width="100px;" alt=""/><br /><sub><b>Scott Gallant</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=scottgallant" title="Documentation">📖</a> <a href="#talk-scottgallant" title="Talks">📢</a> <a href="#fundingFinding-scottgallant" title="Funding Finding">🔍</a> <a href="#blog-scottgallant" title="Blogposts">📝</a></td>
    <td align="center"><a href="http://www.mitchmac.com"><img src="https://avatars2.githubusercontent.com/u/618212?v=4" width="100px;" alt=""/><br /><sub><b>Mitch MacKenzie</b></sub></a><br /><a href="#userTesting-mitchmac" title="User Testing">📓</a> <a href="#blog-mitchmac" title="Blogposts">📝</a></td>
    <td align="center"><a href="https://github.com/zacchg"><img src="https://avatars2.githubusercontent.com/u/46639997?v=4" width="100px;" alt=""/><br /><sub><b>zacchg</b></sub></a><br /><a href="#userTesting-zacchg" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/lyleunderwood"><img src="https://avatars0.githubusercontent.com/u/605824?v=4" width="100px;" alt=""/><br /><sub><b>Lyle Underwood</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Alyleunderwood" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=lyleunderwood" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Laura1111999"><img src="https://avatars3.githubusercontent.com/u/38682924?v=4" width="100px;" alt=""/><br /><sub><b>Laura1111999</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=Laura1111999" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.thomkrupa.com"><img src="https://avatars2.githubusercontent.com/u/8614811?v=4" width="100px;" alt=""/><br /><sub><b>Thom Krupa</b></sub></a><br /><a href="#userTesting-thomkrupa" title="User Testing">📓</a></td>
    <td align="center"><a href="https://twitter.com/hypertextmike"><img src="https://avatars1.githubusercontent.com/u/120511?v=4" width="100px;" alt=""/><br /><sub><b>Michael Gauthier</b></sub></a><br /><a href="#userTesting-gauthierm" title="User Testing">📓</a> <a href="https://github.com/tinacms/tinacms/commits?author=gauthierm" title="Documentation">📖</a></td>
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
    <td align="center"><a href="https://github.com/maciekgrzybek"><img src="https://avatars2.githubusercontent.com/u/16546428?v=4" width="100px;" alt=""/><br /><sub><b>maciek_grzybek</b></sub></a><br /><a href="#ideas-maciekgrzybek" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tinacms/tinacms/commits?author=maciekgrzybek" title="Code">💻</a> <a href="#infra-maciekgrzybek" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/weibenfalk"><img src="https://avatars1.githubusercontent.com/u/11212270?v=4" width="100px;" alt=""/><br /><sub><b>weibenfalk</b></sub></a><br /><a href="#video-weibenfalk" title="Videos">📹</a> <a href="#blog-weibenfalk" title="Blogposts">📝</a> <a href="https://github.com/tinacms/tinacms/commits?author=weibenfalk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SceptreData"><img src="https://avatars2.githubusercontent.com/u/15841748?v=4" width="100px;" alt=""/><br /><sub><b>David Bergeron</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3ASceptreData" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kellanmartin.com"><img src="https://avatars1.githubusercontent.com/u/17299952?v=4" width="100px;" alt=""/><br /><sub><b>Kellan Martin</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=Spraynard" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jonmiller0"><img src="https://avatars1.githubusercontent.com/u/22771842?v=4" width="100px;" alt=""/><br /><sub><b>Jon Miller</b></sub></a><br /><a href="#ideas-jonmiller0" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://pcast01.github.io/"><img src="https://avatars1.githubusercontent.com/u/1172644?v=4" width="100px;" alt=""/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Apcast01" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/chriswillsflannery"><img src="https://avatars3.githubusercontent.com/u/6463453?v=4" width="100px;" alt=""/><br /><sub><b>Chris Flannery</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=chriswillsflannery" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/commits?author=chriswillsflannery" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/JeffersonBledsoe"><img src="https://avatars1.githubusercontent.com/u/30210785?v=4" width="100px;" alt=""/><br /><sub><b>Jefferson Bledsoe</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=JeffersonBledsoe" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kenniaa"><img src="https://avatars2.githubusercontent.com/u/14225265?v=4" width="100px;" alt=""/><br /><sub><b>Kenia</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=kenniaa" title="Code">💻</a></td>
    <td align="center"><a href="https://andrewjames.dev"><img src="https://avatars3.githubusercontent.com/u/13269277?v=4" width="100px;" alt=""/><br /><sub><b>Andrew James</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=andrew-t-james" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brooksztb"><img src="https://avatars3.githubusercontent.com/u/31398142?v=4" width="100px;" alt=""/><br /><sub><b>Zach B</b></sub></a><br /><a href="#talk-brooksztb" title="Talks">📢</a></td>
    <td align="center"><a href="https://github.com/jpuri"><img src="https://avatars0.githubusercontent.com/u/2182307?v=4" width="100px;" alt=""/><br /><sub><b>Jyoti Puri</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jpuri" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3Ajpuri" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/tinacms/tinacms/commits?author=jpuri" title="Tests">⚠️</a> <a href="#maintenance-jpuri" title="Maintenance">🚧</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajpuri" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/nibtime"><img src="https://avatars2.githubusercontent.com/u/52962482?v=4" width="100px;" alt=""/><br /><sub><b>nibtime</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=nibtime" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Anibtime" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://doyoubuzz.com/johan-soulet"><img src="https://avatars0.githubusercontent.com/u/2269599?v=4" width="100px;" alt=""/><br /><sub><b>Johan Soulet</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jsoulet" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ajsoulet" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/cleitonper"><img src="https://avatars1.githubusercontent.com/u/13934790?v=4" width="100px;" alt=""/><br /><sub><b>Cleiton Pereira</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Acleitonper" title="Bug reports">🐛</a> <a href="#ideas-cleitonper" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/chrisdmacrae"><img src="https://avatars2.githubusercontent.com/u/6855186?v=4" width="100px;" alt=""/><br /><sub><b>chrisdmacrae</b></sub></a><br /><a href="#infra-chrisdmacrae" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#question-chrisdmacrae" title="Answering Questions">💬</a> <a href="#ideas-chrisdmacrae" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/jhuggett"><img src="https://avatars2.githubusercontent.com/u/59655877?v=4" width="100px;" alt=""/><br /><sub><b>jhuggett</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jhuggett" title="Code">💻</a></td>
    <td align="center"><a href="https://www.nckweb.com.ar"><img src="https://avatars0.githubusercontent.com/u/174561?v=4" width="100px;" alt=""/><br /><sub><b>Nicolas Cisco</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=NickCis" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/commits?author=NickCis" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.hungrybearstudio.com/"><img src="https://avatars1.githubusercontent.com/u/22930449?v=4" width="100px;" alt=""/><br /><sub><b>Hungry Bear Studio</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=molebox" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/alexbarbato"><img src="https://avatars1.githubusercontent.com/u/23562192?v=4" width="100px;" alt=""/><br /><sub><b>Alex Barbato</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=alexbarbato" title="Code">💻</a></td>
    <td align="center"><a href="http://danitulp.nl"><img src="https://avatars3.githubusercontent.com/u/18421761?v=4" width="100px;" alt=""/><br /><sub><b>Dani Tulp</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=DaniTulp" title="Code">💻</a> <a href="#ideas-DaniTulp" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/PaulBunker"><img src="https://avatars1.githubusercontent.com/u/1537408?v=4" width="100px;" alt=""/><br /><sub><b>PaulBunker</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=PaulBunker" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://joeprevite.com"><img src="https://avatars3.githubusercontent.com/u/3806031?v=4" width="100px;" alt=""/><br /><sub><b>JavaScript Joe</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=jsjoeio" title="Code">💻</a></td>
    <td align="center"><a href="https://www.madelyneriksen.com"><img src="https://avatars3.githubusercontent.com/u/36825510?v=4" width="100px;" alt=""/><br /><sub><b>Madelyn Eriksen</b></sub></a><br /><a href="#blog-madelyneriksen" title="Blogposts">📝</a></td>
    <td align="center"><a href="http://www.mintel.me"><img src="https://avatars1.githubusercontent.com/u/4574612?v=4" width="100px;" alt=""/><br /><sub><b>Marc Mintel</b></sub></a><br /><a href="#infra-mmintel" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tinacms/tinacms/commits?author=mmintel" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Ammintel" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://forestry.io"><img src="https://avatars3.githubusercontent.com/u/5414297?v=4" width="100px;" alt=""/><br /><sub><b>Jeff See</b></sub></a><br /><a href="#infra-jeffsee55" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/blandfried-magellan"><img src="https://avatars3.githubusercontent.com/u/38441047?v=4" width="100px;" alt=""/><br /><sub><b>Brandon Landfried</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Ablandfried-magellan" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/chaddjohnson"><img src="https://avatars0.githubusercontent.com/u/676134?v=4" width="100px;" alt=""/><br /><sub><b>Chad Johnson</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Achaddjohnson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://xoe.solutions"><img src="https://avatars0.githubusercontent.com/u/7548295?v=4" width="100px;" alt=""/><br /><sub><b>David Arnold</b></sub></a><br /><a href="#ideas-blaggacao" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://gavinmcfarland.co.uk/"><img src="https://avatars1.githubusercontent.com/u/5551?v=4" width="100px;" alt=""/><br /><sub><b>Gavin McFarland</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Alimitlessloop" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/blandfried"><img src="https://avatars1.githubusercontent.com/u/1953556?v=4" width="100px;" alt=""/><br /><sub><b>blandfried</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Ablandfried" title="Bug reports">🐛</a> <a href="https://github.com/tinacms/tinacms/commits?author=blandfried" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/marklawlor"><img src="https://avatars1.githubusercontent.com/u/3946701?v=4" width="100px;" alt=""/><br /><sub><b>Mark Lawlor</b></sub></a><br /><a href="#ideas-marklawlor" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/BPScott"><img src="https://avatars0.githubusercontent.com/u/227292?v=4" width="100px;" alt=""/><br /><sub><b>Ben Scott</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/pulls?q=is%3Apr+reviewed-by%3ABPScott" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/mittonface"><img src="https://avatars2.githubusercontent.com/u/5082908?v=4" width="100px;" alt=""/><br /><sub><b>Brent Mitton</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=mittonface" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/commits?author=mittonface" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/clnmcgrw"><img src="https://avatars2.githubusercontent.com/u/5896972?v=4" width="100px;" alt=""/><br /><sub><b>Colin McGraw</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=clnmcgrw" title="Documentation">📖</a></td>
    <td align="center"><a href="https://bshack.dev"><img src="https://avatars0.githubusercontent.com/u/1447644?v=4" width="100px;" alt=""/><br /><sub><b>Brandon Shackelford</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/commits?author=bshackelford" title="Code">💻</a> <a href="https://github.com/tinacms/tinacms/issues?q=author%3Abshackelford" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://amyskapers.dev"><img src="https://avatars2.githubusercontent.com/u/15953185?v=4" width="100px;" alt=""/><br /><sub><b>Amy Kapernick</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Aamykapernick" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://samullman.com"><img src="https://avatars3.githubusercontent.com/u/10147333?v=4" width="100px;" alt=""/><br /><sub><b>Sam Ullman</b></sub></a><br /><a href="https://github.com/tinacms/tinacms/issues?q=author%3Asamullman" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://pixelmord.github.io"><img src="https://avatars2.githubusercontent.com/u/224168?v=4" width="100px;" alt=""/><br /><sub><b>Andreas Adam</b></sub></a><br /><a href="#ideas-pixelmord" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/tinacms/tinacms/commits?author=pixelmord" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

![](https://res.cloudinary.com/forestry-demo/image/upload/h_85/v1573167387/Favicon.png)
