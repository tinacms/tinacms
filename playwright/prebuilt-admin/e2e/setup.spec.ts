import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// Meta-assertion: guard against an accidentally-tame fixture. If the hostile
// ingredients ever stop reaching the production bundle, the browser specs could
// pass forever while real-world configs die. This greps the built admin chunks
// to prove the risky modules actually made it in.
const ASSETS_DIR = join(__dirname, '..', 'public', 'admin', 'assets');

function readBuiltJs(): string {
  expect(
    existsSync(ASSETS_DIR),
    `Built admin assets not found at ${ASSETS_DIR} — did the webServer run "tinacms build"?`
  ).toBe(true);
  return readdirSync(ASSETS_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(join(ASSETS_DIR, f), 'utf8'))
    .join('\n');
}

test.describe('built bundle contains the hostile ingredients', () => {
  test('next/image (CJS require(react)) is bundled', () => {
    const js = readBuiltJs();
    // next/image internals that survive minification.
    const nextImageTokens = [
      'imageConfigDefault',
      'deviceSizes',
      'VALID_LOADERS',
      '__NEXT_IMAGE',
    ];
    const present = nextImageTokens.filter((t) => js.includes(t));
    expect(
      present.length,
      `Expected next/image markers in the build, found none of: ${nextImageTokens.join(', ')}`
    ).toBeGreaterThan(0);
  });

  test('custom media store is bundled', () => {
    const js = readBuiltJs();
    expect(js).toContain('prebuilt-fixture-media');
  });

  test('tinacms-authjs / next-auth is bundled', () => {
    const js = readBuiltJs();
    expect(js.includes('next-auth') || js.includes('CLIENT_FETCH_ERROR')).toBe(
      true
    );
  });
});
