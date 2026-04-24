import fs from "fs";
import path from "path";
import { test as apiTest } from "./api-context";
import { deleteDocument, type CollectionName } from "../utils/graphql";
import { deleteMedia, listMedia } from "../utils/media";

// Mirrors the `path:` field on every collection in tina/collections/*.
const CONTENT_ROOT = path.resolve(__dirname, "..", "content");

type TrackedDocument = {
  collection: CollectionName;
  relativePath: string;
};

type ContentLifecycleFixtures = {
  /** Register a document for automatic deletion after the test completes. */
  contentCleanup: {
    track(collection: CollectionName, relativePath: string): void;
  };
  /** Register an uploaded media file for automatic deletion. */
  mediaCleanup: {
    track(relativePath: string): void;
  };
};

export const test = apiTest.extend<ContentLifecycleFixtures>({
  contentCleanup: async ({ apiContext }, use) => {
    const tracked: TrackedDocument[] = [];

    await use({
      track(collection, relativePath) {
        tracked.push({ collection, relativePath });
      },
    });

    for (const { collection, relativePath } of tracked) {
      // Skip already-deleted docs so teardown stays quiet when the test
      // already removed them. Falls back to attempting delete if the
      // collection root isn't where we expect.
      const collectionRoot = path.join(CONTENT_ROOT, collection);
      if (fs.existsSync(collectionRoot)) {
        const onDisk = path.join(collectionRoot, relativePath);
        if (!fs.existsSync(onDisk)) continue;
      }

      try {
        await deleteDocument(apiContext, { collection, relativePath });
      } catch (error) {
        console.error(
          `Failed to delete ${collection}/${relativePath} during teardown:`,
          error
        );
      }
    }
  },

  mediaCleanup: async ({ apiContext }, use) => {
    const tracked: string[] = [];

    await use({
      track(relativePath) {
        tracked.push(relativePath);
      },
    });

    if (tracked.length === 0) return;

    // Skip already-deleted files so teardown stays quiet when the test
    // already removed them. Falls back to blind delete if list fails.
    let existing: Set<string>;
    try {
      const list = await listMedia(apiContext);
      existing = new Set(list.files.map((f) => f.filename));
    } catch {
      existing = new Set(tracked);
    }

    for (const relativePath of tracked) {
      if (!existing.has(relativePath)) continue;
      try {
        await deleteMedia(apiContext, relativePath);
      } catch (error) {
        console.error(
          `Failed to delete media ${relativePath} during teardown:`,
          error
        );
      }
    }
  },
});

export { expect } from "@playwright/test";
