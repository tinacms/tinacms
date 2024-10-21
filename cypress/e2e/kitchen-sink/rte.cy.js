// Not really an error? see https://github.com/cypress-io/cypress/issues/8418
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false
  }
})

describe('Rich Text Editor', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:4001/graphql',
      body: {
        query: `mutation {
          updateDocument(
            relativePath: "home.mdx"
            params: {
              page: { heading: "", subtitle: "", body: { type: "root", children: [] } }
            }
          ) {
            __typename
          }
        }
        `,
        variables: {},
      },
    })
  })

  describe('paragraphs', () => {
    /**
     * Skipping because the markdown ast sent from the API will remove any empty blocks before sending it down
     */
    it.skip('is correctly rendered from markdown', () => {
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
