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
  afterEach(() => {
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
  beforeEach(() => {
    // reset content from GraphQL API
    cy.request({
      method: 'POST',
      url: 'http://localhost:4001/graphql',
      body: {
        query: `mutation {
          updateDocument(collection: "page" relativePath: "home.mdx"  params: {page: {heading: "" subtitle: ""}}){
            __typename
          }
        }`,
      },
    })

    // cy.intercept('http://localhost:4001/graphql').as('graphQL')
    // cy.intercept('/_next/**').as('next')
    cy.visit('/admin/index.html#/~')

    // Fake Login
    cy.login()

    // Open the sidebar (note: sidebar is defaulting to open)
    // cy.get(`[aria-label="opens cms sidebar"]`, { timeout: 5000 }).click()

    // Delete all text in rich text editor
    // Best practice is to clean up state BEFORE the test: https://docs.cypress.io/guides/references/best-practices#Using-after-or-afterEach-hooks

    // cy.get('[data-test="form:content/page/home.mdx"]')
    //   .first()
    //   .scrollTo('bottomLeft', {
    //     easing: 'linear',
    //     duration: 100,
    //   })
    //   .then((_) => {
    //     const backspace = Array(300).fill(`{backspace}`).join('')
    //     cy.get(SLATE_SELECTOR)
    //       .scrollIntoView({ easing: 'linear', duration: 100 })
    //       .click({}, { timeout: 3000 })
    //       .type(backspace)
    //     cy.get('button').contains('Save').click()
    //     cy.wait('@graphQL')
    //     cy.visit('/')
    //   })

    // Open the sidebar
    // cy.get(`[aria-label="opens cms sidebar"]`, { timeout: 5000 }).click()
  })
  it('Can edit text', () => {
    cy.get('[data-test="form:content/page/home.mdx"]')
      .first()
      .scrollTo('top', {
        easing: 'linear',
        duration: 100,
      })
      .then((_) => {
        // Edit subtitle
        cy.get('textarea[name="subtitle"]', { timeout: 3000 })
          .click()
          .type(SUBTITLE_TEXT)

        cy.get(`iframe[data-test="tina-iframe"]`)
          .should('exist')
          .its('0.contentDocument')
          .should('exist')
          .its('body')
          .should('not.be.undefined')
          .then(cy.wrap)
          .find('[data-test="subtitle"]')
          .should('contain', SUBTITLE_TEXT)

        // cy.get('[data-test="form:content/page/home.mdx"]').first().scrollTo('top')
        // Editing heading
        cy.get('input[name="heading"]', { timeout: 3000 })
          .click()
          .type(HEADING_TEXT)

        cy.get(`iframe[data-test="tina-iframe"]`)
          .should('exist')
          .its('0.contentDocument')
          .should('exist')
          .its('body')
          .should('not.be.undefined')
          .then(cy.wrap)
          .find('[data-test="heading"]')
          .should('contain', HEADING_TEXT)
      })
  })

  it('Can edit rich text', () => {
    cy.get('[data-test="form:content/page/home.mdx"]')
      .first()
      .scrollTo('bottom', {
        easing: 'linear',
        duration: 100,
      })
      .then((_) => {
        describe('Edit rich Text', () => {
          // TODO: fix issue where if bold text test is at the bottom, this test will fail
          // Bold text
          describe('Edit Bold', () => {
            cy.get(SLATE_SELECTOR, { timeout: 4000 })
              .scrollIntoView({ easing: 'linear', duration: 100 })
              .then((_) => {
                // Edit Bold
                cy.get(SLATE_SELECTOR).children().first().click()
                // cy.get(SLATE_SELECTOR).should('have.focus')
                // cy.pause()
                // cy.get('[data-test="overflowMenuButton"]').click()
                cy.get('[data-test="popoverRichTextButton"]').click()
                // cy.pause()
                cy.get('[data-test="boldOverflowButton"]').click({
                  timeout: 4000,
                })
                // cy.get(SLATE_SELECTOR).should('have.focus')
                cy.get(SLATE_SELECTOR)
                  .children()
                  .first()
                  .click()
                  // .should('have.focus')
                  .type('This will be a strong block{enter}')
                // cy.pause()
                cy.get('[data-test="popoverRichTextButton"]').click()
                cy.get('[data-test="boldOverflowButton"]').click()
                cy.get(`iframe[data-test="tina-iframe"]`)
                  .should('exist')
                  .its('0.contentDocument')
                  .should('exist')
                  .its('body')
                  .should('not.be.undefined')
                  .then(cy.wrap)
                  .find(RICH_TEXT_BODY_SELECTOR)
                  .should(
                    'contain.html',
                    '<strong>This will be a strong block</strong>'
                  )

                // Edit Paragraphs
                cy.get(SLATE_SELECTOR).click('bottomLeft').type(LONG_FORM_TEXT)
                // It renders paragraphs properly
                cy.get(`iframe[data-test="tina-iframe"]`)
                  .should('exist')
                  .its('0.contentDocument')
                  .should('exist')
                  .its('body')
                  .should('not.be.undefined')
                  .then(cy.wrap)
                  .find(RICH_TEXT_BODY_SELECTOR)
                  .should('contain.html', '<h1>heading 1</h1>')
                  .should('contain.html', '<p>para 1</p>')
                  .should('contain.html', '<p>para 2</p>')
                  .should('contain.html', '<p>para 3</p>')

                // Edit Quotes
                cy.get(SLATE_SELECTOR)
                  .click('bottomLeft')
                  .type('This will be a quote')
                cy.get('[data-test="quoteButton"').click()

                // cy.get(RICH_TEXT_BODY_SELECTOR).should(
                //   'contain.html',
                //   '<blockquote>This will be a quote</blockquote>'
                // )
              })
          })

          // TODO: Test select from the toolbar
          // cy.get('.sc-gIvpjk').click()
          // cy.get(`[data-testid="ToolbarButton"]`).first().click()

          // cy.get(SLATE_SELECTOR).click('bottom').type('this will be a heading')
          // cy.get(RICH_TEXT_BODY_SELECTOR).should(
          //   'contain.html, "<h1>this will be a heading</h1>'
          // )

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

        // describe('Saving and refresh', () => {
        // cy.get('button').contains('Save').click()
        // Fake logout
        // localStorage.setItem('tina.isEditing', 'true')
        // cy.reload()
        // Do all assertions again on new data
        // We can add these back in when they are working

        // cy.get(RICH_TEXT_BODY_SELECTOR).should(
        //   'contain.html',
        //   '<em>This will be a italic block</em>'
        // )

        // TODO: these tests fail because the server is severing stale data.
        // cy.get(RICH_TEXT_BODY_SELECTOR).should(
        //   'contain.html',
        //   '<strong>This will be a strong block</strong>'
        // )

        // Not sure why this version has a P and the other one does not
        // cy.get(RICH_TEXT_BODY_SELECTOR).should(
        //   'contain.html',
        //   '<blockquote><p>This will be a quote</p></blockquote>'
        // )
        // })
      })

    // it('Can edit embedded objects', () => {
    // TODO: add tests for embedded objects
    // expect(1).equal(1)
    // })
  })
})
