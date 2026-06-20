import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Client Portal Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto(`${BASE_URL}/login/`);
    // Wait for hydration
    await page.waitForTimeout(1500);
  });

  test('should allow toggling between login and registration mode', async ({ page }) => {
    // 1. Initially should show "Access Your Account"
    await expect(page.locator('h2')).toContainText('Access Your Account');

    // 2. Click on "Don't have an account? Sign Up" link
    await page.getByRole('button', { name: "Don't have an account? Sign Up" }).click();

    // 3. Header should update to "Create Your Account"
    await expect(page.locator('h2')).toContainText('Create Your Account');

    // 4. Click back to Log In mode
    await page.getByRole('button', { name: 'Already have an account? Log In' }).click();

    // 5. Header should switch back to "Access Your Account"
    await expect(page.locator('h2')).toContainText('Access Your Account');
  });

  test('should show validation warnings on sign up mode with weak password', async ({ page }) => {
    // Switch to sign up mode
    await page.getByRole('button', { name: "Don't have an account? Sign Up" }).click();

    // Fill registration details with weak password
    await page.getByPlaceholder('e.g. John Doe').fill('Alex Mercer');
    await page.getByPlaceholder('john@example.com').fill('alex@example.com');
    await page.getByPlaceholder('At least 10 characters').fill('123'); // too short and simple
    await page.getByPlaceholder('Re-enter password').fill('123');

    // Sign up button should be disabled due to password strength score < 5
    const signUpButton = page.getByRole('button', { name: 'Sign Up' });
    await expect(signUpButton).toBeDisabled();

    // Password strength check indicator should show "Weak"
    await expect(page.getByText('Weak')).toBeVisible();
  });

  test('should handle mock Google OAuth authentication successfully', async ({ page }) => {
    // Mock the backend API response to avoid database dependencies during local testing
    await page.route('**/api/auth/google', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'usr_mock123', email: 'alex.dev@gmail.com', name: 'ALEX.DEV', provider: 'google' }
        })
      });
    });

    // Click Continue with Google button
    await page.getByRole('button', { name: 'Continue with Google' }).click();

    // Dialog popup should appear
    await expect(page.getByText('Sign in with Google')).toBeVisible();

    // Click on the first mock account (Alex Mercer)
    await page.getByRole('button', { name: /Alex Mercer/ }).click();

    // Verify successful login redirects user to their dashboard page
    await page.waitForURL(/.*\/dashboard/, { timeout: 8000 });
  });
});
