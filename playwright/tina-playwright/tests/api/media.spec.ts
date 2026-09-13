/**
 * Media routes end-to-end — upload → list → delete against the real Vite
 * dev server writing to public/uploads/.
 */

import { test, expect } from "../../fixtures/test-content";
import {
  uploadMedia,
  listMedia,
  deleteMedia,
  renameMedia,
} from "../../utils/media";

// The framework dev server that serves public/; the Tina API server that
// apiContext targets does not.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

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

test("media — upload → rename → list → fetch new URL → delete", async ({
  apiContext,
  mediaCleanup,
}) => {
  const stamp = Date.now();
  const original = `playwright-rename-${stamp}.txt`;
  const renamed = `playwright-renamed-${stamp}.txt`;

  mediaCleanup.track(original);
  mediaCleanup.track(renamed);

  const uploadResp = await uploadMedia(
    apiContext,
    original,
    Buffer.from("rename payload")
  );
  expect(uploadResp.status()).toBe(200);

  const renameResp = await renameMedia(apiContext, original, renamed);
  expect(renameResp.status()).toBe(200);
  expect(await renameResp.json()).toEqual({
    success: true,
    from: original,
    to: renamed,
  });

  // The old path is gone from the listing and the new one has taken its place.
  const afterRename = await listMedia(apiContext);
  const names = afterRename.files.map((f) => f.filename);
  expect(names).not.toContain(original);
  expect(names).toContain(renamed);

  // The served URL follows the new name. Media is served by the framework dev
  // server from public/, not by the Tina API server apiContext points at.
  const src = afterRename.files.find((f) => f.filename === renamed)!.src;
  const served = await apiContext.get(`${SITE_URL}${src}`);
  expect(served.status()).toBe(200);
  expect(await served.text()).toBe("rename payload");

  // ...and the old one stops resolving.
  const oldUrl = await apiContext.get(`${SITE_URL}/uploads/${original}`);
  expect(oldUrl.status()).toBe(404);

  expect((await deleteMedia(apiContext, renamed)).ok()).toBeTruthy();
  const afterDelete = await listMedia(apiContext);
  expect(afterDelete.files.map((f) => f.filename)).not.toContain(renamed);
});

test("media — rename onto an existing name is rejected as a collision", async ({
  apiContext,
  mediaCleanup,
}) => {
  const stamp = Date.now();
  const source = `playwright-collide-src-${stamp}.txt`;
  const taken = `playwright-collide-dest-${stamp}.txt`;

  mediaCleanup.track(source);
  mediaCleanup.track(taken);

  await uploadMedia(apiContext, source, Buffer.from("source"));
  await uploadMedia(apiContext, taken, Buffer.from("destination"));

  const resp = await renameMedia(apiContext, source, taken);
  expect(resp.status()).toBe(409);
  expect((await resp.json()).code).toBe("NAME_COLLISION");

  // Neither file was touched.
  const names = (await listMedia(apiContext)).files.map((f) => f.filename);
  expect(names).toContain(source);
  expect(names).toContain(taken);
});

test("media — rename of a missing file reports NOT_FOUND", async ({
  apiContext,
}) => {
  const stamp = Date.now();
  const resp = await renameMedia(
    apiContext,
    `playwright-missing-${stamp}.txt`,
    `playwright-missing-renamed-${stamp}.txt`
  );
  expect(resp.status()).toBe(404);
  expect((await resp.json()).code).toBe("NOT_FOUND");
});
