/**
 * Media routes end-to-end — upload → list → delete against the real Vite
 * dev server writing to public/uploads/.
 */

import { test, expect } from "../../fixtures/test-content";
import { uploadMedia, listMedia, deleteMedia } from "../../utils/media";

test("media — upload → list → delete round-trip", async ({
  apiContext,
  mediaCleanup,
}) => {
  const filename = `playwright-media-${Date.now()}.txt`;
  const contents = Buffer.from("playwright upload payload");

  // Track before the first assertion so teardown runs even if the test fails.
  mediaCleanup.track(filename);

  // UPLOAD — multipart POST writes the file to public/uploads/.
  const uploadResp = await uploadMedia(apiContext, filename, contents);
  expect(uploadResp.status()).toBe(200);
  expect(await uploadResp.json()).toEqual({ success: true });

  // LIST — the uploaded file must appear in the directory listing.
  const afterUpload = await listMedia(apiContext);
  expect(afterUpload.files.map((f) => f.filename)).toContain(filename);

  // DELETE — remove the file and confirm it's gone from subsequent listings.
  const deleteResp = await deleteMedia(apiContext, filename);
  expect(deleteResp.ok()).toBeTruthy();

  const afterDelete = await listMedia(apiContext);
  expect(afterDelete.files.map((f) => f.filename)).not.toContain(filename);
});
