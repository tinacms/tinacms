import { deleteDocument } from '../utils/delete-document';
import { test as apiTest } from './api-context';

type TrackedDocument = {
  collection: string;
  relativePath: string;
};

type ContentLifecycleFixtures = {
  /**
   * Call `contentCleanup.track(collection, relativePath)` inside a test to
   * register a document for automatic deletion after the test completes.
   *
   * Documents are deleted in reverse order (LIFO) so that dependents are
   * removed before their dependencies.
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

    // Teardown: delete every document registered during the test (LIFO order)
    for (const { collection, relativePath } of tracked.reverse()) {
      try {
        await deleteDocument(apiContext, collection, relativePath);
      } catch (error) {
        console.warn(
          `[cleanup] Failed to delete ${collection}/${relativePath}:`,
          error
        );
      }
    }
  },
});

export { expect } from '@playwright/test';
