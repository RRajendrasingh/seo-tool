import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ARTIFACTS_DIR = 'C:/Users/rajen/.gemini/antigravity/brain/4d945cfb-b7eb-4082-96a3-28e3d618dc32';

test.describe('Free User & Guest QA Flow Verification', () => {
  test.setTimeout(90000);

  test('should complete guest onboarding, verify upsells/locks, check checkout auth wall, and validate login redirect', async ({ page }) => {
    // ==========================================
    // PATTERN 1: GUEST AUDIT & CONVERSION WALL
    // ==========================================
    
    // 1. Visit homepage as unauthenticated guest
    console.log('Navigating to homepage...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(1500); // Hydration wait
    
    // Check main heading is visible
    await expect(page.locator('h1')).toContainText('Get Your Website Ready for Google AI & Conversational Search');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step1_guest_homepage.png') });

    // 2. Submit URL for free audit scan
    console.log('Submitting domain gtmetrix.in for scan...');
    const auditInput = page.getByPlaceholder('e.g., mysite.com');
    await auditInput.fill('gtmetrix.in');
    
    const analyzeButton = page.getByRole('button', { name: 'Analyze Now' });
    await analyzeButton.click();
    
    // Verify redirect to /audit?url=...gtmetrix.in...
    await page.waitForURL(/.*\/audit\/\?url=.*gtmetrix\.in.*/, { timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log('Successfully redirected to free audit lander page.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step2_guest_lead_form.png') });

    // Fill out the Guest Lead Capture form
    console.log('Filling out lead capture form...');
    const dynamicEmail = `qa-tester-${Date.now()}@example.com`;
    await page.getByPlaceholder('e.g. John Doe').fill('QA Tester');
    await page.getByPlaceholder('e.g. john@business.com').fill(dynamicEmail);
    await page.locator('input[type="tel"]').fill('9876543210');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step3_guest_lead_filled.png') });

    // Submit Lead form to run the audit
    console.log('Submitting lead form to run audit...');
    await page.locator('button:has-text("Analyze My Website Now")').click();
    
    // Wait for the audit report dashboard to finish loading
    console.log('Waiting for audit report to load...');
    const downloadButton = page.locator('button:has-text("Download Report PDF")').first();
    await expect(downloadButton).toBeVisible({ timeout: 60000 });
    console.log('Audit dashboard loaded successfully.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step4_guest_audit.png') });

    // 3. Click PDF download button to trigger upsell paywall modal
    console.log('Clicking "Download Report PDF" to trigger upgrade modal...');
    await downloadButton.click();
    await page.waitForTimeout(500);
    
    // Verify paywall modal appears
    const paywallModal = page.locator('h3:has-text("Unlock Multi-Engine PDF Report")').first();
    await expect(paywallModal).toBeVisible();
    console.log('Upgrade paywall modal is visible.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step5_guest_paywall_modal.png') });

    // Close paywall modal
    const closeModalButton = page.locator('button:has-text("✕")').first();
    if (await closeModalButton.isVisible()) {
      await closeModalButton.click();
    } else {
      // Click outside or press Escape
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // 4. Verify advanced diagnostic sections show locks
    console.log('Verifying lock icons on advanced engines...');
    // Click on "Server & Security" engine in the desktop sidebar
    const securityAccordion = page.locator('#sidebar-engine-btn-server-security');
    await securityAccordion.click();
    await page.waitForTimeout(500);

    // Verify lock text is visible inside the opened accordion (checking visible elements only)
    const lockText = page.locator('h3:has-text("Details Locked")').filter({ visible: true }).first();
    await expect(lockText).toBeVisible();
    console.log('Verified: Accordion displays Details Locked paywall.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step6_guest_accordion_lock.png') });

    // ==========================================
    // PATTERN 3: CHECKOUT ACCESS WALL FOR GUESTS
    // ==========================================
    
    // 5. Access /checkout directly to ensure guests are blocked
    console.log('Attempting to navigate directly to checkout page as guest...');
    await page.goto(`${BASE_URL}/checkout?url=gtmetrix.in`);
    
    // Verify redirection to /login with redirect query parameters
    console.log('Waiting for login redirection check...');
    await page.waitForURL(/.*\/login\/?\?redirect=.*/, { timeout: 15000 });
    
    // Verify login form is visible
    const loginHeading = page.locator('h1, h2').filter({ hasText: /Access Your Account|Create Your Account/i }).first();
    await expect(loginHeading).toBeVisible();
    console.log('Successfully redirected guest user to login screen.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'free_test_step7_checkout_redirect.png') });
  });
});
