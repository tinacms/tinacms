/**
 * Path-traversal tests at the HTTP boundary.
 *
 * Verifies that malicious `relativePath` inputs are rejected by:
 *   - GraphQL createDocument (validated in graphql/src/resolver/index.ts)
 *   - /media/upload       (validated in cli/src/next/.../server/media.ts)
 *
 * Each vector must (a) be rejected and (b) not leak server-side filesystem
 * details in the response body. The leak check strips the attacker's own
 * input first so that an echoed payload like `../../etc/passwd.md` in the
 * error message isn't mistaken for a real disclosure.
 *
 * Absolute paths (`/etc/passwd.md`) are intentionally excluded from this
 * table: `path.join(collection.path, '/...')` in the GraphQL resolver
 * silently drops the leading slash, so no error is raised even though the
 * result is safely contained within the collection.
 */

import { test, expect } from "../../fixtures/api-context";
import { createDocument } from "../../utils/graphql";
import { uploadMedia } from "../../utils/media";

type Vector = {
  label: string;
  path: string;
  /**
   * Already percent-encoded — skip re-encoding in the upload URL so the
   * server receives the payload verbatim and exercises its decode + check
   * path rather than double-decoding our own encoding.
   */
  rawUploadPath?: boolean;
  /**
   * Some vectors (null byte) are rejected by the GraphQL resolver but
   * bubble up as a 500 from /media/upload because Node's `fs` refuses the
   * write before the server's explicit 403 handler fires. Security still
   * holds — the file isn't written — but the status code differs.
   */
  mediaStatus?: number;
};

const TRAVERSAL_VECTORS: Vector[] = [
  { label: "relative ../ traversal", path: "../../etc/passwd.md" },
  {
    label: "URL-encoded traversal",
    path: "..%2F..%2Fetc%2Fpasswd.md",
    rawUploadPath: true,
  },
  { label: "null byte", path: "evil\u0000.md", mediaStatus: 500 },
  { label: "backslash traversal", path: "..\\..\\etc\\passwd.md" },
];

// Server-side disclosure indicators: drive letters, home directories, and
// known project roots. The attacker's input is stripped first so echoed
// payloads don't false-positive.
const FILESYSTEM_LEAK = /([A-Z]:\\|\/Users\/|\/home\/|\/root\/)/i;

const assertNoLeak = (responseText: string, vector: Vector) => {
  const residual = responseText
    .replace(vector.path, "")
    .replace(decodeURIComponent(vector.path.replace(/%00/gi, "")), "");
  expect(residual).not.toMatch(FILESYSTEM_LEAK);
};

for (const vector of TRAVERSAL_VECTORS) {
  test(`createDocument rejects ${vector.label}`, async ({ apiContext }) => {
    const body = await createDocument(apiContext, {
      collection: "post",
      relativePath: vector.path,
      params: { post: { title: "traversal", body: "traversal" } },
    });

    expect(body.errors).toBeDefined();
    assertNoLeak(JSON.stringify(body.errors), vector);
  });

  test(`media upload rejects ${vector.label}`, async ({ apiContext }) => {
    const resp = await uploadMedia(apiContext, vector.path, Buffer.from("x"), {
      rawPath: vector.rawUploadPath,
    });

    expect(resp.status()).toBe(vector.mediaStatus ?? 403);
    assertNoLeak(await resp.text(), vector);
  });
}
