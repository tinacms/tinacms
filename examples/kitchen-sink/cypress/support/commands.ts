/**

*/

Cypress.on(
  // @ts-ignore
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
)

Cypress.Commands.add('getRTE', () => {
  return cy.get(
    `[role="textbox"][data-slate-editor="true"][contenteditable="true"]`
  )
})

const getIframeDocument = () => {
  return (
    cy
      .get('iframe')
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its('0.contentDocument')
      .should('exist')
  )
}

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its('body')
      .should('not.be.undefined')
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  )
}

Cypress.Commands.add('getPageRTEBody', () => {
  return getIframeBody().find(`[data-test="rich-text-body"]`)
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
