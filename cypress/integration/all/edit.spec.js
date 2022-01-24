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
    cy.get('button[type=submit', { timeout: 3000 }).should(
      'contain',
      'Enter edit-mode'
    )
    cy.get('button[type=submit')
      .click()
      .should(() => {
        expect(localStorage.getItem('tina.isEditing')).to.eq('true')
      })
    // cy.get(`[aria-label="opens cms sidebar"]`, { timeout: 5000 }).click()
  })
})
