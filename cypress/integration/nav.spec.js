/// <reference types="cypress" />

describe("Navigation", () => {
  it("should navigate to the about page", () => {
    // Start from the index page
    cy.visit("http://localhost:3000/");

    // Find a link with an href attribute containing "about" and click it
    cy.get('a[href*="about"]').click();

    // The new url should include "/about"
    cy.url().should("include", "/about");
  });
  it("should navigate to the posts page", () => {
    cy.visit("http://localhost:3000/");
    const postsBtn = cy.get("ul.flex > li:nth-child(3) > a:nth-child(1)");
    postsBtn.click();
    cy.url().should("include", "/posts");
    // postsBtn.parent("li").should("have.class", "border-b-3");
    cy.get("ul.flex > li:nth-child(3)").should("have.class", "border-b-3");
  });
  it("should navigate to each post", () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit("http://localhost:3000/");
    cy.get(":nth-child(3) > .select-none").click();
    cy.get('[href="/posts/anotherPost"] > .text-gray-900').click();
    cy.get(".border-b-3 > .select-none").click();
    cy.get('[href="/posts/voteForPedro"]').click();
    cy.get(".gap-6 > :nth-child(1) > .select-none").click();
    /* ==== End Cypress Studio ==== */
  });
});
