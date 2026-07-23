import { type Page, expect } from '@playwright/test';

// The fixture sets `build.basePath: 'my-site'`, so the admin lives under
// /my-site/admin/. Hash routes hang off index.html.
export const ADMIN_ROOT = '/my-site/admin/';
export const ADMIN_INDEX = '/my-site/admin/index.html';

/**
 * A minimal React DevTools global hook. Production React only calls
 * `__REACT_DEVTOOLS_GLOBAL_HOOK__.inject(...)` if the hook already exists —
 * the browser extension normally supplies it. Injecting this stub via
 * `addInitScript` (before any bundle runs) lets us count how many react-dom
 * instances register: exactly one on a healthy single-React build.
 */
export const DEVTOOLS_HOOK_STUB = `
  (() => {
    const renderers = new Map();
    let id = 0;
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      isDisabled: false,
      renderers,
      inject(renderer) { const rid = ++id; renderers.set(rid, renderer); return rid; },
      onCommitFiberRoot() {},
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
      on() {}, off() {}, emit() {}, sub() { return () => {}; },
      checkDCE() {}, getFiberRoots() { return new Set(); },
    };
  })();
`;

/**
 * Wait until the admin shell has mounted (the "local mode" chrome and the
 * left-hand collection nav are both reliable signals across screens).
 */
export async function waitForAdminShell(page: Page): Promise<void> {
  await expect(page.getByText('You are in local mode').first()).toBeVisible({
    timeout: 30000,
  });
}

/**
 * In local mode the LocalAuthProvider gates the admin behind an "Enter Edit
 * Mode" dialog on first visit per browser context (it sets a localStorage
 * flag). Click through it so the GraphQL-backed content renders. Safe to call
 * when the dialog isn't shown.
 */
export async function enterEditMode(page: Page): Promise<void> {
  const btn = page.getByRole('button', {
    name: 'Enter Edit Mode',
    exact: true,
  });
  const appeared = await btn
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  if (appeared) {
    await btn.click();
    await btn.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}

/**
 * Click Save and wait for the GraphQL mutation to resolve. The API is served
 * cross-origin on :4001, so match on the /graphql suffix + 200.
 */
export async function clickSave(page: Page): Promise<void> {
  const saved = page.waitForResponse(
    (resp) => resp.url().includes('/graphql') && resp.status() === 200,
    { timeout: 15000 }
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await saved;
}
