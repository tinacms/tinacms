/**
 * Search index smoke tests — verifies that the `/searchIndex` route is
 * built from real content and returns correct results.
 *
 * Uses the same pre-seeded static fixtures as filtering and sorting:
 *   content/post/playwright-filter-alpha.md  → title: "Filter Alpha Post"
 *   content/post/playwright-filter-beta.md   → title: "Filter Beta Post"
 *   content/post/playwright-filter-aaa.md    → title: "Gamma Unrelated"
 *
 * Search terms are chosen so they appear only in the title, not the filename.
 * This ensures we are testing that the title field is actually indexed, not
 * just that the file path matches.
 *
 *   "gamma" → only in title "Gamma Unrelated", not in filename "playwright-filter-aaa.md"
 *   "filter" → only in titles "Filter Alpha Post" / "Filter Beta Post", not in filename
 *              (filenames contain "filter" too — so this tests the opposite: precision)
 *
 * Tests:
 *   1. Querying "gamma" returns the gamma post — proves title field is indexed
 *   2. Querying "gamma" does not return the alpha or beta posts — proves precision
 */

import { test, expect } from "../../fixtures/api-context";

// ── 1. Title field is indexed — "gamma" only exists in the title ──────────────

test("searchIndex — querying a word from the title returns the matching post", async ({
  apiContext,
}) => {
  const resp = await apiContext.get(
    `/searchIndex?q=${encodeURIComponent(JSON.stringify({ AND: ["gamma"] }))}`
  );

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();

  // If title is not indexed (searchable: true missing), gamma is not in the
  // file path either, so RESULT_LENGTH would be 0
  expect(body.RESULT_LENGTH).toBeGreaterThan(0);

  const ids: string[] = body.RESULT.map((r: { _id: string }) => r._id);
  expect(ids.some((id) => id.includes("playwright-filter-aaa"))).toBe(true);
});

// ── 2. Query is precise — "gamma" does not return unrelated posts ─────────────

test("searchIndex — querying 'gamma' does not return alpha or beta posts", async ({
  apiContext,
}) => {
  const resp = await apiContext.get(
    `/searchIndex?q=${encodeURIComponent(JSON.stringify({ AND: ["gamma"] }))}`
  );

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();

  const ids: string[] = body.RESULT.map((r: { _id: string }) => r._id);
  expect(ids.some((id) => id.includes("playwright-filter-alpha"))).toBe(false);
  expect(ids.some((id) => id.includes("playwright-filter-beta"))).toBe(false);
});
