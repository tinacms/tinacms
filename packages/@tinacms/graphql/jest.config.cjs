const mod = require('@tinacms/scripts/dist/jest-runner.js')

// Check if mod.default exists and has a config property
if (!mod.default || !mod.default.config) {
  throw new Error('Invalid jest-runner configuration')
}

module.exports = {
  ...mod.default.config,
  transform: {
    ...mod.default.config.transform,
    // unified.js only publishes ESM, which jest doesn't like
    unified: '@tinacms/scripts/dist/jest-runner.js',
  },
}
