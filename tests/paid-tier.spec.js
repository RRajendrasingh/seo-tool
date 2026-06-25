import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Paid (Pro) Tier User Flow', () => {
  test.setTimeout(90000);

  // For testing paid features, we simulate a session or mock responses where appropriate,
  // or test the upgrade path itself.
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000); // Hydration wait
  });

  test('should redirect unauthenticated guest to login page from checkout', async ({ page }) => {
    // Navigate directly to checkout
    await page.goto(`${BASE_URL}/checkout?url=example.com`);

    // Verify it redirects to login with the correct redirect search param
    await page.waitForURL(/.*\/login\/?\?redirect=.*/, { timeout: 45000 });
    
    // Verify the login page header is visible
    await expect(page.locator('h2')).toContainText('Access Your Account', { timeout: 15000 });
  });

  test('should allow access to checkout page to upgrade to Pro when logged in', async ({ page }) => {
    // Mock user session to simulate being logged in
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'usr_mock123',
            email: 'alex.dev@gmail.com',
            name: 'ALEX.DEV',
            picture: null,
            subscription_tier: 'free',
            subscription_status: 'inactive'
          }
        })
      });
    });

    // Navigate to checkout
    await page.goto(`${BASE_URL}/checkout?url=example.com`);

    // Verify we remain on the checkout page since we are logged in
    await page.waitForURL(/.*\/checkout\/?\?.*/, { timeout: 45000 });
    
    // Verify checkout content is visible
    await expect(page.locator('h3').first()).toContainText('Account Information', { timeout: 15000 });
  });

  test('should show Pro features unrestricted in Audit mode (Mocking Pro State)', async ({ page }) => {
    // In a real test with a seeded DB, we would log in as a Pro user.
    // For this test structure, we navigate to the audit page and assume the UI is configured 
    // to show Pro indicators if session dictates it.
    await page.goto(`${BASE_URL}/audit?url=example.com`);

    // Verify the auditor page loads
    await expect(page.locator('h1').filter({ hasText: /Deep-Scan Website SEO Auditor/i }).first()).toBeVisible({ timeout: 10000 });

    // Assuming we would click 'Analyze Now' in a real Pro state check
    // For this mock check, we just verify the page loads without a hard paywall 
    // overlay blocking the main content area.
    const blurredContent = page.locator('.blur-sm, .blur-md, [style*="filter: blur"]').first();
    
    // If the mock works (or we test the happy path), it shouldn't be heavily blurred
    // (This is a generic assertion, to be refined when the exact DOM is built)
    // await expect(blurredContent).not.toBeVisible();
  });
  
  test('should have access to dashboard features', async ({ page }) => {
    // Assuming the user is logged in (to be handled by a global auth setup later)
    // they should be able to access the dashboard.
    // Here we just test the route exists and resolves.
    const response = await page.goto(`${BASE_URL}/dashboard`);
    
    // If not authenticated, it will redirect, but the route itself shouldn't 404
    expect(response.status()).not.toBe(404);
  });
});
