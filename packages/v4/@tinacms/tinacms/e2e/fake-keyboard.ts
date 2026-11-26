import type { Page } from '@playwright/test';

/** A keyboard shrinks the visual viewport and leaves the layout viewport alone. */
export const fakeKeyboard = (page: Page, shrink: number) =>
  page.evaluate((by) => {
    const visual = window.visualViewport;
    if (!visual) throw new Error('no visual viewport');
    Object.defineProperty(visual, 'height', {
      configurable: true,
      value: window.innerHeight - by,
    });
    visual.dispatchEvent(new Event('resize'));
  }, shrink);
