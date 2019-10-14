# gatsby-tinacms-git

A Gatsby plugin for the Tina CMS that provides an API for writing changes to the local filesystem. It does this by :

- Creating a NodeJS server that writes changes to markdonw files.
- Registers a `git` API with the `cms` that posts changes to the server.

## Installation

```
npm install --save gatsby-tinacms-git
```

or

```sh
yarn add gatsby-tinacms-git
```

## Setup

Include `gatsby-tinacms-git` in the list of gatsby plugins:

_gatsby-config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    'gatsby-tinacms-git',
  ],
}
```
