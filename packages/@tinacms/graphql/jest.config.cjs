/**

*/

const mod = require('@strivemath/tinacms-scripts/dist/jest-runner.js')
module.exports = {
  ...mod.default.config,
  transform: {
    ...mod.default.config.transform,
    // unified.js only publishes ESM, which jest doesn't like
    unified: '@strivemath/tinacms-scripts/dist/jest-runner.js',
  },
}
