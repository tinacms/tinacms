// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      focusRTE(): Chainable<JQuery<HTMLElement>>
      getRTE(): Chainable<JQuery<HTMLElement>>
      getSaveButton(): Chainable<JQuery<HTMLElement>>
      save(): Chainable<JQuery<HTMLElement>>
      assertRTE(
        markdown?: string,
        typed?: string,
        wantedHTML?: string,
        wantedMD?: string
      ): Chainable<HTMLElement>
      login(): Chainable<Element>
      logout(): Chainable<Element>
      getPageRTEBody(): Chainable<JQuery<Element>>
    }
  }
}

export {}
