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

// Not really an error? see https://github.com/cypress-io/cypress/issues/8418
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false
  }
})

describe('Rich Text Editor', () => {
  describe('italic', () => {
    it('is correctly rendered from markdown', () => {
      cy.assertRTE('*italic*', '', '<em>italic</em>')
    })

    it('can be typed', () => {
      cy.assertRTE('', '_italic_', '<em>italic</em>')
    })
  })

  describe('bold', () => {
    it('is correctly rendered from markdown', () => {
      cy.assertRTE('**bold**', '', '<strong>bold</strong>')
    })

    it('can be typed', () => {
      cy.assertRTE('', '**bold**', '<strong>bold</strong>', '**bold**')
    })
  })

  describe('headings', () => {
    it('is correctly rendered from markdown', () => {
      cy.assertRTE(
        '# h1\n\n## h2\n\n### h3\n\n#### h4\n\n##### h5\n\n###### h6',
        '',
        '<h1>h1</h1><h2>h2</h2><h3>h3</h3><h4>h4</h4><h5>h5</h5><h6>h6</h6>'
      )
    })

    it('can be typed', () => {
      cy.assertRTE(
        '',
        '# h1{enter}## h2{enter}### h3{enter}#### h4{enter}##### h5{enter}###### h6',
        '<h1>h1</h1><h2>h2</h2><h3>h3</h3><h4>h4</h4><h5>h5</h5><h6>h6</h6>'
      )
    })
  })

  describe('new lines', () => {
    it('is correctly rendered from markdown', () => {
      cy.assertRTE(
        'First line   \nSecond line',
        '',
        '<p>First line<br>Second line</p>'
      )
    })

    it('can be typed', () => {
      cy.assertRTE(
        '',
        'First line{shift+enter}Second line',
        '<p>First line<br>Second line</p>'
      )
    })
  })

  describe('paragraphs', () => {
    it('is correctly rendered from markdown', () => {
      cy.assertRTE(
        'P 1\nP 2\nP 3\n\nP 4',
        '',
        '<p>P 1</p><p>P 2</p><p>P 3</p><p></p><p>P 4</p>'
      )
      cy.assertRTE(
        '\nP 1\n\nP 2\n\nP 3\n\nP 4\n',
        '',
        '<p>P 1</p><p>P 2</p><p>P 3</p><p></p><p>P 4</p>'
      )
    })

    it('can be typed', () => {
      cy.assertRTE(
        '',
        'P 1{enter}P 2{enter}P 3{enter}{enter}P 4',
        '<p>P 1</p><p>P 2</p><p>P 3</p><p></p><p>P 4</p>',
        '\nP 1\n\nP 2\n\nP 3\n\nP 4\n'
      )
    })
  })
})
