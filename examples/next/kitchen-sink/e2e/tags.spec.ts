/**
 * Tags listing & detail page tests.
 *
 * Validates the tags listing page renders tag cards and that tag detail
 * pages load correctly.
 */
import { test, expect } from '@playwright/test'

test.describe('Tags Listing Page', () => {
  test('should load the tags page', async ({ page }) => {
    await page.goto('/tags')
    await expect(page.locator('h1')).toContainText(/Tags/i)
  })

  test('should display at least one tag', async ({ page }) => {
    await page.goto('/tags')
    const tagCards = page.locator('a[href^="/tags/"]')
    const count = await tagCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to a tag detail page', async ({ page }) => {
    await page.goto('/tags')
    const firstTag = page.locator('a[href^="/tags/"]').first()
    const href = await firstTag.getAttribute('href')
    expect(href).toBeTruthy()

    await firstTag.click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).not.toContainText('404')
  })
})

test.describe('Tag Detail Page', () => {
  test('should render tag title', async ({ page }) => {
    await page.goto('/tags')
    const firstTag = page.locator('a[href^="/tags/"]').first()
    const href = await firstTag.getAttribute('href')

    await page.goto(href!, { timeout: 60000 })
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })
})
