### Tina Webpack Helpers

---

Linking apps to a monorepo can be tricky. Tools like `npm link` are buggy and introduce inconsistencies with module resolution. If 2 modules rely on the same package you can easily end up with 2 instances of that package, this is problematic for packages like `react` which expect only one instance. If you're app uses webpack you can get around these issues by ensuring that your dependencies come from a specific path on your system. `@tinacms/webpack-helpers` makes it easy to set up:

### Usage

Pass your webpack config to the `aliasTinaDev` function along with the relative path from the site your working on to the `tinacms` monorepo, the following is an example from a next.js app where the monorepo is in an adjacent folder:

```js
// In your app's webpack config
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
