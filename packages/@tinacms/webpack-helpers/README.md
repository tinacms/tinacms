### Tina Webpack Helpers

---

Linking apps to a monorepo can be tricky. Tools like `npm link` are buggy and introduce inconsistencies with module resolution. If multiple modules rely on the same package you can easily end up with multiple instances of that package, this is problematic for packages like `react` which expect only one instance. If your app uses `webpack` you can get around these issues by ensuring that your dependencies come from a specific path on your system. This is especially helpful for working on the TinaCMS monorepo while using its packages in your app. `@tinacms/webpack-helpers` makes it easy to set up:

### Usage

Ensure you've set your `tinacms` monorepo up with the initial steps in the README, if your packages don't have a `build` directory the consuming app won't be able to resolve them.

Pass your webpack config to the `aliasTinaDev` function along with the relative path from the site your working on to the `tinacms` monorepo, the following is an example from a next.js app where the monorepo is in an adjacent folder:

#### Next.js

**next.config.js**

```js
const tinaWebpackHelpers = require('@tinacms/webpack-helpers')

...

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (dev) {
      tinaWebpackHelpers.aliasTinaDev(config, '../tinacms')
    }
    return config
  },
}
```

This will alias every package in the monorepo so that references within your app point to the local monorepo rather than your app's `node_modules` directory.
You can specify the package names you'd like to alias as a second argument:

**next.config.js**
```js
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (dev) {
      tinaWebpackHelpers.aliasTinaDev(config, '../tinacms', ['@tinacms/forms'])
    }
    return config
  },
}
```

Now any reference to TinaCMS packages will use the local version (ignoring the version in your `.node_modules` directory):

#### Gatsby

**gastby-node.js**

```js
exports.onCreateWebpackConfig = ({ actions }) => {
  const config = {
    resolve: {
      alias: {},
    },
  }

  aliasTinaDev(config, '../tinacms')

  actions.setWebpackConfig(config)
}
```

##### Gatsby Plugins

The above solution only aliases packages loaded via the webpack, which
means the above solution does not work for Gatsby plugins.

Instead, you can simply add the relative paths to your config:

**gatsby-config.js**

```js
    {
      resolve: "../tinacms/packages/gatsby-plugin-tinacms",
      options: {
        plugins: [
          "../tinacms/packages/gatsby-tinacms-git",
          "gatsby-tinacms-json",
          "gatsby-tinacms-remark",
        ],
        sidebar: {
          position: "fixed",
          hidden: process.env.NODE_ENV === "production"
        }
      }
    },
```

**Why aren't `gatsby-tinacms-json` and `gatsby-tinacms-remark` plugins relative?**

Unfortunately, they cannot be imported this way. The webpack aliasing doesn't effect
node resolution, so when it tries to modify the GraphQL schema you get this error:

```bash
UNHANDLED REJECTION MarkdownRemark.rawFrontmatter provided incorrect OutputType: 'String'

  Error: MarkdownRemark.rawFrontmatter provided incorrect OutputType: 'String'

  - TypeMapper.js:294 TypeMapper.convertOutputFieldConfig
    [ncphillips.github.io]/[graphql-compose]/lib/TypeMapper.js:294:15
```

This error is caused by the [setFieldsOnGraphQLNodeType](https://github.com/tinacms/tinacms/blob/main/packages/gatsby-tinacms-remark/gatsby-node.js#L18)
method in each of those methods. The reason why `String` is not `String` is
that the GraphQL type checking is based on the identity of the`GraphQLString`
object imported from Gatsby.

Instead, in your app's `package.json` replace:

```
"gatsby-tinacms-json": "<version>",
"gatsby-tinacms-remark": "<version>",
```

with:

```
"gatsby-tinacms-json": "file:<local-path-to-cloned-tinacms-repo>/packages/gatsby-tinacms-json",
"gatsby-tinacms-remark": "file:<local-path-to-cloned-tinacms-repo>/packages/gatsby-tinacms-remark",
```
