import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { type Page, expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  enterEditMode,
  waitForAdminShell,
} from './utils/admin-helpers';

// mermaid is roughly 600 KB of diagram library that most documents never use.
// The rich-text editor reaches it through a dynamic import, so the browser
// downloads it only once a mermaid code block is on screen (#7245).
//
// Matching request URLs against the word "mermaid" would not guard that. A
// static `import mermaid from 'mermaid'` changes which chunk the entry pulls
// in, not what that chunk is called, so a name-based assertion can stay green
// while every visitor pays for the library again. Instead this spec reads the
// built chunks, works out which files carry mermaid's own source, and asserts
// on those filenames — whether mermaid ends up inlined into the entry chunk or
// eagerly imported beside it, the same assertion catches it.
const ASSETS_DIR = join(__dirname, '..', 'public', 'admin', 'assets');

// String literals from mermaid's source that survive minification. A chunk has
// to contain all of them before it counts, so one incidental word cannot widen
// the set.
const MERMAID_MARKERS = [
  'No diagram type detected matching given configuration for text',
  'UnknownDiagramError',
  'mermaid version ',
];

/** Built chunks whose contents include mermaid's own source. */
function mermaidChunkFilenames(): string[] {
  expect(
    existsSync(ASSETS_DIR),
    `Built admin assets not found at ${ASSETS_DIR} — did the webServer run "tinacms build"?`
  ).toBe(true);

  const chunks = readdirSync(ASSETS_DIR)
    .filter((file) => file.endsWith('.js'))
    .filter((file) => {
      const source = readFileSync(join(ASSETS_DIR, file), 'utf8');
      return MERMAID_MARKERS.every((marker) => source.includes(marker));
    });

  // Without this the "nothing was loaded" assertion would pass vacuously the
  // day mermaid stops shipping these literals.
  expect(
    chunks.length,
    `No built chunk contains every mermaid marker (${MERMAID_MARKERS.join(' / ')}). The markers are stale — update them before trusting this spec.`
  ).toBeGreaterThan(0);

  return chunks;
}

/** Filenames of the JS chunks the browser asked for, in request order. */
function trackRequestedChunks(page: Page): string[] {
  const filenames: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.endsWith('.js')) {
      filenames.push(path.slice(path.lastIndexOf('/') + 1));
    }
  });
  return filenames;
}

test('editing a document with a non-mermaid code block loads no mermaid', async ({
  page,
}) => {
  const mermaidChunks = mermaidChunkFilenames();
  const requested = trackRequestedChunks(page);

  await page.goto(`${ADMIN_INDEX}#/collections/edit/post/plain-code`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  // The code block being on screen means CodeBlockElement has mounted and its
  // language check has already decided whether to reach for mermaid.
  await expect(page.locator('pre.tina-code-block')).toBeVisible({
    timeout: 30000,
  });

  // A request the editor fires on mount would still be in flight here, so wait
  // for the page to stop fetching before reading the list.
  await page.waitForLoadState('networkidle');

  expect(
    requested.filter((file) => mermaidChunks.includes(file)),
    `mermaid reached the browser for a document with no diagram. It lives in: ${mermaidChunks.join(', ')}`
  ).toEqual([]);
});

test('previewing a mermaid code block loads mermaid and draws the diagram', async ({
  page,
}) => {
  const mermaidChunks = mermaidChunkFilenames();
  const requested = trackRequestedChunks(page);

  await page.goto(`${ADMIN_INDEX}#/collections/edit/post/diagram`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  // Code blocks open in edit mode; "Preview" swaps in the diagram renderer.
  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  // mermaid.run replaces the <pre> contents with the drawing it produced, so
  // an <svg> here is the proof that the lazily-loaded library ran. Without it,
  // deleting the import altogether would satisfy the assertion above.
  await expect(page.locator('pre.mermaid svg')).toBeVisible({ timeout: 30000 });

  expect(
    requested.filter((file) => mermaidChunks.includes(file)).length,
    'the diagram rendered without any chunk carrying mermaid source being fetched'
  ).toBeGreaterThan(0);
});
