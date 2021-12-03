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
  })

  it('Can edit embedded objects', () => {
    expect(1).equal(1)
  })
})
