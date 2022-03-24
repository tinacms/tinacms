/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('getRTE', () => {
  return cy.get(
    `[role="textbox"][data-slate-editor="true"][contenteditable="true"]`
  )
})

Cypress.Commands.add('focusRTE', () => {
  return cy.getRTE().children().first().click('bottomLeft')
})

Cypress.Commands.add('getPageRTEBody', () => {
  return cy.get(`[data-test="rich-text-body"]`)
})

Cypress.Commands.add('login', () => {
  // Fake Login
  localStorage.setItem('tina.isEditing', 'true')

  cy.reload()
})

Cypress.Commands.add('logout', () => {
  // Fake Logout
  localStorage.removeItem('tina.isEditing')

  cy.reload()
})

Cypress.Commands.add('getSaveButton', () => {
  return cy.get('.tina-tailwind .flex-1 > .text-white')
})

Cypress.Commands.add('save', () => {
  cy.getSaveButton().click()
})

Cypress.Commands.add(
  'assertRTE',
  (markdown = '', typed = '', wantedHTML = '', wantedMD = '') => {
    if (markdown !== null) cy.task('writemdx', markdown)

    cy.visit('/')

    cy.login()

    cy.focusRTE()

    if (typed) cy.getRTE().type(typed)

    cy.getPageRTEBody().should('contain.html', wantedHTML)

    if (!wantedMD) return

    cy.save()

    cy.task('readrawmdx').then((content) => {
      console.info('readrawmdx', content)
      expect(content).to.contain(wantedMD)
    })
  }
)
