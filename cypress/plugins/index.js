/**

*/

/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs')
const path = require('path')

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  const getAbsPath = (relativePath) =>
    path.resolve(
      config.projectRoot,
      'experimental-examples/kitchen-sink/content/page',
      relativePath
    )

  on('task', {
    readrawmdx(relativePath = 'home.mdx') {
      return fs.readFileSync(getAbsPath(relativePath), 'utf8')
    },
    writemdx(markdown, relativePath = 'home.mdx') {
      fs.writeFileSync(getAbsPath(relativePath), markdown, 'utf8')
      return true
    },
  })
}
