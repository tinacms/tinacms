import { cypressStringifyChromeRecording } from '@cypress/chrome-recorder'
import fs from 'fs'
import path from 'path'
import assertions from './cypress/test1/assertions.json' assert { type: 'json' }
import title from './cypress/test1/title.json' assert { type: 'json' }

// const dir = path.dirname(process.cwd)
const cypressRoot = path.join(process.cwd(), 'cypress')
const dir = await fs.readdirSync(cypressRoot)
// console.log(dir)

await Promise.all(
  dir
    .filter((item) => item !== 'setup.mjs')
    .map(async (item) => {
      const assertions = (
        await fs.readFileSync(path.join(cypressRoot, item, 'assertions.json'))
      ).toString()
      const title = (
        await fs.readFileSync(path.join(cypressRoot, item, 'title.json'))
      ).toString()
      const stringifiedContent = await cypressStringifyChromeRecording(title)

      let string = stringifiedContent.toString()
      JSON.parse(assertions).forEach((assertion) => {
        string = string.replace(
          `cy.get("#${assertion.id}").click()`,
          `cy.get("#${assertion.id}").should('contain', "${assertion.value}")`
        )
      })
      await fs.writeFileSync(
        path.join(cypressRoot, item, 'cypress.spec.js'),
        string
      )
      console.log(string)
    })
)
