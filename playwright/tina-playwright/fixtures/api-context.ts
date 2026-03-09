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
    const context = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? "http://localhost:4001",
      extraHTTPHeaders: {
        "Content-Type": "application/json",
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from "@playwright/test";
