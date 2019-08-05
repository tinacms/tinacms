# @forestryio/gatsby-xeditor-git

A Gatsby plugin for the XEditor CMS that provides an API for writing changes to the local filesystem. It does this by :

- Creating a NodeJS server that writes changes to markdonw files.
- Registers a `git` API with the `cms` that posts changes to the server.

## Installation

```
npm install --save @forestryio/gatsby-xeditor-git
```

or

```sh
yarn add @forestryio/gatsby-xeditor-git
```

## Setup

Include `@forestryio/gatsby-xeditor-git` in the list of gatsby plugins:

_gatsby-config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@forestryio/gatsby-xeditor-git',
  ],
}
```
