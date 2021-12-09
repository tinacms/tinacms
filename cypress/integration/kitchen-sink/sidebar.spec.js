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

const SUBTITLE_TEXT = 'This is a sub title'

const HEADING_TEXT = 'This is a heading'

const LONG_FORM_TEXT = `# heading 1
para 1

para 2

para 3

`

const SLATE_SELECTOR = `[role="textbox"][data-slate-editor="true"][contenteditable="true"]`
const RICH_TEXT_BODY_SELECTOR = `[data-test="rich-text-body"]`

describe('Tina side bar', () => {
  beforeEach(() => {
    cy.visit('/')
    // Fake Login
    localStorage.setItem('tina.isEditing', 'true')
    cy.reload()

    // Open the sidebar
    cy.get(`[aria-label="toggles cms sidebar"]`, { timeout: 5000 }).click()

    // Delete all text in rich text editor
    // Best practice is to clean up state BEFORE the test: https://docs.cypress.io/guides/references/best-practices#Using-after-or-afterEach-hooks

    const backspace = Array(300).fill(`{backspace}`).join('')
    console.log({ backspace })
    cy.get(SLATE_SELECTOR).click('bottom').type(backspace)
    cy.get('button').contains('Save').click().wait(1000)
    cy.visit('/').wait(100)

    // Open the sidebar
    cy.get(`[aria-label="toggles cms sidebar"]`, { timeout: 5000 }).click()
  })
  it('Can edit text', () => {
    // Edit subtitle
    cy.get('textarea[name="subtitle"]').click().type(SUBTITLE_TEXT)
    cy.get('[data-test="subtitle"]').should('contain', SUBTITLE_TEXT)

    // Editing heading
    cy.get('input[name="heading"]').click().type(HEADING_TEXT)
    cy.get('[data-test="heading"]').should('contain', HEADING_TEXT)
  })

  it('Can edit rich text', () => {
    describe('Edit rich Text', () => {
      // TODO: fix issue where if bold text test is at the bottom, this test will fail
      // Bold text
      cy.get(SLATE_SELECTOR).click('bottom')
      cy.get('[data-testid="ToolbarButton"')
        .contains('format bold')
        .click({ force: true })
      cy.get(SLATE_SELECTOR)
        .click('bottom')
        .type('This will be a strong block{enter}')

      cy.get(RICH_TEXT_BODY_SELECTOR).should(
        'contain.html',
        '<strong>This will be a strong block</strong>'
      )
      cy.get('[data-testid="ToolbarButton"')
        .contains('format bold')
        .click({ force: true })

      // get the rich text editor and type something
      cy.get(SLATE_SELECTOR).click('bottom').type(LONG_FORM_TEXT)
      // It renders paragraphs properly
      cy.get(RICH_TEXT_BODY_SELECTOR)
        .should('contain.html', '<h1>heading 1</h1>')
        .should('contain.html', '<p>para 1</p>')
        .should('contain.html', '<p>para 2</p>')
        .should('contain.html', '<p>para 3</p>')

      // TODO: Test select from the toolbar
      // cy.get('.sc-gIvpjk').click()
      // cy.get(`[data-testid="ToolbarButton"]`).first().click()

      // cy.get(SLATE_SELECTOR).click('bottom').type('this will be a heading')
      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html, "<h1>this will be a heading</h1>'
      // )

      // Testing the "Quote" button
      cy.get(SLATE_SELECTOR).click('bottom').type('This will be a quote')
      cy.get('[data-testid="ToolbarButton"')
        .contains('format quote')
        .click({ force: true })
      cy.get(RICH_TEXT_BODY_SELECTOR).should(
        'contain.html',
        '<blockquote>This will be a quote</blockquote>'
      )

      // Code block
      // cy.get(SLATE_SELECTOR).click('bottom').type('This will be a code block')
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('code')
      //   .click({ force: true })
      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<code>This will be a code block</code>'
      // )

      // TODO: Add below tests back in once we add this functionally back into @tinacms/gql
      // italic
      // cy.get(SLATE_SELECTOR).click('bottom')
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('format italic')
      //   .click({ force: true })
      // cy.get(SLATE_SELECTOR)
      //   .click('bottom')
      //   .type('This will be a italic block{enter}')

      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<em>This will be a italic block</em>'
      // )
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('format italic')
      //   .click({ force: true })

      // underline
      // cy.get(SLATE_SELECTOR).click('bottom')
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('format underlined')
      //   .click({ force: true })
      // cy.get(SLATE_SELECTOR)
      //   .click('bottom')
      //   .type('This will be a underline block{enter}')

      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<u>This will be a underline block</u>'
      // )
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('format underlined')
      //   .click({ force: true })

      // strike though
      // cy.get(SLATE_SELECTOR).click('bottom')
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('strikethrough s')
      //   .click({ force: true })
      // cy.get(SLATE_SELECTOR)
      //   .click('bottom')
      //   .type('This will be a strikethrough block{enter}')

      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<s>This will be a strikethrough block</s>'
      // )
      // cy.get('[data-testid="ToolbarButton"')
      //   .contains('strikethrough s')
      //   .click({ force: true })
    })

    describe('Saving and refresh', () => {
      cy.get('button').contains('Save').click()
      cy.wait(1000)
      // Fake logout
      localStorage.setItem('tina.isEditing', '')
      cy.reload().wait(1000)

      // Do all assertions again on new data
      // We can add these back in when they are working
      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<s>This will be a strikethrough block</s>'
      // )
      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<u>This will be a underline block</u>'
      // )

      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<em>This will be a italic block</em>'
      // )
      cy.get(RICH_TEXT_BODY_SELECTOR).should(
        'contain.html',
        '<strong>This will be a strong block</strong>'
      )
      // cy.get(RICH_TEXT_BODY_SELECTOR).should(
      //   'contain.html',
      //   '<blockquote>This will be a quote</blockquote>'
      // )
    })
  })

  // it('Can edit embedded objects', () => {
  // TODO: add tests for embedded objects
  // expect(1).equal(1)
  // })
})
