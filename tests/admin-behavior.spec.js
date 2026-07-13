import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Admin Console Security and Dashboard Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the admin page before each test
    await page.goto(`${BASE_URL}/admin/`);
    // Wait for hydration
    await page.waitForTimeout(1500);
  });

  test('should restrict access and show error for invalid passcode', async ({ page }) => {
    // 1. Verify administrator login page is shown
    await expect(page.locator('h1')).toContainText('Administrator Login');

    // 2. Input an invalid passcode
    const passcodeField = page.getByPlaceholder('Enter passcode');
    await passcodeField.fill('wrongpasscode');

    // 3. Submit login form
    await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();

    // 4. Assert error message is visible
    await expect(page.getByText('Invalid passcode. Please try again.')).toBeVisible({ timeout: 15000 });
  });

  test('should allow access and toggle dashboard tabs on correct passcode', async ({ page }) => {
    // 1. Verify administrator login page is shown
    await expect(page.locator('h1')).toContainText('Administrator Login');

    // 2. Input the correct passcode (default admin123)
    const passcodeField = page.getByPlaceholder('Enter passcode');
    await passcodeField.fill('admin123');

    // 3. Submit login form
    await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();

    // 4. Verify user gains access and is on Visual Analytics tab by default
    await expect(page.getByRole('button', { name: /Visual Analytics/ })).toBeVisible({ timeout: 30000 });

    // 5. Click the Leads Database tab button
    const leadsTabButton = page.getByRole('button', { name: /Leads Database/ });
    await expect(leadsTabButton).toBeVisible();
    await leadsTabButton.click();

    // Verify Leads Database heading is now visible
    await expect(page.getByRole('heading', { name: 'Leads Database' })).toBeVisible({ timeout: 30000 });

    // 6. Navigate to settings tab
    const settingsTabButton = page.getByRole('button', { name: /Dashboard Settings/ });
    await settingsTabButton.click();

    // 7. Verify settings form elements appear
    await expect(page.getByRole('button', { name: 'Save Changes & Settings' })).toBeVisible();
  });
});
