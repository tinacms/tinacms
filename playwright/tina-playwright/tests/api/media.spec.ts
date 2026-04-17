/**
 * Media routes end-to-end — verifies /media/upload, /media/list and
 * /media/{path} work against the real Vite dev server and write/read from
 * public/uploads/ as configured in tina/config.js.
 */

import { test, expect } from "../../fixtures/test-content";
import { uploadMedia, listMedia, deleteMedia } from "../../utils/media";

test("media — upload → list → delete round-trip", async ({
  apiContext,
  mediaCleanup,
}) => {
  const filename = `playwright-media-${Date.now()}.txt`;
  const contents = Buffer.from("playwright upload payload");

  // Track before the first assertion so teardown runs even if any step below fails.
  mediaCleanup.track(filename);

  // UPLOAD
  const uploadResp = await uploadMedia(apiContext, filename, contents);
  expect(uploadResp.status()).toBe(200);
  expect(await uploadResp.json()).toEqual({ success: true });

  // LIST — file must appear
  const afterUpload = await listMedia(apiContext);
  expect(afterUpload.files.map((f) => f.filename)).toContain(filename);

  // DELETE
  const deleteResp = await deleteMedia(apiContext, filename);
  expect(deleteResp.ok()).toBeTruthy();

  // LIST — file must be gone
  const afterDelete = await listMedia(apiContext);
  expect(afterDelete.files.map((f) => f.filename)).not.toContain(filename);
});

test("media — list returns the expected shape", async ({ apiContext }) => {
  const list = await listMedia(apiContext);
  expect(Array.isArray(list.files)).toBe(true);
  expect(Array.isArray(list.directories)).toBe(true);
});
