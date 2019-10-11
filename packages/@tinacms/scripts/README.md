# @tinacms/scripts

This package provides the `tinacms-scripts` bin with the following commands:

| Command               | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| tinacms-scripts build | Builds the package for production use (i.e. uglified and without debugging) |
| tinacms-scripts dev   | Builds the package for development                                          |
| tinacms-scripts watch | Watches the package for updates and rebuilds.                               |

## DEBUG

The global variable `DEBUG` will be replaced at build time with either `true` or `false`.

For example

```js
console.log('All Environments')

if (DEBUG) {
  console.log('Development')
} else {
  console.log('Production')
}
```

When running `tinacms-scripts build` the above source code will be `uglified`, which will
strip out the `DEBUG` case and replace it with this:

```js
console.log('All Environments')

console.log('Production')
```

## Source

- [Source Code](https://github.com/tinacms/tinacms/tree/master/packages/%40tinacms/scripts)
