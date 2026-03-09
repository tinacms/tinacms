import { test as apiTest } from "./api-context";
import deleteBlogPost from "../utils/deleteBlogPost";

type TrackedDocument = {
  collection: string;
  relativePath: string;
};

type ContentLifecycleFixtures = {
  /**
   * Call `contentCleanup.track(collection, relativePath)` inside a test to
   * register a document for automatic deletion after the test completes.
   *
   * Example:
   *   test("creates a post", async ({ page, contentCleanup }) => {
   *     // ... create the post via the UI ...
   *     contentCleanup.track("post", "my-new-post.md");
   *   });
   */
  contentCleanup: {
    track(collection: string, relativePath: string): void;
  };
};

export const test = apiTest.extend<ContentLifecycleFixtures>({
  contentCleanup: async ({ apiContext }, use) => {
    const tracked: TrackedDocument[] = [];

    await use({
      track(collection: string, relativePath: string) {
        tracked.push({ collection, relativePath });
      },
    });

    // Teardown: delete every document registered during the test
    for (const { collection, relativePath } of tracked) {
      try {
        await deleteBlogPost(apiContext, collection, relativePath);
      } catch (error) {
        console.error(
          `Failed to delete ${collection}/${relativePath} during teardown:`,
          error
        );
      }
    }
  },
});

export { expect } from "@playwright/test";
