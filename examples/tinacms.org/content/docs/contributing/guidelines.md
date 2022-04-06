---
title: Contribution Guidelines
id: /docs/contributing/guidelines
prev: null
next: /docs/contributing/setting-up
---
The following is a set of guidelines and tips for contributing to the TinaCMS and its packages. Please also reference this [doc](https://github.com/tinacms/tinacms/blob/master/CONTRIBUTING.md) for the latest info on contributing.

**If you have questions or need help, please post it on the** [**Forum**](https://community.tinacms.org/)**.**

## How to Contribute

* [Reporting Bugs](https://github.com/tinacms/tinacms/issues)
* [Suggesting Enhancements](https://github.com/tinacms/tinacms/issues)
* [Writing Docs, Guides, or Blog Posts](https://github.com/tinacms/tinacms.org)
* Volunteering for User Testing
* [Adding features, fixing bugs etc.](https://github.com/tinacms/tinacms/issues)
* [Answer questions in the Tina Forum](https://community.tinacms.org/)
* Tackle a [good-first-issue](https://github.com/tinacms/tinacms/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)!

## Contributing Code

Read the [set-up](/docs/contributing/setting-up) guide to get started developing on Tina locally.

### Making Commits

TinaCMS uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) to generate CHANGELOG entries. Please make sure your commits follow this convention.

### Creating Packages

Packages in Tina are organized according to their name

| Type | Naming Convention | Example Path |
| --- | --- | --- |
| Internal packages | `@tinacms/*` | `@tinacms/core` |
| Node API extensions | `@tinacms/api-*` | `@tinacms/api-git` |
| React specific packages | `react-tinacms-*` | `react-tinacms-remark` |
| Gastby plugins | `gatsby-tinacms-*` | `gatsby-tinacms-json` |
| NextJS package | `next-tinacms-*` | `next-tinacms-markdown` |
| Demo Projects | `demo-*` | `demo-gatsby` |
