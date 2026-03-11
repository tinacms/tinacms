/**
 * Home page tests for the kitchen-sink example app.
 *
 * These tests validate that the home page loads successfully and renders
 * the expected block-based layout. Content text is NOT hard-coded because
 * TinaCMS lets users change it — we only assert structural elements.
 */
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load without errors', async ({ page }) => {
    // The page should not show an error message
    await expect(
      page.locator('text=Error loading home page')
    ).not.toBeVisible();
    await expect(page.locator('text=No blocks to render')).not.toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tina/);
  });

  test('should render the header with site name', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should render at least one block on the page', async ({ page }) => {
    // The home page uses a block system — at least one section should render
    const sections = page.locator('section');
    await expect(sections.first()).toBeVisible();
  });

  test('should render the footer', async ({ page }) => {
    // There may be multiple <footer> elements (e.g. testimonial block + global footer)
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });
});
