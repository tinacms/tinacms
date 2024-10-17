import { defineConfig } from 'cypress'

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  viewportWidth: 1000,
  viewportHeight: 660,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3000',
  },
})
