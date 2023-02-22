/**

*/

/// <reference types="cypress" />

// Not really an error? see https://github.com/cypress-io/cypress/issues/8418
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false
  }
})
describe('Have Edit mode button', () => {
  it('should enter edit mode', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')
    cy.get('#__next > div:nth-child(1) > a').should('exist')
    cy.get('#__next > div:nth-child(1) > a').click()
  })
  it('Can login', () => {
    cy.visit('http://localhost:3000/')
    expect(localStorage.getItem('tina.isEditing')).to.be.null
    // Make sure the edit button is present
    // cy.get('#__next > div:nth-child(1) > a').should('exist')
    // Redirects do not seem to work in Electron. So this is a work around
    cy.visit('/admin')
    cy.get('button[type=submit', { timeout: 3000 }).should(
      'contain',
      'Edit With Tina'
    )
    cy.get('button[type=submit')
      .click()
      .should(() => {
        expect(localStorage.getItem('tina.isEditing')).to.eq('true')
      })
    // cy.get(`[aria-label="opens cms sidebar"]`, { timeout: 5000 }).click()
  })
})
