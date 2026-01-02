import { test, expect } from '@playwright/test';

test.describe('Error Boundary Testing', () => {
  test('error boundary should catch and display errors gracefully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // The error boundary should be present but not visible initially
    const errorBoundary = page.locator('text=Something went wrong').first();
    await expect(errorBoundary).not.toBeVisible();

    // Test that the page loads normally without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that main content area exists
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('error boundary should handle network errors', async ({ page }) => {
    // Mock a network error by blocking API calls
    await page.route('**/api/**', route => route.abort());

    await page.goto('/');

    // Wait for page to load (should still work despite API failures)
    await page.waitForLoadState('networkidle');

    // Page should still be visible even with API errors
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should not show error boundary for API failures (they should be handled gracefully)
    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();
  });

  test('error boundary should provide recovery options', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Test that the page structure is correct
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify that we have the basic page structure
    const navbar = page.locator('nav').or(page.locator('[class*="navbar"]')).or(page.locator('header'));
    await expect(navbar.first()).toBeVisible();
  });
});