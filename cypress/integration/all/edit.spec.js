/// <reference types="cypress" />

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
    cy.wait(2000)
    cy.get('button[type=submit').should('contain', 'Log in')
    cy.get('button[type=submit')
      .click()
      .wait(1000)
      .should(() => {
        expect(localStorage.getItem('tina.isEditing')).to.eq('true')
      })
    // cy.get(`[aria-label="toggles cms sidebar"]`, { timeout: 5000 }).click()
  })
})
