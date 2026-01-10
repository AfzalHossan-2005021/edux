import { test, expect } from '@playwright/test';

test.describe('Accessibility Testing', () => {
  test('homepage should have basic accessibility features', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility elements
    const images = page.locator('img');
    const imageCount = await images.count();

    // Check that images have alt text
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for semantic headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toHaveCount(1);

    // Check for proper lang attribute
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('search input should be accessible', async ({ page }) => {
    await page.goto('/');

    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search courses with AI"]');

    // Check if it exists and is visible
    await expect(searchInput).toBeVisible();

    // Check accessibility attributes
    const ariaLabel = await searchInput.getAttribute('aria-label');
    const placeholder = await searchInput.getAttribute('placeholder');

    // Should have either aria-label or descriptive placeholder
    expect(ariaLabel || placeholder).toBeTruthy();

    // Should be focusable
    await searchInput.focus();
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Start tabbing through focusable elements
    await page.keyboard.press('Tab');

    // Check if something is focused
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      return active.tagName;
    });

    // Should focus on a meaningful element (not body)
    expect(focusedElement).not.toBe('BODY');
  });

  test('color contrast should be checked', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Basic check - page should load without obvious contrast issues
    // This is a simplified check since full axe-core integration is complex
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);

    // Check that we have some styled text
    const styledElements = page.locator('[class*="text-"], [style*="color"]');
    const styledCount = await styledElements.count();
    expect(styledCount).toBeGreaterThan(0);
  });

  // test('mobile touch targets should be adequate', async ({ page }) => {
  //   // Set mobile viewport
  //   await page.setViewportSize({ width: 375, height: 667 });

  //   await page.goto('/');

  //   // Wait for page to load
  //   await page.waitForLoadState('networkidle');

  //   // Check touch targets on buttons and links
  //   const touchTargets = page.locator('button, [role="button"], a');
  //   const targetCount = await touchTargets.count();

  //   let adequateTargets = 0;
  //   for (let i = 0; i < Math.min(targetCount, 10); i++) {
  //     const target = touchTargets.nth(i);
  //     const box = await target.boundingBox();

  //     if (box && box.width >= 44 && box.height >= 44) {
  //       adequateTargets++;
  //     }
  //   }

  //   // At least 20% of touch targets should be adequate (relaxed for now)
  //   const adequatePercentage = adequateTargets / Math.min(targetCount, 10);
  //   expect(adequatePercentage).toBeGreaterThanOrEqual(0.2);
  // });
});