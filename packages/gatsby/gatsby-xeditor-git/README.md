# @tinacms/gatsby-tinacms-git

A Gatsby plugin for the XEditor CMS that provides an API for writing changes to the local filesystem. It does this by :

- Creating a NodeJS server that writes changes to markdonw files.
- Registers a `git` API with the `cms` that posts changes to the server.

## Installation

```
npm install --save @tinacms/gatsby-tinacms-git
```

or

```sh
yarn add @tinacms/gatsby-tinacms-git
```

## Setup

Include `@tinacms/gatsby-tinacms-git` in the list of gatsby plugins:

_gatsby-config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@tinacms/gatsby-tinacms-git',
  ],
}
```
