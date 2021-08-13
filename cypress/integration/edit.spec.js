/// <reference types="cypress" />

describe("Edit mode", () => {
  it("should enter edit mode", () => {
    // Start from the index page
    cy.visit("http://localhost:3000/");
    cy.get("#__next > div:nth-child(1) > a").click();
  });
  it("add content to the home page", () => {
    cy.visit("http://localhost:3000/");
    // Make sure the edit button is present
    cy.get("#__next > div:nth-child(1) > a").should("exist");
    // Redirects do not seem to work in Electron. So this is a work around
    cy.visit("/admin");
    cy.wait(2000);
    cy.visit("/");
    cy.get(`[aria-label="toggles cms sidebar"]`, { timeout: 5000 }).click();
    cy.get(".edit-page--list-parent > :nth-child(1)").click();
    cy.get(":nth-child(1) > .BaseTextField-sc-1hz3p6r").clear();
    cy.get(":nth-child(1) > .BaseTextField-sc-1hz3p6r").type("This is an edit");
    const test = cy.get(".ProseMirror");
    console.log({ test });
    test.click();
    cy.get('[data-tooltip="Heading"]').click();
    cy.get(".HeadingThree-sc-18gsyhq").click();
    cy.get(".lgsGjh").click();
    /* ==== End Cypress Studio ==== */
  });
});
