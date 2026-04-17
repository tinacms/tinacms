/**
 * Path-traversal tests at the HTTP boundary.
 *
 * Every traversal vector is applied to every mutation surface (createDocument,
 * updateDocument, deleteDocument) and every media route (upload, list, delete).
 * Each rejection must:
 *
 *   1. Return an error (GraphQL `errors` field, or HTTP 4xx/5xx for media).
 *   2. Not leak server-side filesystem details in the response body. The leak
 *      check strips the attacker's own input first so an echoed payload like
 *      "Path traversal detected: ../../etc/passwd.md" isn't mistaken for a
 *      real disclosure.
 *   3. Not have written a file anywhere under content/post/ or at the
 *      attempted traversal escape target — guards against a regression that
 *      returns an error but still writes the file.
 *
 * Absolute paths (`/etc/passwd.md`) are intentionally excluded from this
 * table: `path.join(collection.path, '/...')` silently drops the leading
 * slash, so no error is raised even though the result stays inside the
 * collection. That case has no attack surface here.
 */

import fs from "fs";
import path from "path";
import { APIRequestContext } from "@playwright/test";
import { test, expect } from "../../fixtures/api-context";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../utils/graphql";
import {
  uploadMedia,
  deleteMedia,
  encodeMediaPath,
} from "../../utils/media";

type MediaRouteKey = "upload" | "list" | "delete";

type Vector = {
  label: string;
  path: string;
  /** Vector is already percent-encoded — skip re-encoding in the URL. */
  rawUploadPath?: boolean;
  /**
   * Per-route expected status for the media matrix. Defaults to 403 when
   * unset. Null-byte is the oddball: upload bubbles the fs error as 500;
   * list and delete swallow it via fs.pathExists / fs.remove and return 200
   * with an empty/no-op response. No traversal occurred in either case.
   */
  mediaStatus?: Partial<Record<MediaRouteKey, number>>;
};

const TRAVERSAL_VECTORS: Vector[] = [
  { label: "relative ../ traversal", path: "../../etc/passwd.md" },
  {
    label: "URL-encoded traversal",
    path: "..%2F..%2Fetc%2Fpasswd.md",
    rawUploadPath: true,
  },
  {
    label: "null byte",
    path: "evil\u0000.md",
    mediaStatus: { upload: 500, list: 200, delete: 200 },
  },
  { label: "backslash traversal", path: "..\\..\\etc\\passwd.md" },
];

// Server-side disclosure indicators: drive letters, home directories, and
// absolute Unix paths that wouldn't appear in an attacker-controlled payload.
const FILESYSTEM_LEAK = /([A-Z]:\\|\/Users\/|\/home\/|\/root\/)/i;

const assertNoLeak = (responseText: string, vector: Vector) => {
  const residual = responseText
    .replace(vector.path, "")
    .replace(decodeURIComponent(vector.path.replace(/%00/gi, "")), "");
  expect(residual).not.toMatch(FILESYSTEM_LEAK);
};

// ---------------------------------------------------------------------------
// Disk-write guard
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const POST_DIR = path.join(PROJECT_ROOT, "content", "post");

// If validation were ever bypassed and the write path were reached, the
// malicious payload would most plausibly land at one of these locations.
// None of them should ever contain the file — the resolver rejects earlier.
const FORBIDDEN_TARGETS = [
  path.join(POST_DIR, "passwd.md"),
  path.join(POST_DIR, "etc", "passwd.md"),
  path.join(POST_DIR, "evil.md"),
  path.join(PROJECT_ROOT, "etc", "passwd.md"),
];

const assertNoEscapeWrite = () => {
  for (const target of FORBIDDEN_TARGETS) {
    expect(
      fs.existsSync(target),
      `Security regression: file was written at ${target}`
    ).toBe(false);
  }
};

// ---------------------------------------------------------------------------
// GraphQL mutation matrix — 4 vectors × 3 mutations = 12 tests
// ---------------------------------------------------------------------------

type MutationRunner = {
  name: string;
  run: (
    ctx: APIRequestContext,
    relativePath: string
  ) => Promise<{ errors?: unknown[] }>;
};

const MUTATIONS: MutationRunner[] = [
  {
    name: "createDocument",
    run: (ctx, relativePath) =>
      createDocument(ctx, {
        collection: "post",
        relativePath,
        params: { post: { title: "traversal", body: "traversal" } },
      }),
  },
  {
    name: "updateDocument",
    run: (ctx, relativePath) =>
      updateDocument(ctx, {
        collection: "post",
        relativePath,
        params: { post: { title: "traversal", body: "traversal" } },
      }),
  },
  {
    name: "deleteDocument",
    run: (ctx, relativePath) =>
      deleteDocument(ctx, { collection: "post", relativePath }),
  },
];

for (const mutation of MUTATIONS) {
  for (const vector of TRAVERSAL_VECTORS) {
    test(`${mutation.name} rejects ${vector.label}`, async ({ apiContext }) => {
      const body = await mutation.run(apiContext, vector.path);

      expect(body.errors).toBeDefined();
      assertNoLeak(JSON.stringify(body.errors), vector);
      assertNoEscapeWrite();
    });
  }
}

// ---------------------------------------------------------------------------
// Media route matrix — 4 vectors × 3 routes = 12 tests
// ---------------------------------------------------------------------------

type MediaRouteRunner = {
  name: string;
  key: MediaRouteKey;
  run: (
    ctx: APIRequestContext,
    relativePath: string,
    rawPath: boolean | undefined
  ) => ReturnType<APIRequestContext["post"]>;
};

const MEDIA_ROUTES: MediaRouteRunner[] = [
  {
    name: "media upload",
    key: "upload",
    run: (ctx, relativePath, rawPath) =>
      uploadMedia(ctx, relativePath, Buffer.from("x"), { rawPath }),
  },
  {
    name: "media list",
    key: "list",
    run: (ctx, relativePath, rawPath) =>
      ctx.get(`/media/list/${encodeMediaPath(relativePath, rawPath)}`),
  },
  {
    name: "media delete",
    key: "delete",
    run: (ctx, relativePath, rawPath) =>
      deleteMedia(ctx, relativePath, { rawPath }),
  },
];

for (const route of MEDIA_ROUTES) {
  for (const vector of TRAVERSAL_VECTORS) {
    test(`${route.name} rejects ${vector.label}`, async ({ apiContext }) => {
      // KNOWN ISSUE (TinaCMS): the /media DELETE handler catches Node's
      // ERR_INVALID_ARG_VALUE from fs.stat on a null-byte path and echoes
      // the raw error message back, which contains the absolute server
      // path. No traversal occurs — nothing is deleted — but the response
      // leaks disk topology. Flip back to a failing test once TinaCMS
      // sanitises the delete error body.
      test.fixme(
        route.key === "delete" && vector.label === "null byte",
        "Media delete leaks absolute server path in null-byte error response"
      );

      const resp = await route.run(
        apiContext,
        vector.path,
        vector.rawUploadPath
      );

      expect(resp.status()).toBe(vector.mediaStatus?.[route.key] ?? 403);
      assertNoLeak(await resp.text(), vector);
    });
  }
}
