import { defineConfig } from 'cypress'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      const getAbsPath = (relativePath) =>
        path.resolve(config.projectRoot, 'content/post', relativePath)

      on('task', {
        readrawmdx(relativePath = 'tinacms-v0.69.7.md') {
          return fs.readFileSync(getAbsPath(relativePath), 'utf8')
        },
        writemdx(markdown, relativePath = 'tinacms-v0.69.7.md') {
          fs.writeFileSync(getAbsPath(relativePath), markdown, 'utf8')
          return true
        },
      })
    },
  },
  chromeWebSecurity: false,
})
