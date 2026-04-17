import fs from "fs";
import path from "path";
import { test as apiTest } from "./api-context";
import { deleteDocument } from "../utils/graphql";
import { deleteMedia, listMedia } from "../utils/media";

// Convention mirrors the `path:` field on every collection in tina/collections/*.
const CONTENT_ROOT = path.resolve(__dirname, "..", "content");

type TrackedDocument = {
  collection: string;
  relativePath: string;
};

type ContentLifecycleFixtures = {
  /**
   * Register a document for automatic deletion after the test completes.
   *
   *   test("creates a post", async ({ page, contentCleanup }) => {
   *     // ... create the post via the UI ...
   *     contentCleanup.track("post", "my-new-post.md");
   *   });
   */
  contentCleanup: {
    track(collection: string, relativePath: string): void;
  };
  /**
   * Register an uploaded media file for automatic deletion after the test
   * completes. `relativePath` is the path used in the upload URL, e.g.
   * `my-file.txt` or `subfolder/my-file.txt`.
   */
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
      // Skip if the test itself already deleted the doc — otherwise the dev
      // server logs "Unable to delete document ... does not exist". The
      // filesystem check falls back to attempting delete if the collection
      // root isn't where we expect, preserving the safety-net.
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

    // Skip files the test itself already deleted — otherwise the dev server
    // emits a raw ENOENT into the test log on the second delete. Listing the
    // media root covers every path our specs currently track.
    let existing: Set<string>;
    try {
      const list = await listMedia(apiContext);
      existing = new Set(list.files.map((f) => f.filename));
    } catch {
      existing = new Set(tracked); // list failed — fall back to blind delete
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
