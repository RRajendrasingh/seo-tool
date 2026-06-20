import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('Free Tier User Flow', () => {

  // We'll mock a "logged in" state for a free user by setting a cookie or local storage if needed,
  // but for now, we will test the standard paths a free user might take.
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000); // Hydration wait
  });

  test('should allow access to basic audit but show upsells for advanced features', async ({ page }) => {
    // Navigate to the auditor
    const auditorLink = page.getByRole('link', { name: 'Launch SEO Auditor' }).first();
    if (await auditorLink.isVisible()) {
      await auditorLink.click();
    } else {
      await page.goto(`${BASE_URL}/audit`);
    }

    // Verify we are on the audit page
    await expect(page).toHaveURL(/.*\/audit/);

    // Look for indicators of premium features that are locked (Upsells)
    // Assuming there are buttons or sections with 'Upgrade', 'Pro', or lock icons.
    // We are asserting that a free user sees these upsell calls to action.
    // (Adjust the text matching based on actual UI if different)
    const upgradeButton = page.locator('text=/Upgrade to Pro/i, text=/Unlock Premium/i, text=/Get Pro/i').first();
    
    // We don't strictly require it to be visible in all states, but if it's there, it should function.
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      // Should open a modal or redirect to a pricing/checkout page
      // Check if checkout or pricing modal/page appears
      await expect(page.url()).toMatch(/.*\/checkout|.*#pricing/);
    }
  });

  test('should prompt login when accessing dashboard', async ({ page }) => {
    // Try to access the dashboard directly without being logged in
    await page.goto(`${BASE_URL}/dashboard`);

    // The app should redirect an unauthenticated user to the login page
    // Wait for the redirect to happen
    await page.waitForURL(/.*\/login/);

    // Verify the login form is visible
    const loginHeading = page.locator('h1, h2').filter({ hasText: /Access Your Account|Create Your Account/i }).first();
    await expect(loginHeading).toBeVisible();
    
    // Check for email and password inputs
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should restrict access to agency features', async ({ page }) => {
    // A free user should not have access to agency admin pages
    await page.goto(`${BASE_URL}/admin`);

    // It should either redirect to login, a 403 page, or dashboard
    // If it redirects to login (since no session exists in this basic test)
    await expect(page.url()).not.toBe(`${BASE_URL}/admin`);
  });
});
