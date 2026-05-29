import { test as base, APIRequestContext } from "@playwright/test";

type ApiFixtures = {
  apiContext: APIRequestContext;
};

/**
 * Extended test with a shared APIRequestContext pre-configured for GraphQL
 * calls. Import `test` and `expect` from this file instead of
 * `@playwright/test` in any test that needs API access.
 */
export const test = base.extend<ApiFixtures>({
  apiContext: async ({ playwright }, use) => {
    // No extraHTTPHeaders: Playwright derives Content-Type automatically from
    // the request body (application/json for `data`, multipart/form-data with
    // boundary for `multipart`). A hard-coded default would break media
    // uploads by clobbering the multipart boundary.
    const context = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? "http://localhost:4001",
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from "@playwright/test";
