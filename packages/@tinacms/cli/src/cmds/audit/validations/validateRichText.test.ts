/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { validateRichText } from './validateRichText'

describe('validateRichText', () => {
  describe('with no issues', () => {
    const dummyDoc = {
      _sys: {
        extension: 'md',
        path: 'content/posts/hello-world.md',
        relativePath: 'posts/md',
      },
      _values: {
        date: '2021-07-12T07:00:00.000Z',
        _body: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [
                {
                  type: 'text',
                  text: 'Lorem markdownum evinctus ut cape adhaeret gravis licet progenies ut haesit maxima ille. Est scorpius, mori vel in visaeque Haemoniis viperei furoris e ad vasti, distulit. Crudus sub coniuge iam: dea propera sive',
                },
              ],
            },
          ],
        },
      },
    }

    test('returns empty array', () => {
      const result = validateRichText(dummyDoc)
      expect(result.length).toEqual(0)
    })
  })
  describe('with rich text issue', () => {
    describe('as nested field', () => {
      const dummyDoc = {
        _sys: {
          extension: 'md',
          path: 'content/posts/hello-world.md',
          relativePath: 'posts/md',
        },
        _values: {
          date: '2021-07-12T07:00:00.000Z',
          group: {
            date: '2021-07-12T07:00:00.000Z',
            foo: null,
            emptyArray: [],
            objArray: [{ title: 'foo' }],
            strArray: ['foo', 'bar'],
            nestedBody: {
              type: 'root',
              children: [
                {
                  type: 'invalid_markdown',
                  value:
                    '\n\n## Overarching Process\n\nTina has three main branches:\n\n- **master:** The bleeding edge of tinacms\n- **next:** A preview of the next release\n- **latest:** The current stable release\n\nThe flow of changes therefore looks like:\n\n> `fix-some-bug` => `master` => `next` => `latest`\n\nThe process happens over a week:\n\n- On Monday\n  1. `next` is merged into `latest`; then `latest` is published to npm\n  2. `master` is merged into `next`; then `next` is published to npm\n- Any hot fixes for bugs will be cherry picked into `next` and `latest`\n  and the published accordingly.\n- Every pull request merged to `master` automatically triggers a\n  `canary` release.\n\nWith this process:\n\n- all accepted changes are available as `canary` releases for early testing\n- critical fixes are published as soon as possible\n- new features and minor fixes take ~1.5 weeks to be published\n\n## Steps to Release\n\nThe general release process looks like this:\n\n1. **Build the source files:**\n\n   The source must be compiled, minified, and uglified in preparation for release.\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   We use `lerna` to generate CHANGELOG files automatically from our commit messages.\n\n1. **Clean the CHANGELOGs**\n\n   Lerna sometimes adds empty changelog entries. For example, if `react-tinacms` is changed\n   then `tinacms` will get get a patch update with only the dependency updated. Make sure to install `lerna-clean-changelog-cli`:\n\n   ```\n   npm i -g lerna-clean-changelogs-cli\n   ```\n\n1. **Publish to NPM:**\n\n   You must have an NPM_TOKEN set locally that has access to the `@tinacms` organization\n\n1. **Push CHANGELOGs and Git tags to Github:**\n\n   Let everyone know!\n\nThe exact commands vary slightly depending on the type of release being made.\n\n### Prerelease\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --conventional-prerelease \\\n     --no-push \\\n     --allow-branch next \\\n     -m "chore(publish): prerelease"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1. **Publish to NPM:**\n   ```\n   lerna publish from-package --dist-tag next\n   ```\n1. **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n\n### Graduating Prereleases\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --conventional-graduate \\\n     --no-push \\\n     --allow-branch next \\\n     -m "chore(publish): graduation"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1) **Publish to NPM:**\n\n   ```\n   lerna publish from-package\n   ```\n\n1) **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n\n### Release\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --no-push \\\n     --allow-branch master \\\n     -m "chore(publish): release"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1. **Publish to NPM:**\n   ```\n   lerna publish from-package\n   ```\n1. **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n',
                  message: 'Error: listItem inside list item is not supported',
                  children: [
                    {
                      type: 'text',
                      text: '',
                    },
                  ],
                },
              ],
            },
          },
        },
      }

      test('returns warning', () => {
        const result = validateRichText(dummyDoc)
        expect(result.filter((r) => r.level == 'warning')).toHaveLength(1)
        expect(result.filter((r) => r.level == 'error')).toHaveLength(0)
        expect(result[0].docPath == 'content/posts/hello-world.md')
      })
    })

    describe('as root field', () => {
      const dummyDoc = {
        _sys: {
          extension: 'md',
          path: 'content/posts/hello-world.md',
          relativePath: 'posts/md',
        },
        _values: {
          date: '2021-07-12T07:00:00.000Z',
          _body: {
            type: 'root',
            children: [
              {
                type: 'invalid_markdown',
                value:
                  '\n\n## Overarching Process\n\nTina has three main branches:\n\n- **master:** The bleeding edge of tinacms\n- **next:** A preview of the next release\n- **latest:** The current stable release\n\nThe flow of changes therefore looks like:\n\n> `fix-some-bug` => `master` => `next` => `latest`\n\nThe process happens over a week:\n\n- On Monday\n  1. `next` is merged into `latest`; then `latest` is published to npm\n  2. `master` is merged into `next`; then `next` is published to npm\n- Any hot fixes for bugs will be cherry picked into `next` and `latest`\n  and the published accordingly.\n- Every pull request merged to `master` automatically triggers a\n  `canary` release.\n\nWith this process:\n\n- all accepted changes are available as `canary` releases for early testing\n- critical fixes are published as soon as possible\n- new features and minor fixes take ~1.5 weeks to be published\n\n## Steps to Release\n\nThe general release process looks like this:\n\n1. **Build the source files:**\n\n   The source must be compiled, minified, and uglified in preparation for release.\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   We use `lerna` to generate CHANGELOG files automatically from our commit messages.\n\n1. **Clean the CHANGELOGs**\n\n   Lerna sometimes adds empty changelog entries. For example, if `react-tinacms` is changed\n   then `tinacms` will get get a patch update with only the dependency updated. Make sure to install `lerna-clean-changelog-cli`:\n\n   ```\n   npm i -g lerna-clean-changelogs-cli\n   ```\n\n1. **Publish to NPM:**\n\n   You must have an NPM_TOKEN set locally that has access to the `@tinacms` organization\n\n1. **Push CHANGELOGs and Git tags to Github:**\n\n   Let everyone know!\n\nThe exact commands vary slightly depending on the type of release being made.\n\n### Prerelease\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --conventional-prerelease \\\n     --no-push \\\n     --allow-branch next \\\n     -m "chore(publish): prerelease"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1. **Publish to NPM:**\n   ```\n   lerna publish from-package --dist-tag next\n   ```\n1. **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n\n### Graduating Prereleases\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --conventional-graduate \\\n     --no-push \\\n     --allow-branch next \\\n     -m "chore(publish): graduation"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1) **Publish to NPM:**\n\n   ```\n   lerna publish from-package\n   ```\n\n1) **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n\n### Release\n\n1. **Build the source files:**\n\n   ```\n   npm run build\n   ```\n\n1. **Generate CHANGELOGs and Git tags:**\n\n   ```\n   lerna version \\\n     --conventional-commits \\\n     --no-push \\\n     --allow-branch master \\\n     -m "chore(publish): release"\n   ```\n\n1. **Clean the CHANGELOGs**\n\n   ```\n   lcc ** && git commit -am "chore: clean changelogs"\n   ```\n\n1. **Publish to NPM:**\n   ```\n   lerna publish from-package\n   ```\n1. **Push CHANGELOGs and Git tags to Github:**\n   ```\n   git push && git push --tags\n   ```\n',
                message: 'Error: listItem inside list item is not supported',
                children: [
                  {
                    type: 'text',
                    text: '',
                  },
                ],
              },
            ],
          },
        },
      }

      test('returns warning', () => {
        const result = validateRichText(dummyDoc)
        expect(result.filter((r) => r.level == 'warning')).toHaveLength(1)
        expect(result.filter((r) => r.level == 'error')).toHaveLength(0)
        expect(result[0].docPath == 'content/posts/hello-world.md')
      })
    })
  })
})
