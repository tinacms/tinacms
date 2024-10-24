/**

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

Cypress.Commands.add('getPageRTEBody', () => {
  return cy
    .get(`iframe[data-test="tina-iframe"]`)
    .should('exist')
    .its('0.contentDocument')
    .should('exist')
    .its('body')
    .should('not.be.undefined')
    .then(cy.wrap)
    .find('[data-test="rich-text-body"]')
    .should('exist')
})

Cypress.Commands.add('login', () => {
  // Fake Login
  localStorage.setItem('tina.isEditing', 'true')
  localStorage.setItem('tina.local.isLogedIn', 'true')

  cy.reload()
})

Cypress.Commands.add('logout', () => {
  // Fake Logout
  localStorage.removeItem('tina.isEditing')
  localStorage.removeItem('tina.local.isLogedIn')

  cy.reload()
})

Cypress.Commands.add('getSaveButton', () => {
  return cy.get('.tina-tailwind .flex-1 > .text-white')
})

Cypress.Commands.add('save', () => {
  cy.getSaveButton().click()
})
